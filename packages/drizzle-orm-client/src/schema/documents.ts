import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  header: text('header').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  target: integer('target').notNull(),
  limit: integer('limit').notNull(),
  reviewer: text('reviewer').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
})

export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert
