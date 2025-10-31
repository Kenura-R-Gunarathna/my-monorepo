import { TRPCProvider } from '@krag/react-ui/providers/TRPCProvider';
import { App as SharedApp } from '@krag/react-ui';

function ElectronApp() {
  return (
    <TRPCProvider>
      <SharedApp basepath="/dashboard" platform="electron" />
    </TRPCProvider>
  );
}

export default ElectronApp;
