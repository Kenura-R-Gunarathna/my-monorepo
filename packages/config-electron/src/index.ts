import { electronConfigSchema, type ElectronConfig } from '@krag/zod-schema'
import { loadEnv } from './loader'

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
