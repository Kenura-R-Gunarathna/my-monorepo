import { drizzle } from 'drizzle-orm/mysql2';
import { getServerConfig } from '@krag/config/server';

const config = getServerConfig();
const dbUrl = config.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is required. Pass it as parameter or set in environment variables');  
}

export * from './schema';
export const dbConn = drizzle(dbUrl);
