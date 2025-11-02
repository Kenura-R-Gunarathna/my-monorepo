import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const documents = mysqlTable('documents', {
  id: int('id').primaryKey().autoincrement(),
  header: varchar('header', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  target: int('target').notNull(),
  limit: int('limit').notNull(),
  reviewer: varchar('reviewer', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
})

export type Document = typeof documents.$inferSelect
export type NewDocument = typeof documents.$inferInsert
