import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Sync Queue - stores pending operations when offline
 * These will be synced to the Astro backend when connection is restored
 */
export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  operation: text('operation').notNull(), // 'create', 'update', 'delete'
  entity: text('entity').notNull(), // 'documents', 'users', 'roles', etc.
  data: text('data', { mode: 'json' }).notNull(), // The operation data as JSON
  localId: text('local_id'), // Local record ID if applicable
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  attempts: integer('attempts').default(0).notNull(),
  lastError: text('last_error'),
})

export type SyncQueueItem = typeof syncQueue.$inferSelect
export type NewSyncQueueItem = typeof syncQueue.$inferInsert
