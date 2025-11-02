import { mysqlTable, serial, varchar, text, timestamp, json, int, index } from 'drizzle-orm/mysql-core'

export const analytics = mysqlTable('analytics', {
  id: serial('id').primaryKey(),
  eventName: varchar('event_name', { length: 255 }).notNull(),
  eventCategory: varchar('event_category', { length: 100 }), // 'user_action', 'page_view', 'error', etc.
  userId: int('user_id'), // Optional - can track anonymous events
  sessionId: varchar('session_id', { length: 255 }),
  metadata: json('metadata'), // Flexible event data
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 max length
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  eventNameIdx: index('event_name_idx').on(table.eventName),
  categoryIdx: index('category_idx').on(table.eventCategory),
  userIdIdx: index('user_id_idx').on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt), // Time-series queries
}))

export type Analytics = typeof analytics.$inferSelect
export type NewAnalytics = typeof analytics.$inferInsert
