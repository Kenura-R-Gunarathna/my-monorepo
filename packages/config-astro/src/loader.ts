import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

export function loadEnv(relativePath: string = '../..') {
  const envPath = resolve(__dirname, relativePath, '.env')
  dotenvConfig({ path: envPath })
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