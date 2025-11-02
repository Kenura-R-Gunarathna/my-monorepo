// ============================================================================
// packages/config/src/types.ts
// Centralized type definitions with security classifications
// ============================================================================

import { z } from 'zod'

/**
 * Security classification for configuration values
 * - PUBLIC: Can be exposed to client-side code
 * - PRIVATE: Server/main process only, contains sensitive data
 */
export type SecurityLevel = 'PUBLIC' | 'PRIVATE'

/**
 * Runtime environment types
 */
export type RuntimeEnv = 'development' | 'production' | 'test'
export type Platform = 'server' | 'client' | 'shared'



// ============================================================================
// SHARED CONFIGURATION (Both Server & Client)
// ============================================================================

export const sharedConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  IS_DEV: z.boolean().default(true),
})

export type SharedConfig = z.infer<typeof sharedConfigSchema>



// ============================================================================
// SERVER CONFIGURATION (Web Server / Electron Main)
// ============================================================================

/**
 * Public config - Safe to expose to client (browser/renderer)
 */
export const serverPublicConfigSchema = z.object({
  BASE_URL: z.string().url(),
  API_ENDPOINT: z.string().url(),
  ENABLE_ANALYTICS: z.boolean().default(false),
  APP_VERSION: z.string().optional(),
})

/**
 * Private config - NEVER send to client
 */
export const serverPrivateConfigSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_MIN: z.number().int().positive().default(2),
  DATABASE_POOL_MAX: z.number().int().positive().default(10),
  
  // Auth
  BETTER_AUTH_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  
  // API Keys (PRIVATE)
  RESEND_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // OAuth Credentials (PRIVATE)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Rate limiting
  RATE_LIMIT_ENABLED: z.boolean().default(true),
  RATE_LIMIT_MAX_REQUESTS: z.number().int().positive().default(100),
})

export const serverConfigSchema = sharedConfigSchema
  .merge(serverPublicConfigSchema)
  .merge(serverPrivateConfigSchema)

export type ServerPublicConfig = z.infer<typeof serverPublicConfigSchema> & Pick<SharedConfig, 'NODE_ENV' | 'IS_DEV' | 'LOG_LEVEL'>
export type ServerPrivateConfig = z.infer<typeof serverPrivateConfigSchema>
export type ServerConfig = z.infer<typeof serverConfigSchema>



// ============================================================================
// CLIENT CONFIGURATION (Browser / Electron Renderer)
// ============================================================================

/**
 * Public client config - Safe for client-side use
 */
export const clientPublicConfigSchema = z.object({
  API_URL: z.string().url(),
  ASTRO_BASE_URL: z.string().url().default('http://localhost:4321'),
  WINDOW_WIDTH: z.number().int().positive().default(1200),
  WINDOW_HEIGHT: z.number().int().positive().default(800),
  ENABLE_DEV_TOOLS: z.boolean().default(false),
  RENDERER_DEV_URL: z.string().url().optional(), // Vite dev server URL for Electron renderer
})

/**
 * Private client config - Only for server/main process
 * (e.g., Electron main process private config)
 */
export const clientPrivateConfigSchema = z.object({
  // Local database
  DB_FILE_NAME: z.string().default('app.db'),
  DB_ENCRYPTION_KEY: z.string().optional(), // For encrypted SQLite
  
  // Updates
  AUTO_UPDATE_URL: z.string().url().optional(),
  AUTO_UPDATE_ENABLED: z.boolean().default(false),
  
  // Security
  ENABLE_CONTEXT_ISOLATION: z.boolean().default(true),
  ENABLE_NODE_INTEGRATION: z.boolean().default(false),
  
  // Licensing (if applicable)
  LICENSE_KEY: z.string().optional(),
  
  // Hardware access
  ENABLE_CAMERA: z.boolean().default(false),
  ENABLE_MICROPHONE: z.boolean().default(false),
})

export const clientConfigSchema = sharedConfigSchema
  .merge(clientPublicConfigSchema)
  .merge(clientPrivateConfigSchema)

export type ClientPublicConfig = z.infer<typeof clientPublicConfigSchema> & Pick<SharedConfig, 'NODE_ENV' | 'IS_DEV' | 'LOG_LEVEL'>
export type ClientPrivateConfig = z.infer<typeof clientPrivateConfigSchema>
export type ClientConfig = z.infer<typeof clientConfigSchema>
