import { loadEnv } from '@/packages/config-astro/loader'
import { astroConfigSchema, type AstroConfig } from '@/packages/config-astro/schema'

// Load environment variables
loadEnv('../..')

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
