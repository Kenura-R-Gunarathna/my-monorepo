// loader.ts
import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'

export function loadEnv(projectRoot: string = process.cwd()): void {
  // Always try to load the base .env (optional)
  config({ path: join(projectRoot, '.env') })

  const mode = process.env.ASTRO_MODE || 'development'
  const envFile = join(projectRoot, `.env.astro.${mode}`)

  if (existsSync(envFile)) {
    const result = config({ path: envFile })
    if (result.error) {
      console.error(`❌ Failed to load environment file: ${envFile}`)
      throw result.error
    }
    console.log(`✓ Loaded environment: .env.astro.${mode}`)
  } else if (process.env.NODE_ENV === 'production') {
    console.log('✓ Using platform-injected environment variables (no local .env loaded)')
  } else {
    console.warn(`⚠ No env file found for mode: ${mode}`)
    console.warn('Using whatever environment variables are currently set.')
  }
}
