import { useState, useEffect } from 'react'
import { TRPCProvider } from '@krag/react-ui'
import { App as SharedApp } from '@krag/react-ui'
import { SplashScreen } from './components/SplashScreen'
import './window'

function ElectronApp(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true)
  const [initProgress, setInitProgress] = useState(0)
  const [initStatus, setInitStatus] = useState('Starting...')

  useEffect(() => {
    // Listen for installation progress
    if (window.api?.dolt) {
      window.api.dolt.onInstallProgress?.((progress: number) => {
        setInitProgress(progress)
      })

      window.api.dolt.onInstallStatus?.((status: string) => {
        setInitStatus(status)
      })

      window.api.dolt.onInstallComplete?.(() => {
        setInitStatus('Installation complete!')
      })

      window.api.dolt.onInstallError?.((error: string) => {
        setInitStatus(`Error: ${error}`)
      })
    }

    const initializeApp = async (): Promise<void> => {
      try {
        // Step 1: Check if Dolt is installed (10%)
        setInitStatus('Checking Dolt installation...')
        setInitProgress(10)

        if (window.api?.dolt?.checkInstalled) {
          const isInstalled = await window.api.dolt.checkInstalled()

          if (!isInstalled) {
            // Step 2: Install Dolt (10% - 50%)
            setInitStatus('Installing Dolt...')
            await window.api.dolt.install?.()
            setInitProgress(50)
          } else {
            setInitProgress(50)
          }
        } else {
          setInitProgress(50)
        }

        // Step 3: Initialize Dolt repository (60%)
        setInitStatus('Initializing Dolt repository...')
        if (window.api?.dolt?.init) {
          await window.api.dolt.init()
        }
        setInitProgress(60)

        // Step 4: Run migrations (80%)
        setInitStatus('Running database migrations...')
        if (window.api?.migrations?.migrate) {
          await window.api.migrations.migrate()
        }
        setInitProgress(80)

        // Step 5: Check sync status (90%)
        setInitStatus('Checking sync status...')
        if (window.api?.sync?.getStatus) {
          await window.api.sync.getStatus()
        }
        setInitProgress(90)

        // Step 6: Ready (100%)
        setInitStatus('Ready!')
        setInitProgress(100)

        await new Promise((resolve) => setTimeout(resolve, 500))
        setIsLoading(false)
      } catch (error) {
        console.error('Initialization failed:', error)
        setInitStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Still proceed to app after 2 seconds (graceful degradation)
        setTimeout(() => setIsLoading(false), 2000)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return <SplashScreen progress={initProgress} status={initStatus} />
  }

  return (
    <TRPCProvider>
      <SharedApp basepath="/dashboard" platform="electron" />
    </TRPCProvider>
  )
}

export default ElectronApp
