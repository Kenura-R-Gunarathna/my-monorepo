/**
 * Permission Rules for CASL
 * 
 * These define the permission strings used in the system.
 * Format: resource:action
 */

export const PermissionRules = {
  // User permissions
  USER_CREATE: 'User:create',
  USER_READ: 'User:read',
  USER_UPDATE: 'User:update',
  USER_DELETE: 'User:delete',
  USER_MANAGE: 'User:manage',

  // Role permissions
  ROLE_CREATE: 'Role:create',
  ROLE_READ: 'Role:read',
  ROLE_UPDATE: 'Role:update',
  ROLE_DELETE: 'Role:delete',
  ROLE_MANAGE: 'Role:manage',

  // Permission permissions
  PERMISSION_CREATE: 'Permission:create',
  PERMISSION_READ: 'Permission:read',
  PERMISSION_UPDATE: 'Permission:update',
  PERMISSION_DELETE: 'Permission:delete',
  PERMISSION_MANAGE: 'Permission:manage',

  // Post permissions
  POST_CREATE: 'Post:create',
  POST_READ: 'Post:read',
  POST_UPDATE: 'Post:update',
  POST_DELETE: 'Post:delete',
  POST_MANAGE: 'Post:manage',

  // Analytics permissions
  ANALYTICS_READ: 'Analytics:read',
  ANALYTICS_MANAGE: 'Analytics:manage',

  // Settings permissions
  SETTINGS_READ: 'Settings:read',
  SETTINGS_UPDATE: 'Settings:update',
  SETTINGS_MANAGE: 'Settings:manage',

  // Admin wildcard
  ALL_MANAGE: 'all:manage',
} as const

/**
 * Default permissions for each role
 */
export const DefaultRolePermissions = {
  Admin: [PermissionRules.ALL_MANAGE],

  Editor: [
    PermissionRules.POST_CREATE,
    PermissionRules.POST_READ,
    PermissionRules.POST_UPDATE,
    PermissionRules.POST_DELETE,
    PermissionRules.USER_READ,
    PermissionRules.ANALYTICS_READ,
  ],

  Viewer: [
    PermissionRules.POST_READ,
    PermissionRules.USER_READ,
    PermissionRules.ANALYTICS_READ,
  ],
} as const
