import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  theme: text('theme').notNull().default('light'),
  language: text('language').notNull().default('en'),
  notifications: integer('notifications', { mode: 'boolean' }).notNull().default(true),
  preferences: text('preferences', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  syncedAt: integer('synced_at', { mode: 'timestamp' }),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
