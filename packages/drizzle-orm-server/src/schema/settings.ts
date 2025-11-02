import { mysqlTable, serial, varchar, text, timestamp, boolean, json, index } from 'drizzle-orm/mysql-core'

export const settings = mysqlTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: json('value').notNull(), // Flexible value type (string, number, object, etc.)
  category: varchar('category', { length: 100 }), // Group related settings
  description: text('description'),
  isPublic: boolean('is_public').default(false), // Can be exposed to frontend
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => [
  index('category_idx').on(table.category),
])

export type Setting = typeof settings.$inferSelect
export type NewSetting = typeof settings.$inferInsert
