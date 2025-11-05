import { useEffect, useState } from 'react'
import './splash.css'

interface SplashScreenProps {
  progress?: number
  status?: string
  onComplete?: () => void
}

export function SplashScreen({
  progress: externalProgress,
  status: externalStatus,
  onComplete
}: SplashScreenProps): React.JSX.Element {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing...')
  const [dots, setDots] = useState('')

  // Update from external props or use internal state
  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress)
    }
  }, [externalProgress])

  useEffect(() => {
    if (externalStatus !== undefined) {
      setStatus(externalStatus)
    }
  }, [externalStatus])

  // Animated dots for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Auto-complete when progress reaches 100% (if onComplete provided)
  useEffect((): (() => void) | undefined => {
    if (progress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [progress, onComplete])

  return (
    <div className="splash-container">
      <div className="splash-content">
        <div className="splash-logo">
          <div className="logo-circle">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3" />
              <path
                d="M2 17L12 22L22 17M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h1 className="splash-title">My Electron App</h1>

        <div className="splash-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="splash-status">
            {status}
            {dots}
          </p>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>

        <div className="splash-version">v1.0.0</div>
      </div>
    </div>
  )
}
