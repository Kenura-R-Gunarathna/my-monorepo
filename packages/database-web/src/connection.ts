import { drizzle } from 'drizzle-orm/mysql2';
import * as coreSchema from '@krag/database-core/schema';
import * as webSchema from '.';

const schema = { ...coreSchema, ...webSchema };

let db: ReturnType<typeof drizzle> | null = null;

export function getWebDb(DATABASE_URL?: string) {
  if (!db) {
    const dbUrl = DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is required. Pass it as parameter or set in environment variables');
    }
    db = drizzle(dbUrl, { schema, mode: 'default' });
  }
  return db;
}
