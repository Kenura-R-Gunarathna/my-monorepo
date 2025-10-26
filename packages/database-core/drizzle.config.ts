import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables based on APP_ENV
const appEnv = process.env.APP_ENV || 'astro';
const workspaceRoot = resolve(process.cwd(), '..', '..');

// First load .env to get the mode
dotenv.config({ path: resolve(workspaceRoot, '.env') });

// Determine the mode and env file
const mode = appEnv === 'electron' 
  ? (process.env.ELECTRON_MODE || 'development')
  : (process.env.ASTRO_MODE || 'development');

const envFile = `.env.${appEnv}.${mode}`;
const envPath = resolve(workspaceRoot, envFile);

// Load the specific env file
const result = dotenv.config({ path: envPath });

if (result.error) {
  throw new Error(
    `Failed to load ${envFile}. ` +
    `Make sure the file exists at workspace root. ` +
    `Current APP_ENV: ${appEnv}, MODE: ${mode}`
  );
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    `DATABASE_URL not found in ${envFile}. ` +
    `Current APP_ENV: ${appEnv}, MODE: ${mode}`
  );
}

console.log(`✓ Loaded config from ${envFile} for APP_ENV=${appEnv}, MODE=${mode}`);

export default defineConfig({
  out: './drizzle',
  schema: './src/schema/*.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
