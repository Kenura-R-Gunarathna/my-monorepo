import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability'
import type { permissions, roles, user } from '@krag/drizzle-orm-server'

// Infer types from Drizzle schema
type User = typeof user.$inferSelect
type Permission = typeof permissions.$inferSelect
type Role = typeof roles.$inferSelect

// Define possible actions
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'

// Define possible subjects (resources)
export type Subjects =
  | 'User'
  | 'Role'
  | 'Permission'
  | 'Post'
  | 'Analytics'
  | 'Settings'
  | 'all' // Special subject for admin

export type AppAbility = MongoAbility<[Actions, Subjects]>

/**
 * Build CASL abilities from user's role and permissions
 */
export function defineAbilitiesFor(
  user: User & {
    role: Role & {
      rolePermissions: Array<{
        permission: Permission
        isActive: boolean
      }>
    }
    userPermissions?: Array<{
      permission: Permission
      isActive: boolean
    }>
  }
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (!user.isActive) {
    // Inactive users can't do anything
    return build()
  }

  // Get role permissions
  const rolePermissions = user.role.rolePermissions
    .filter((rp: { isActive: boolean; permission: Permission & { isActive: boolean } }) => 
      rp.isActive && rp.permission.isActive
    )
    .map((rp: { permission: Permission }) => rp.permission)

  // Get user-specific permission overrides
  const userPermissions = user.userPermissions
    ?.filter((up: { isActive: boolean; permission: Permission & { isActive: boolean } }) => 
      up.isActive && up.permission.isActive
    )
    .map((up: { permission: Permission }) => up.permission) || []

  // Combine all permissions
  const allPermissions = [...rolePermissions, ...userPermissions]

  // Build abilities from permissions
  allPermissions.forEach((permission) => {
    const action = permission.action as Actions
    const subject = permission.resource as Subjects

    // Parse conditions if present
    let conditions = undefined
    if (permission.conditions) {
      try {
        conditions = JSON.parse(permission.conditions)
      } catch {
        // Silently ignore invalid JSON conditions
      }
    }

    can(action, subject, conditions)
  })

  // Admin role gets full access
  if (user.role.name === 'Admin') {
    can('manage', 'all')
  }

  return build()
}

/**
 * Check if user can perform action on subject
 */
export function checkPermission(
  ability: AppAbility,
  action: Actions,
  subject: Subjects,
  field?: string
): boolean {
  return ability.can(action, subject, field)
}
