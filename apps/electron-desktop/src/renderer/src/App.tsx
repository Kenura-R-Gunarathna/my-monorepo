import { TRPCProvider } from '@krag/react-ui'
import { App as SharedApp } from '@krag/react-ui'

function ElectronApp(): React.JSX.Element {
  return (
    <TRPCProvider>
      <SharedApp basepath="/dashboard" platform="electron" />
    </TRPCProvider>
  )
}

export default ElectronApp
