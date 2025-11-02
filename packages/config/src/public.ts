// ============================================================================
// packages/config/src/public.ts
// CLIENT-SAFE MODULE - Pre-filtered config for browser/renderer use
// ============================================================================

import type { ServerPublicConfig, ClientPublicConfig } from './types'

/**
 * This module contains ONLY public config values.
 * It's safe to import in client-side code (browser/renderer).
 * 
 * Config is injected at build time via Vite's define or import.meta.env
 */

/**
 * Get public server config for browser/client use
 * Safe to import in React components, Astro client code, etc.
 */
export function getServerPublicConfig(): ServerPublicConfig {
  // In development, Vite injects this via define
  if (typeof window !== 'undefined' && '__SERVER_PUBLIC_CONFIG__' in window) {
    return (window as any).__SERVER_PUBLIC_CONFIG__
  }
  
  // Fallback for build-time injection via import.meta.env
  if (typeof (import.meta as any).env !== 'undefined') {
    const env = (import.meta as any).env
    return {
      BASE_URL: env.PUBLIC_BASE_URL || env.BASE_URL,
      API_ENDPOINT: env.PUBLIC_API_ENDPOINT || env.API_ENDPOINT,
      ENABLE_ANALYTICS: env.PUBLIC_ENABLE_ANALYTICS === 'true',
      APP_VERSION: env.PUBLIC_APP_VERSION,
      NODE_ENV: env.MODE || env.NODE_ENV || 'development',
      IS_DEV: env.DEV === true || env.NODE_ENV !== 'production',
      LOG_LEVEL: env.PUBLIC_LOG_LEVEL || 'info',
    } as ServerPublicConfig
  }
  
  throw new Error(
    'Server public config not available. ' +
    'Ensure Vite is configured with: define: { __SERVER_PUBLIC_CONFIG__: ... }'
  )
}

/**
 * Get public client config for renderer process
 * Safe to import in Electron renderer components
 */
export function getClientPublicConfig(): ClientPublicConfig {
  // Should be exposed via preload script
  if (typeof window !== 'undefined' && '__CLIENT_PUBLIC_CONFIG__' in window) {
    return (window as any).__CLIENT_PUBLIC_CONFIG__
  }
  
  throw new Error(
    'Client public config not available. ' +
    'Ensure config is exposed via preload script: contextBridge.exposeInMainWorld("__CLIENT_PUBLIC_CONFIG__", ...)'
  )
}

export type { ServerPublicConfig, ClientPublicConfig }
