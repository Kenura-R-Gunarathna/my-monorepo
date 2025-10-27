import { mysqlTable, bigint, boolean, timestamp, primaryKey, index } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { roles } from '@/packages/database-web/schema/roles'
import { permissions } from '@/packages/database-web/schema/permissions'

// Junction table: which permissions does each role have?
export const rolePermissions = mysqlTable(
  'role_permissions',
  {
    roleId: bigint('role_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: bigint('permission_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index('permission_id_idx').on(table.permissionId)
  ]
)

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  })
}))

export type RolePermission = typeof rolePermissions.$inferSelect
export type NewRolePermission = typeof rolePermissions.$inferInsert
