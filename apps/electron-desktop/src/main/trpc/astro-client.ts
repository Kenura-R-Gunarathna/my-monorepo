/**
 * Astro tRPC Proxy Client for Electron
 *
 * This client allows the Electron main process to call the Astro backend's tRPC endpoints
 * Used for background sync when internet is available
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@krag/astro-web/trpc'
import superjson from 'superjson'
import { getPrivateConfig } from '@krag/config/server'

// Get API URL from config
const config = getPrivateConfig()
const ASTRO_API_URL = config.API_ENDPOINT || 'http://localhost:4321/api/trpc'

/**
 * Create Astro tRPC client for background sync
 * This connects to the Astro backend via HTTP
 */
export const astroClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: ASTRO_API_URL,
      transformer: superjson,
      headers() {
        // TODO: Add authentication headers if needed
        // const session = getStoredSession()
        // return {
        //   authorization: `Bearer ${session?.token}`,
        // }
        return {}
      }
    })
  ]
})

/**
 * Network status checker
 * Checks if the Astro backend is reachable
 */
export let isOnline = false
let lastCheckTime = 0
const CHECK_INTERVAL = 30000 // 30 seconds

export async function checkOnline(): Promise<boolean> {
  const now = Date.now()

  // Return cached result if checked recently
  if (now - lastCheckTime < CHECK_INTERVAL) {
    return isOnline
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(ASTRO_API_URL.replace('/api/trpc', '/'), {
      method: 'HEAD',
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    isOnline = response.ok
    lastCheckTime = now

    return isOnline
  } catch {
    isOnline = false
    lastCheckTime = now
    return false
  }
}

/**
 * Start monitoring network status
 * Checks periodically and emits events
 */
export function startNetworkMonitor(callback?: (online: boolean) => void): () => void {
  let wasOnline = isOnline

  const check = async (): Promise<void> => {
    const nowOnline = await checkOnline()

    if (nowOnline !== wasOnline) {
      console.log(`Network status changed: ${nowOnline ? 'ONLINE' : 'OFFLINE'}`)
      wasOnline = nowOnline

      if (callback) {
        callback(nowOnline)
      }
    }
  }

  // Initial check
  check()

  // Check periodically
  const intervalId = setInterval(check, CHECK_INTERVAL)

  return () => clearInterval(intervalId)
}
