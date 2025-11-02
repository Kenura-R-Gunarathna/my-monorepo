import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  roleId: integer('role_id'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  phoneNumber: text('phone_number'),
  firstName: text('first_name'),
  lastName: text('last_name')
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
