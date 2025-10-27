import { mysqlTable, serial, varchar, text, timestamp, index, boolean } from 'drizzle-orm/mysql-core'

// Core permissions table - defines what permissions exist in the system
// CASL will use these to build abilities
export const permissions = mysqlTable(
  'permissions',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(), // 'posts:create'
    resource: varchar('resource', { length: 50 }).notNull(), // 'posts'
    action: varchar('action', { length: 50 }).notNull(), // 'create', 'read', 'update', 'delete'
    description: text('description'),
    category: varchar('category', { length: 50 }), // 'content', 'users', 'settings'
    conditions: text('conditions'), // JSON string for CASL conditions
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
  },
  (table) => [
    index('resource_action_idx').on(table.resource, table.action),
    index('category_idx').on(table.category)
  ]
)

export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert
