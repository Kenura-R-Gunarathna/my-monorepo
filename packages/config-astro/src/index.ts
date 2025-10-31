import { astroConfigSchema, type AstroConfig } from '@krag/zod-schema'
import { loadEnv, prepareEnv } from './loader'

// Load environment variables
loadEnv('../..')

// Apply defaults for missing environment variables
prepareEnv({
  BASE_URL: process.env.BASE_URL || 'http://localhost:4321',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/devdb',
  IS_DEV: process.env.IS_DEV || (process.env.ASTRO_MODE === 'production' ? 'false' : 'true'),
})

// Validate and export config
let config: AstroConfig

try {
  config = astroConfigSchema.parse(process.env)
} catch (error) {
  console.error('❌ Astro configuration validation failed:')
  if (error instanceof Error) {
    console.error(error.message)
  }
  process.exit(1)
}

export { config }
export type { AstroConfig }