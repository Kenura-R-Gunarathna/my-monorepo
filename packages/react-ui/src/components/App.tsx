import { StrictMode } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import type { User, Session } from '@krag/zod-schema'
import { setPlatform } from '../lib/trpc'

export interface AppProps {
  basepath?: string;
  platform?: 'astro' | 'electron';
  initialSession?: {
    user: User;
    session: Session;
  } | null;
}

export function App({ basepath, platform = 'astro', initialSession }: AppProps = {}) {
  // Set platform for trpc client detection
  setPlatform(platform);
  
  // Create a new router instance with optional basepath
  const router = createRouter({ 
    routeTree,
    basepath: basepath || '/',
    context: {
      platform,
      initialSession,
    },
  })

  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
