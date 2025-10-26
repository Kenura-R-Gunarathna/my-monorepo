import type { Permission } from '@krag/database-core';

export interface ResolvedPermission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  source: 'role' | 'user-granted' | 'user-revoked';
  conditions?: Record<string, any>;
  expiresAt?: Date | null;
}

/**
 * Get all effective permissions for a user
 * Combines role permissions + user permission overrides
 */
export async function getUserPermissions(userId: number, db: any): Promise<ResolvedPermission[]> {
  const now = new Date();
  
  // 1. Get user with role permissions
  const user = await db.query.users.findFirst({
    where: (users: any, { eq }: any) => eq(users.id, userId),
    with: {
      role: {
        with: {
          rolePermissions: {
            with: {
              permission: true,
            },
          },
        },
      },
      userPermissions: {
        where: (userPermissions: any, { or, isNull, gt }: any) => or(
          isNull(userPermissions.expiresAt),
          gt(userPermissions.expiresAt, now)
        ),
        with: {
          permission: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return [];
  }

  // 2. Start with role permissions
  const rolePermissions: ResolvedPermission[] = user.role.rolePermissions.map((rp: any) => ({
    ...rp.permission,
    source: 'role' as const,
  }));

  // 3. Apply user permission overrides
  const permissionMap = new Map<number, ResolvedPermission>();
  
  // Add all role permissions first
  rolePermissions.forEach(perm => {
    permissionMap.set(perm.id, perm);
  });

  // Apply user overrides
  user.userPermissions?.forEach((up: any) => {
    if (up.granted) {
      // GRANT: Add permission (or override existing)
      permissionMap.set(up.permission.id, {
        ...up.permission,
        source: 'user-granted' as const,
        conditions: up.conditions,
        expiresAt: up.expiresAt,
      });
    } else {
      // REVOKE: Remove permission
      if (permissionMap.has(up.permission.id)) {
        permissionMap.set(up.permission.id, {
          ...up.permission,
          source: 'user-revoked' as const,
          conditions: up.conditions,
        });
        // Mark as revoked, filter out later
      }
    }
  });

  // 4. Filter out revoked permissions
  const finalPermissions = Array.from(permissionMap.values())
    .filter(p => p.source !== 'user-revoked');

  return finalPermissions;
}

/**
 * Check if user has a specific permission
 */
export async function userHasPermission(
  userId: number,
  permissionName: string,
  db: any
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, db);
  return permissions.some(p => p.name === permissionName && p.isActive);
}

/**
 * Check if user can perform action on resource
 */
export async function userCan(
  userId: number,
  action: string,
  resource: string,
  db: any
): Promise<boolean> {
  const permissionName = `${resource}.${action}`;
  return userHasPermission(userId, permissionName, db);
}

/**
 * Get permissions grouped by category
 */
export async function getUserPermissionsByCategory(userId: number, db: any) {
  const permissions = await getUserPermissions(userId, db);
  
  return permissions.reduce((acc, perm) => {
    const category = perm.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, ResolvedPermission[]>);
}
