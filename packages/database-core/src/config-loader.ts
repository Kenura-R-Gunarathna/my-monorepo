/**
 * Dynamic config loader that supports both Astro and Electron environments
 * Usage: Set APP_ENV=astro or APP_ENV=electron before running commands
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

type AppEnvironment = 'astro' | 'electron';

export interface Config {
  DATABASE_URL: string;
  [key: string]: any;
}

export async function loadConfig(): Promise<Config> {
  const appEnv = (process.env.APP_ENV || 'astro') as AppEnvironment;
  const workspaceRoot = resolve(process.cwd(), '..', '..');
  
  // First load .env to get the mode
  dotenv.config({ path: resolve(workspaceRoot, '.env') });
  
  // Determine the mode and env file
  const mode = appEnv === 'electron' 
    ? (process.env.ELECTRON_MODE || 'development')
    : (process.env.ASTRO_MODE || 'production');
  
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
  
  return {
    DATABASE_URL,
    ...process.env,
  };
}

export function getAppEnv(): AppEnvironment {
  return (process.env.APP_ENV || 'astro') as AppEnvironment;
}
