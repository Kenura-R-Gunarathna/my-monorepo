import { drizzle } from 'drizzle-orm/libsql';
import { config } from '@krag/config-electron';

const dbFileName = config.DB_FILE_NAME;

if (!dbFileName) {
  throw new Error('DB_FILE_NAME is required. Pass it as parameter or set in environment variables');
}

export * from './schema';
export const dbConn = drizzle(dbFileName!);
