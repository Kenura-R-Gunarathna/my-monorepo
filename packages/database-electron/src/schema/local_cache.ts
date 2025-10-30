import { mysqlTable, serial, varchar, text, timestamp, boolean } from 'drizzle-orm/mysql-core'

export const localCache = mysqlTable('local_cache', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
})
