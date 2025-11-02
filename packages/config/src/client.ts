// ============================================================================
// packages/config/src/client.ts
// Client-specific configuration (for Electron desktop app config)
// For: Electron process configuration (NOT for renderer/browser)
// ============================================================================

// PROCESS ONLY - DO NOT IMPORT IN RENDERER/BROWSER
// This module is for Electron process desktop app configuration

import { resolve } from 'path'
import {
  clientConfigSchema,
  type ClientConfig,
  type ClientPublicConfig,
  type ClientPrivateConfig,
} from './types'
import { loadEnv, transformEnvVars } from './loader'
import { filterPublicConfig, redactSecrets, SECURITY_BOUNDARIES } from './security'
import { guardModule, createDevModeGuard } from './dev-guard'

// 🛡️ Module-level guard (runs once at import)
// Prevents this module from loading in renderer/browser
guardModule(['nodejs-server', 'electron-main'], '@krag/config/client')

// Load environment variables
const loadedFiles = loadEnv({ rootDir: resolve(__dirname, '../../..') })

// Transform and validate
const transformedEnv = transformEnvVars(process.env)

let config: ClientConfig

try {
  config = clientConfigSchema.parse(transformedEnv)
  
  if (config.IS_DEV) {
    const safeConfig = redactSecrets(config, SECURITY_BOUNDARIES.client.private)
    console.log('✅ Client config loaded:', {
      files: loadedFiles,
      config: safeConfig
    })
  }
} catch (error) {
  console.error('❌ Client configuration validation failed:')
  console.error(error)
  process.exit(1)
}

// 🛡️ Function-level guards (check on EVERY call - survives HMR)
const guardPublicConfig = createDevModeGuard<ClientPublicConfig>(
  ['nodejs-server', 'electron-main'],
  '@krag/config/client.getPublicConfig()'
)

const guardPrivateConfig = createDevModeGuard<ClientConfig>(
  ['electron-main'],
  '@krag/config/client.getPrivateConfig()'
)

/**
 * Get public config safe for renderer process
 * Use this when sending config to renderer via IPC/preload
 */
export function getPublicConfig(): ClientPublicConfig {
  return guardPublicConfig(() => {
    return filterPublicConfig(
      config,
      SECURITY_BOUNDARIES.client.public
    ) as ClientPublicConfig
  })
}

/**
 * Get full client config including private data (USE CAREFULLY)
 */
export function getPrivateConfig(): ClientConfig {
  return guardPrivateConfig(() => {
    return config
  })
}

/**
 * Alias for getPrivateConfig - get full config
 */
export function getConfig(): ClientConfig {
  return getPrivateConfig()
}

// HMR handling for Vite dev server
if (typeof (import.meta as any)?.hot !== 'undefined') {
  (import.meta as any).hot.accept(() => {
    console.log('🔄 Client config module hot-reloaded')
  })
  
  // Warn if HMR tries to send to renderer
  ;(import.meta as any).hot.on('vite:beforeUpdate', () => {
    console.warn('⚠️  Client config received HMR update - ensure no renderer imports!')
  })
}

export { config }
export type { ClientConfig, ClientPublicConfig, ClientPrivateConfig }
