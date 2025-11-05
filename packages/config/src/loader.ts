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
 * Interpolate environment variables in the format ${VAR_NAME} or {VAR_NAME}
 * Similar to Laravel's env variable interpolation
 */
export function interpolateEnvVars(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const interpolated: Record<string, string> = {}
  
  // First pass: copy all values
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') {
      interpolated[key] = value
    }
  }
  
  // Second pass: interpolate variables (support multiple passes for nested references)
  let hasChanges = true
  let maxIterations = 10 // Prevent infinite loops
  
  while (hasChanges && maxIterations > 0) {
    hasChanges = false
    maxIterations--
    
    for (const [key, value] of Object.entries(interpolated)) {
      if (typeof value !== 'string') continue
      
      // Match both ${VAR} and {VAR} patterns
      const interpolatedValue = value.replace(/\$?\{([^}]+)\}/g, (match, varName) => {
        const replacement = interpolated[varName.trim()]
        if (replacement !== undefined) {
          hasChanges = true
          return replacement
        }
        // Keep original if variable not found
        return match
      })
      
      if (interpolatedValue !== value) {
        interpolated[key] = interpolatedValue
      }
    }
  }
  
  return interpolated as NodeJS.ProcessEnv
}

/**
 * Transform string env vars to typed values
 */
export function transformEnvVars(env: NodeJS.ProcessEnv): Record<string, any> {
  // First interpolate any variable references
  const interpolated = interpolateEnvVars(env)
  
  return {
    ...interpolated,
    // Booleans
    IS_DEV: interpolated.IS_DEV === 'true' || interpolated.NODE_ENV !== 'production',
    ENABLE_ANALYTICS: interpolated.ENABLE_ANALYTICS === 'true',
    ENABLE_DEV_TOOLS: interpolated.ENABLE_DEV_TOOLS === 'true',
    RATE_LIMIT_ENABLED: interpolated.RATE_LIMIT_ENABLED !== 'false',
    AUTO_UPDATE_ENABLED: interpolated.AUTO_UPDATE_ENABLED === 'true',
    ENABLE_CONTEXT_ISOLATION: interpolated.ENABLE_CONTEXT_ISOLATION !== 'false',
    ENABLE_NODE_INTEGRATION: interpolated.ENABLE_NODE_INTEGRATION === 'true',
    ENABLE_CAMERA: interpolated.ENABLE_CAMERA === 'true',
    ENABLE_MICROPHONE: interpolated.ENABLE_MICROPHONE === 'true',
    
    // Numbers
    WINDOW_WIDTH: interpolated.WINDOW_WIDTH ? parseInt(interpolated.WINDOW_WIDTH, 10) : 1200,
    WINDOW_HEIGHT: interpolated.WINDOW_HEIGHT ? parseInt(interpolated.WINDOW_HEIGHT, 10) : 800,
    DATABASE_POOL_MIN: interpolated.DATABASE_POOL_MIN ? parseInt(interpolated.DATABASE_POOL_MIN, 10) : 2,
    DATABASE_POOL_MAX: interpolated.DATABASE_POOL_MAX ? parseInt(interpolated.DATABASE_POOL_MAX, 10) : 10,
    RATE_LIMIT_MAX_REQUESTS: interpolated.RATE_LIMIT_MAX_REQUESTS ? parseInt(interpolated.RATE_LIMIT_MAX_REQUESTS, 10) : 100,
  }
}
