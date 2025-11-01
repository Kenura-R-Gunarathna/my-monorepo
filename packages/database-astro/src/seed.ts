import { dbConn } from "./index";
import { permissions, roles, rolePermissions } from './schema';

async function seed() {
  console.log('Starting database seed...');
  try {
    // Seed Permissions
    console.log('Creating permissions...');
    const permissionData = [
      // User Management
      { name: 'users.create', resource: 'users', action: 'create', description: 'Create new users', category: 'users' },
      { name: 'users.read', resource: 'users', action: 'read', description: 'View users', category: 'users' },
      { name: 'users.update', resource: 'users', action: 'update', description: 'Update user details', category: 'users' },
      { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users', category: 'users' },
      { name: 'users.manage-permissions', resource: 'users', action: 'manage-permissions', description: 'Grant/revoke user permissions', category: 'users' },
      
      // Role Management
      { name: 'roles.create', resource: 'roles', action: 'create', description: 'Create new roles', category: 'roles' },
      { name: 'roles.read', resource: 'roles', action: 'read', description: 'View roles', category: 'roles' },
      { name: 'roles.update', resource: 'roles', action: 'update', description: 'Update role details', category: 'roles' },
      { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete roles', category: 'roles' },
      { name: 'roles.assign', resource: 'roles', action: 'assign', description: 'Assign roles to users', category: 'roles' },
      
      // Post/Content Management
      { name: 'posts.create', resource: 'posts', action: 'create', description: 'Create new posts', category: 'content' },
      { name: 'posts.read', resource: 'posts', action: 'read', description: 'View posts', category: 'content' },
      { name: 'posts.update', resource: 'posts', action: 'update', description: 'Update posts', category: 'content' },
      { name: 'posts.delete', resource: 'posts', action: 'delete', description: 'Delete posts', category: 'content' },
      { name: 'posts.publish', resource: 'posts', action: 'publish', description: 'Publish posts', category: 'content' },
      
      // Settings Management
      { name: 'settings.read', resource: 'settings', action: 'read', description: 'View settings', category: 'settings' },
      { name: 'settings.update', resource: 'settings', action: 'update', description: 'Update settings', category: 'settings' },
      
      // Analytics
      { name: 'analytics.read', resource: 'analytics', action: 'read', description: 'View analytics', category: 'analytics' },
      { name: 'analytics.export', resource: 'analytics', action: 'export', description: 'Export analytics data', category: 'analytics' },
      
      // Super Admin - All permissions
      { name: 'all.manage', resource: 'all', action: 'manage', description: 'Full system access', category: 'system' },
    ];

    await dbConn.insert(permissions).values(permissionData);
    console.log(`✅ Created ${permissionData.length} permissions`);

    // Get permission IDs for role assignment
    const allPermissions = await dbConn.select().from(permissions);
    const permissionMap = new Map(allPermissions.map(p => [p.name, p.id]));

    // Seed Roles
    console.log('👥 Creating roles...');
    const roleData = [
      {
        name: 'Super Admin',
        description: 'Full system access - can do everything',
        isSystemRole: true,
        isActive: true,
      },
      {
        name: 'Admin',
        description: 'Administrative access - can manage users and content',
        isSystemRole: true,
        isActive: true,
      },
      {
        name: 'Editor',
        description: 'Content management - can create and edit content',
        isSystemRole: true,
        isActive: true,
      },
      {
        name: 'Viewer',
        description: 'Read-only access - can view content',
        isSystemRole: true,
        isActive: true,
      },
      {
        name: 'User',
        description: 'Basic user - limited permissions',
        isSystemRole: true,
        isActive: true,
      },
    ];

    await dbConn.insert(roles).values(roleData);
    console.log(`✅ Created ${roleData.length} roles`);

    // Get role IDs
    const allRoles = await dbConn.select().from(roles);
    const roleMap = new Map(allRoles.map(r => [r.name, r.id]));

    // Assign Permissions to Roles
    console.log('🔗 Assigning permissions to roles...');
    
    const rolePermissionData = [
      // Super Admin - All permissions
      {
        roleId: roleMap.get('Super Admin')!,
        permissionId: permissionMap.get('all.manage')!,
      },
      
      // Admin - Most permissions except super admin
      ...['users.create', 'users.read', 'users.update', 'users.delete', 'users.manage-permissions',
          'roles.read', 'roles.assign',
          'posts.create', 'posts.read', 'posts.update', 'posts.delete', 'posts.publish',
          'settings.read', 'settings.update',
          'analytics.read', 'analytics.export'].map(permName => ({
        roleId: roleMap.get('Admin')!,
        permissionId: permissionMap.get(permName)!,
      })),
      
      // Editor - Content management
      ...['users.read',
          'posts.create', 'posts.read', 'posts.update', 'posts.delete', 'posts.publish',
          'settings.read',
          'analytics.read'].map(permName => ({
        roleId: roleMap.get('Editor')!,
        permissionId: permissionMap.get(permName)!,
      })),
      
      // Viewer - Read-only
      ...['users.read',
          'posts.read',
          'settings.read',
          'analytics.read'].map(permName => ({
        roleId: roleMap.get('Viewer')!,
        permissionId: permissionMap.get(permName)!,
      })),
      
      // User - Basic permissions
      ...['posts.read'].map(permName => ({
        roleId: roleMap.get('User')!,
        permissionId: permissionMap.get(permName)!,
      })),
    ];

    await dbConn.insert(rolePermissions).values(rolePermissionData);
    console.log(`Assigned ${rolePermissionData.length} permissions to roles`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('Seed script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
