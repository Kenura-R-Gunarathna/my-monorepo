import { drizzle } from 'drizzle-orm/mysql2';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as coreSchema from '@krag/database-core/schema';
import * as desktopSchema from './schema';

const schema = { ...coreSchema, ...desktopSchema };

export type DesktopDb = MySql2Database<typeof schema>;

let db: DesktopDb | null = null;

export function getDesktopDb(DATABASE_URL?: string): DesktopDb {
  if (!db) {
    const dbUrl = DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is required. Pass it as parameter or set in environment variables');
    }
    db = drizzle(dbUrl, { schema, mode: 'default' });
  }
  return db;
}
