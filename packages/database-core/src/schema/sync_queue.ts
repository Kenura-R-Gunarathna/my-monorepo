import { mysqlTable, serial, varchar, json, timestamp, boolean, index, text, int } from 'drizzle-orm/mysql-core'

export const syncQueue = mysqlTable('sync_queue', {
  id: serial('id').primaryKey(),
  operation: varchar('operation', { length: 50 }).notNull(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: varchar('record_id', { length: 255 }).notNull(),
  data: json('data'), // Native JSON type
  synced: boolean('synced').default(false),
  attempts: int('attempts').default(0), // Changed from serial to int
  lastError: text('last_error'), // Error logging
  createdAt: timestamp('created_at').defaultNow(),
  syncedAt: timestamp('synced_at'), // When sync completed
}, (table) => ({
  syncedIdx: index('synced_idx').on(table.synced), // Query optimization
}))

export type SyncQueue = typeof syncQueue.$inferSelect
export type NewSyncQueue = typeof syncQueue.$inferInsert
