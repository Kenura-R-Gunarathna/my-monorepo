// apps/astro-web/src/server/utils/permissions.ts
import type { MySql2Database } from 'drizzle-orm/mysql2'

export interface ResolvedPermission {
  id: number
  name: string
  resource: string
  action: string
  description: string | null
  category: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  source: 'role' | 'user-direct'
}

/**
 * Get all effective permissions for a user
 * Combines role permissions + user-specific permissions
 * 
 * Schema: userPermissions is a simple junction table (userId, permissionId, isActive)
 * - User gets permissions from their role
 * - User can have additional direct permissions
 * - isActive flag controls if permission is active
 */
export async function getUserPermissions(
  userId: string,
  db: MySql2Database<any>
): Promise<ResolvedPermission[]> {
  // For now, returning empty array until proper schema is set up
  // TODO: Implement proper query when relational queries are configured
  return []
  
  /* Uncomment when schema is properly configured:
  
  // 1. Get user with their role and permissions
  const user = await db.query.user.findFirst({
    where: (users: any, { eq }: any) => eq(users.id, userId),
    with: {
      role: {
        with: {
          rolePermissions: {
            where: (rp: any, { eq }: any) => eq(rp.permission.isActive, true),
            with: {
              permission: true,
            },
          },
        },
      },
      userPermissions: {
        where: (up: any, { eq }: any) => eq(up.isActive, true),
        with: {
          permission: true,
        },
      },
    },
  })

  if (!user) {
    return []
  }

  const permissionMap = new Map<number, ResolvedPermission>()

  // 2. Add role permissions
  user.role?.rolePermissions?.forEach((rp: any) => {
    if (rp.permission.isActive) {
      permissionMap.set(rp.permission.id, {
        ...rp.permission,
        source: 'role' as const,
      })
    }
  })

  // 3. Add user-specific permissions (direct assignments)
  user.userPermissions?.forEach((up: any) => {
    if (up.isActive && up.permission.isActive) {
      permissionMap.set(up.permission.id, {
        ...up.permission,
        source: 'user-direct' as const,
      })
    }
  })

  return Array.from(permissionMap.values())
  */
}

/**
 * Check if user has a specific permission
 */
export async function userHasPermission(
  userId: string,
  permissionName: string,
  db: MySql2Database<any>
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, db)
  return permissions.some((p) => p.name === permissionName && p.isActive)
}

/**
 * Check if user can perform action on resource
 */
export async function userCan(
  userId: string,
  action: string,
  resource: string,
  db: MySql2Database<any>
): Promise<boolean> {
  const permissionName = `${resource}.${action}`
  return userHasPermission(userId, permissionName, db)
}

/**
 * Get permissions grouped by category
 */
export async function getUserPermissionsByCategory(
  userId: string,
  db: MySql2Database<any>
) {
  const permissions = await getUserPermissions(userId, db)

  return permissions.reduce(
    (acc, perm) => {
      const category = perm.category || 'other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(perm)
      return acc
    },
    {} as Record<string, ResolvedPermission[]>
  )
}
