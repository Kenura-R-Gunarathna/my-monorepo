import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/packages/react-ui/styles/globals.css'
import App from '@/packages/react-ui/App.tsx'
import '@/packages/react-ui/styles/globals.css';

export { Card } from '@/packages/react-ui/components/ui/card';
export { Button } from '@/packages/react-ui/components/ui/button';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
