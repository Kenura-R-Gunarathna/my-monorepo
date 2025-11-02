// ============================================================================
// packages/config/src/server.ts
// Server-specific configuration with security guards
// For: Astro API routes, SSR, Node.js servers, Electron main process
// ============================================================================

// SERVER-ONLY MODULE - DO NOT IMPORT IN CLIENT CODE
// This module contains private data and must never be bundled for the browser

import { resolve } from 'path'
import {
  serverConfigSchema,
  type ServerConfig,
  type ServerPublicConfig,
  type ServerPrivateConfig,
} from './types'
import { loadEnv, transformEnvVars } from './loader'
import { filterPublicConfig, redactSecrets, SECURITY_BOUNDARIES } from './security'
import { guardModule, createDevModeGuard } from './dev-guard'

// 🛡️ Module-level guard (runs once at import)
// Prevents this module from loading at all in browser
guardModule(['nodejs-server', 'electron-main'], '@krag/config/server')

// Load environment variables
const loadedFiles = loadEnv({ rootDir: resolve(__dirname, '../../..') })

// Transform and validate
const transformedEnv = transformEnvVars(process.env)

let config: ServerConfig

try {
  config = serverConfigSchema.parse(transformedEnv)
  
  if (config.IS_DEV) {
    const safeConfig = redactSecrets(config, SECURITY_BOUNDARIES.server.private)
    console.log('✅ Server config loaded:', { 
      files: loadedFiles,
      config: safeConfig 
    })
  }
} catch (error) {
  console.error('❌ Server configuration validation failed:')
  console.error(error)
  process.exit(1)
}

// 🛡️ Function-level guards (check on EVERY call - survives HMR)
const guardPublicConfig = createDevModeGuard<ServerPublicConfig>(
  ['nodejs-server', 'electron-main'],
  '@krag/config/server.getPublicConfig()'
)

const guardPrivateConfig = createDevModeGuard<ServerConfig>(
  ['nodejs-server'],
  '@krag/config/server.getPrivateConfig()'
)

/**
 * Get public config safe for client-side
 * Use this in API endpoints/components that send data to browser
 */
export function getPublicConfig(): ServerPublicConfig {
  return guardPublicConfig(() => {
    return filterPublicConfig(
      config,
      SECURITY_BOUNDARIES.server.public
    ) as ServerPublicConfig
  })
}

/**
 * Get full server config including private data (USE CAREFULLY - never expose to client)
 */
export function getPrivateConfig(): ServerConfig {
  return guardPrivateConfig(() => {
    return config
  })
}

/**
 * Alias for getPrivateConfig - get full server config
 */
export function getServerConfig(): ServerConfig {
  return getPrivateConfig()
}

// HMR handling for Vite dev server
if (typeof (import.meta as any)?.hot !== 'undefined') {
  (import.meta as any).hot.accept(() => {
    console.log('🔄 Server config module hot-reloaded')
  })
  
  // Warn if HMR tries to send to client
  ;(import.meta as any).hot.on('vite:beforeUpdate', () => {
    console.warn('⚠️  Server config received HMR update - ensure no client imports!')
  })
}

export { config }
export type { ServerConfig, ServerPublicConfig, ServerPrivateConfig }
