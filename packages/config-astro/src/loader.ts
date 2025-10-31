import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

export function loadEnv(relativePath: string = '../..') {
  const envPath = resolve(__dirname, relativePath, '.env')
  dotenvConfig({ path: envPath })
}

/**
 * Get environment variable with fallback to process.env and default value
 */
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  // First try the loaded .env value
  let value = process.env[key]
  
  // If not found and default provided, use default
  if (value === undefined && defaultValue !== undefined) {
    console.warn(`⚠️  ${key} not found in environment, using default: ${defaultValue}`)
    value = defaultValue
  }
  
  return value
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