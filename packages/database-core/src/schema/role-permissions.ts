import { mysqlTable, int, timestamp, primaryKey, index, text, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { roles } from './roles';
import { permissions } from './permissions';
import { users } from './users';

// Junction table - connects roles to permissions
export const rolePermissions = mysqlTable('role_permissions', {
  roleId: int('role_id').notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: int('permission_id').notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
  
  // Optional: Conditions for conditional permissions
  conditions: json('conditions').$type<Record<string, any>>(), // { authorId: '${userId}' }
  
  // Audit fields
  grantedBy: int('granted_by').references(() => users.id), // Who granted this?
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