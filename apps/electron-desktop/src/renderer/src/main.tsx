import './assets/main.css'

import { createRoot } from 'react-dom/client'
import { App } from '@krag/react-ui'

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(<App />)
}
