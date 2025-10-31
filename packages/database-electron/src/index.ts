import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { config } from '@krag/config-electron';

const dbFileName = config.DB_FILE_NAME;

if (!dbFileName) {
  throw new Error('DB_FILE_NAME is required. Pass it as parameter or set in environment variables');
}

// Create libsql client for local SQLite file
const client = createClient({
  url: `file:${dbFileName}`,
});

export * from './schema';
export const dbConn = drizzle(client);

// Export electron store utilities
export * from './lib/electron-store';
