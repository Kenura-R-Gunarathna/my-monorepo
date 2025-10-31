import { electronConfigSchema, type ElectronConfig } from '@krag/zod-schema'
import { loadEnv, prepareEnv } from './loader'

// Load environment variables
loadEnv('../..')

// Apply defaults for missing environment variables
prepareEnv({
  API_URL: process.env.API_URL || 'http://localhost:4321',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_FILE_NAME: process.env.DB_FILE_NAME || 'app.db',
  WINDOW_WIDTH: process.env.WINDOW_WIDTH || '1200',
  WINDOW_HEIGHT: process.env.WINDOW_HEIGHT || '800',
  IS_DEV: process.env.IS_DEV || (process.env.ELECTRON_MODE === 'production' ? 'false' : 'true'),
})

// Validate and export config
let config: ElectronConfig

try {
  config = electronConfigSchema.parse(process.env)
} catch (error) {
  console.error('❌ Electron configuration validation failed:')
  if (error instanceof Error) {
    console.error(error.message)
  }
  process.exit(1)
}

export { config }
export type { ElectronConfig }