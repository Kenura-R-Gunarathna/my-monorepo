import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@krag/react-ui'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      
      {/* React UI Components Demo */}
      <div className="mt-8 space-y-4 max-w-md w-full px-4">
        <Card>
          <CardHeader>
            <CardTitle>React UI Components</CardTitle>
            <CardDescription>Using components from @krag/react-ui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={() => console.log('Button clicked!')}>
                Click me!
              </Button>
              <Button variant="outline" onClick={ipcHandle}>
                Send IPC Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
