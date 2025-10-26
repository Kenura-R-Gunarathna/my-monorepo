import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';
import { loadConfig } from './config-loader';

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb(DATABASE_URL?: string) {
  if (!db) {
    let dbUrl = DATABASE_URL;
    
    // If no DATABASE_URL provided, load from config based on APP_ENV
    if (!dbUrl) {
      const config = await loadConfig();
      dbUrl = config.DATABASE_URL;
    }
    
    if (!dbUrl) {
      throw new Error(
        'DATABASE_URL is required. Pass it as parameter or set in config. ' +
        'Use APP_ENV=astro or APP_ENV=electron to specify environment.'
      );
    }
    
    db = drizzle(dbUrl, { schema, mode: 'default' });
  }
  return db;
}
