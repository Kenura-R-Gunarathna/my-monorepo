import { mysqlTable, varchar, bigint, boolean, timestamp, primaryKey, index } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { user } from '@krag/better-auth/schema'
import { permissions } from './permissions'

// Junction table: individual permission overrides for specific users
export const userPermissions = mysqlTable(
  'user_permissions',
  {
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    permissionId: bigint('permission_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.permissionId] }),
    index('permission_id_idx').on(table.permissionId)
  ]
)

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(user, {
    fields: [userPermissions.userId],
    references: [user.id]
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id]
  })
}))

export type UserPermission = typeof userPermissions.$inferSelect
export type NewUserPermission = typeof userPermissions.$inferInsert
