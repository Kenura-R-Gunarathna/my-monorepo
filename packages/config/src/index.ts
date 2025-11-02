// ============================================================================
// packages/config/src/index.ts
// Main entry point - exports utilities only (not config values)
// ============================================================================

export { createDevModeGuard, guardModule } from './dev-guard'
export { 
  filterPublicConfig, 
  redactSecrets, 
  assertPublicAccess,
  SECURITY_BOUNDARIES 
} from './security'
export { configSecurityPlugin } from './vite-plugin-config-security'
export type { ConfigSecurityOptions } from './vite-plugin-config-security'
export { loadEnv, transformEnvVars } from './loader'
export type { LoadEnvOptions } from './loader'

// Re-export types for convenience
export type {
  SecurityLevel,
  RuntimeEnv,
  Platform,
  SharedConfig,
  ServerPublicConfig,
  ServerPrivateConfig,
  ServerConfig,
  ClientPublicConfig,
  ClientPrivateConfig,
  ClientConfig,
} from './types'

// Re-export schemas for advanced usage
export {
  sharedConfigSchema,
  serverPublicConfigSchema,
  serverPrivateConfigSchema,
  serverConfigSchema,
  clientPublicConfigSchema,
  clientPrivateConfigSchema,
  clientConfigSchema,
} from './types'
