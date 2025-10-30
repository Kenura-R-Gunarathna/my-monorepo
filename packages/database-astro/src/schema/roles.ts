import { mysqlTable, serial, varchar, text, boolean, timestamp } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { rolePermissions } from './role-permissions'
import { user } from '@krag/better-auth/schema'

// Roles table - defines roles in the system
export const roles = mysqlTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  isSystemRole: boolean('is_system_role').default(false).notNull(), // Can't be deleted
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
})

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  users: many(user)
}))

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
