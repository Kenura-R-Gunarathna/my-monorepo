import { drizzle } from 'drizzle-orm/libsql';
import { app } from 'electron';
import { join } from 'path';

// Get user data directory path
const dbPath = join(app.getPath('userData'), 'app.db');

// Initialize database with file path
export const db = drizzle(`file:${dbPath}`);

// Export all schemas
export * from './schema';
