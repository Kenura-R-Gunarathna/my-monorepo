import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  event: text('event').notNull(),
  properties: text('properties', { mode: 'json' }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  sessionId: text('session_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  syncedAt: integer('synced_at', { mode: 'timestamp' }),
});

export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;
