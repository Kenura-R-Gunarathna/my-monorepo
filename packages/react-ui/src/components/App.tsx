import { StrictMode } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

export interface AppProps {
  basepath?: string
}

export function App({ basepath }: AppProps = {}) {
  // Create a new router instance with optional basepath
  const router = createRouter({ 
    routeTree,
    basepath: basepath || '/',
  })

  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
