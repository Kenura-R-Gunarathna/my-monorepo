import { mysqlTable, int, timestamp, boolean, primaryKey, index, json, text } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { permissions } from './permissions';

// Individual permission overrides (your second approach - exceptional cases)
export const userPermissions = mysqlTable('user_permissions', {
  userId: int('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  permissionId: int('permission_id').notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
  
  // true = GRANT this permission, false = REVOKE this permission
  granted: boolean('granted').notNull().default(true),
  
  // Optional: Conditional permissions (e.g., "can edit only own posts")
  conditions: json('conditions').$type<Record<string, any>>(),
  
  // Optional: Temporary permissions
  expiresAt: timestamp('expires_at'),
  
  // Audit trail
  grantedBy: int('granted_by').references(() => users.id),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  notes: text('notes'), // Why was this granted?
}, (table) => [
  primaryKey({ columns: [table.userId, table.permissionId] }),
  index('user_id_idx').on(table.userId),
  index('permission_id_idx').on(table.permissionId),
  index('expires_at_idx').on(table.expiresAt),
]);

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id],
  }),
  grantedByUser: one(users, {
    fields: [userPermissions.grantedBy],
    references: [users.id],
  }),
}));

export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;