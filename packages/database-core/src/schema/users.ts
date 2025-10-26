import { mysqlTable, serial, varchar, bigint, boolean, timestamp, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { roles } from './roles';
import { userPermissions } from './user-permissions';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  roleId: bigint('role_id', { mode: 'number', unsigned: true }).notNull()
    .references(() => roles.id, { onDelete: 'restrict' }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index('role_id_idx').on(table.roleId),
]);

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  userPermissions: many(userPermissions), // Individual permission overrides
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
