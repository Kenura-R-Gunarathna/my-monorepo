import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'

export function loadEnv(projectRoot: string = process.cwd()): void {
  // First, load the main .env file to get ELECTRON_MODE
  config({ path: join(projectRoot, '.env') })
  
  const mode = process.env.ELECTRON_MODE || 'development'
  
  // Construct the target env file path
  const envFile = join(projectRoot, `.env.electron.${mode}`)
  
  if (!existsSync(envFile)) {
    throw new Error(
      `Environment file not found: ${envFile}\n` +
      `Make sure ELECTRON_MODE is set in .env and the corresponding .env.electron.${mode} file exists.`
    )
  }
  
  // Load the specific env file
  const result = config({ path: envFile })
  
  if (result.error) {
    throw new Error(`Failed to load environment file: ${envFile}\n${result.error.message}`)
  }
  
  console.log(`✓ Loaded Electron environment: .env.electron.${mode}`)
}
