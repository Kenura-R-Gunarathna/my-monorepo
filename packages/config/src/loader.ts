// ============================================================================
// packages/config/src/loader.ts
// Environment loading utilities
// ============================================================================

import { config as dotenvConfig } from 'dotenv'
import { join } from 'path'
import { existsSync } from 'fs'

export interface LoadEnvOptions {
  rootDir?: string
  envFile?: string
  required?: boolean
  override?: boolean
}

/**
 * Load .env files with cascading priority:
 * 1. .env (committed defaults, lowest priority)
 * 2. .env.[NODE_ENV] (environment-specific)
 * 3. .env.[NODE_ENV].local (git-ignored, environment-specific)
 * 4. .env.local (git-ignored, highest priority)
 */
export function loadEnv(options: LoadEnvOptions = {}) {
  const {
    rootDir = process.cwd(),
    required = false,
    override = false,
  } = options

  const nodeEnv = process.env.NODE_ENV || 'development'
  
  // Files to load in order (last loaded wins if override=true)
  const envFiles = [
    '.env',
    `.env.${nodeEnv}`,
    `.env.${nodeEnv}.local`,
    '.env.local',
  ]

  const loadedFiles: string[] = []

  for (const file of envFiles) {
    const envPath = join(rootDir, file)
    
    if (existsSync(envPath)) {
      dotenvConfig({ path: envPath, override })
      loadedFiles.push(file)
    }
  }

  if (required && loadedFiles.length === 0) {
    throw new Error(`No .env files found in ${rootDir}`)
  }

  return loadedFiles
}

/**
 * Prepare environment with defaults before validation
 */
export function prepareEnv(defaults: Record<string, string>) {
  Object.entries(defaults).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue
    }
  })
}

/**
 * Transform string env vars to typed values
 */
export function transformEnvVars(env: NodeJS.ProcessEnv): Record<string, any> {
  return {
    ...env,
    // Booleans
    IS_DEV: env.IS_DEV === 'true' || env.NODE_ENV !== 'production',
    ENABLE_ANALYTICS: env.ENABLE_ANALYTICS === 'true',
    ENABLE_DEV_TOOLS: env.ENABLE_DEV_TOOLS === 'true',
    RATE_LIMIT_ENABLED: env.RATE_LIMIT_ENABLED !== 'false',
    AUTO_UPDATE_ENABLED: env.AUTO_UPDATE_ENABLED === 'true',
    ENABLE_CONTEXT_ISOLATION: env.ENABLE_CONTEXT_ISOLATION !== 'false',
    ENABLE_NODE_INTEGRATION: env.ENABLE_NODE_INTEGRATION === 'true',
    ENABLE_CAMERA: env.ENABLE_CAMERA === 'true',
    ENABLE_MICROPHONE: env.ENABLE_MICROPHONE === 'true',
    
    // Numbers
    WINDOW_WIDTH: env.WINDOW_WIDTH ? parseInt(env.WINDOW_WIDTH, 10) : 1200,
    WINDOW_HEIGHT: env.WINDOW_HEIGHT ? parseInt(env.WINDOW_HEIGHT, 10) : 800,
    DATABASE_POOL_MIN: env.DATABASE_POOL_MIN ? parseInt(env.DATABASE_POOL_MIN, 10) : 2,
    DATABASE_POOL_MAX: env.DATABASE_POOL_MAX ? parseInt(env.DATABASE_POOL_MAX, 10) : 10,
    RATE_LIMIT_MAX_REQUESTS: env.RATE_LIMIT_MAX_REQUESTS ? parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10) : 100,
  }
}
