import { loadEnv } from './loader'
import { electronConfigSchema, type ElectronConfig } from './schema'

// Load environment variables
loadEnv('../..')

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
