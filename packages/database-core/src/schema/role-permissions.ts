import { mysqlTable, bigint, timestamp, primaryKey, index, text, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { roles } from '@/packages/database-core/schema/roles';
import { permissions } from '@/packages/database-core/schema/permissions';
import { users } from '@/packages/database-core/schema/users';

// Junction table - connects roles to permissions
export const rolePermissions = mysqlTable('role_permissions', {
  roleId: bigint('role_id', { mode: 'number', unsigned: true }).notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: bigint('permission_id', { mode: 'number', unsigned: true }).notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
  
  // Optional: Conditions for conditional permissions
  conditions: json('conditions').$type<Record<string, any>>(), // { authorId: '${userId}' }
  
  // Audit fields
  grantedBy: bigint('granted_by', { mode: 'number', unsigned: true }).references(() => users.id), // Who granted this?
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  notes: text('notes'), // Why was this granted?
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] }),
  index('role_id_idx').on(table.roleId),
  index('permission_id_idx').on(table.permissionId),
]);

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;