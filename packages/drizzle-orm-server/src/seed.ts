import { dbConn } from "./index";
import { permissions, roles, rolePermissions, documents, settings } from './schema';

async function seed() {
  console.log('Starting database seed...');
  try {
    // Check if database is already seeded
    console.log('🔍 Checking if database is already seeded...');
    const existingPermissions = await dbConn.select().from(permissions).limit(1);
    const existingRoles = await dbConn.select().from(roles).limit(1);
    
    if (existingPermissions.length > 0 || existingRoles.length > 0) {
      console.log('\n⚠️  WARNING: Database is already seeded!');
      console.log('   Found existing data in the database.');
      console.log('\n   To re-seed the database:');
      console.log('   1. Manually clear the tables, or');
      console.log('   2. Drop and recreate the database, or');
      console.log('   3. Run migrations to reset schema\n');
      console.log('❌ Seed operation cancelled to prevent duplicate data.\n');
      return;
    }
    
    console.log('✅ Database is empty, proceeding with seed...\n');
    
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
    console.log('✅ Assigned permissions to roles');

    // Note: No users are created in seed
    // The first user to sign up will automatically be assigned Super Admin role
    console.log('\n👤 User Strategy: First signup = Super Admin');
    console.log('   Subsequent users will get default "User" role (roleId: 5)');

    // Seed Settings
    console.log('⚙️  Creating application settings...');
    const settingsData = [
      // Application Settings
      {
        key: 'app.name',
        value: JSON.stringify('My Monorepo App'),
        category: 'application',
        description: 'Application name',
        isPublic: true,
      },
      {
        key: 'app.version',
        value: JSON.stringify('1.0.0'),
        category: 'application',
        description: 'Application version',
        isPublic: true,
      },
      {
        key: 'app.description',
        value: JSON.stringify('A full-stack monorepo application'),
        category: 'application',
        description: 'Application description',
        isPublic: true,
      },
      {
        key: 'app.theme',
        value: JSON.stringify('light'),
        category: 'application',
        description: 'Default application theme',
        isPublic: true,
      },
      
      // Email Settings
      {
        key: 'email.smtp_host',
        value: JSON.stringify('smtp.example.com'),
        category: 'email',
        description: 'SMTP server host',
        isPublic: false,
      },
      {
        key: 'email.smtp_port',
        value: JSON.stringify(587),
        category: 'email',
        description: 'SMTP server port',
        isPublic: false,
      },
      {
        key: 'email.from_address',
        value: JSON.stringify('noreply@example.com'),
        category: 'email',
        description: 'Default from email address',
        isPublic: false,
      },
      {
        key: 'email.from_name',
        value: JSON.stringify('My Monorepo App'),
        category: 'email',
        description: 'Default from name',
        isPublic: false,
      },
      
      // Security Settings
      {
        key: 'security.session_timeout',
        value: JSON.stringify(3600),
        category: 'security',
        description: 'Session timeout in seconds (1 hour)',
        isPublic: false,
      },
      {
        key: 'security.max_login_attempts',
        value: JSON.stringify(5),
        category: 'security',
        description: 'Maximum login attempts before lockout',
        isPublic: false,
      },
      {
        key: 'security.password_min_length',
        value: JSON.stringify(8),
        category: 'security',
        description: 'Minimum password length',
        isPublic: true,
      },
      {
        key: 'security.require_email_verification',
        value: JSON.stringify(true),
        category: 'security',
        description: 'Require email verification for new accounts',
        isPublic: true,
      },
      
      // Feature Flags
      {
        key: 'features.analytics_enabled',
        value: JSON.stringify(true),
        category: 'features',
        description: 'Enable analytics tracking',
        isPublic: false,
      },
      {
        key: 'features.registration_enabled',
        value: JSON.stringify(true),
        category: 'features',
        description: 'Allow new user registration',
        isPublic: true,
      },
      {
        key: 'features.maintenance_mode',
        value: JSON.stringify(false),
        category: 'features',
        description: 'Enable maintenance mode',
        isPublic: true,
      },
      
      // UI Settings
      {
        key: 'ui.items_per_page',
        value: JSON.stringify(20),
        category: 'ui',
        description: 'Default items per page in tables',
        isPublic: true,
      },
      {
        key: 'ui.date_format',
        value: JSON.stringify('YYYY-MM-DD'),
        category: 'ui',
        description: 'Default date format',
        isPublic: true,
      },
      {
        key: 'ui.time_format',
        value: JSON.stringify('HH:mm:ss'),
        category: 'ui',
        description: 'Default time format',
        isPublic: true,
      },
    ];

    await dbConn.insert(settings).values(settingsData);
    console.log(`✅ Created ${settingsData.length} settings`);

    // Seed Documents (Web-specific data)
    console.log('Creating documents...');
    const documentsData = [
      { header: 'Web Application Architecture', type: 'Technical content', status: 'Done', target: 25, limit: 30, reviewer: 'Sarah Chen' },
      { header: 'API Documentation', type: 'Technical content', status: 'Done', target: 18, limit: 20, reviewer: 'Sarah Chen' },
      { header: 'User Authentication Guide', type: 'Narrative', status: 'In Process', target: 12, limit: 15, reviewer: 'Michael Roberts' },
      { header: 'Database Schema Design', type: 'Technical content', status: 'Done', target: 22, limit: 25, reviewer: 'Sarah Chen' },
      { header: 'Security Best Practices', type: 'Narrative', status: 'In Process', target: 15, limit: 18, reviewer: 'Michael Roberts' },
      { header: 'Cloud Deployment Strategy', type: 'Narrative', status: 'In Process', target: 10, limit: 12, reviewer: 'Michael Roberts' },
      { header: 'Performance Optimization', type: 'Technical content', status: 'Done', target: 20, limit: 23, reviewer: 'Emma Wilson' },
      { header: 'Microservices Architecture', type: 'Technical content', status: 'Done', target: 28, limit: 32, reviewer: 'Emma Wilson' },
      { header: 'DevOps Pipeline Setup', type: 'Narrative', status: 'In Process', target: 8, limit: 10, reviewer: 'David Park' },
      { header: 'Monitoring and Logging', type: 'Narrative', status: 'Done', target: 14, limit: 16, reviewer: 'David Park' },
      { header: 'API Rate Limiting', type: 'Plain language', status: 'Done', target: 6, limit: 8, reviewer: 'Emma Wilson' },
      { header: 'Caching Strategies', type: 'Technical content', status: 'Done', target: 11, limit: 13, reviewer: 'Sarah Chen' },
      { header: 'Real-time Communication', type: 'Narrative', status: 'In Process', target: 16, limit: 19, reviewer: 'Michael Roberts' },
      { header: 'GraphQL Integration', type: 'Technical content', status: 'Done', target: 19, limit: 22, reviewer: 'Emma Wilson' },
      { header: 'Testing Strategy Overview', type: 'Narrative', status: 'Done', target: 13, limit: 15, reviewer: 'David Park' },
      { header: 'CI/CD Best Practices', type: 'Narrative', status: 'In Process', target: 9, limit: 11, reviewer: 'David Park' },
      { header: 'Container Orchestration', type: 'Technical content', status: 'Done', target: 24, limit: 27, reviewer: 'Sarah Chen' },
      { header: 'Service Mesh Implementation', type: 'Narrative', status: 'In Process', target: 17, limit: 20, reviewer: 'Michael Roberts' },
      { header: 'Data Privacy Compliance', type: 'Plain language', status: 'Done', target: 7, limit: 9, reviewer: 'Emma Wilson' },
      { header: 'Disaster Recovery Plan', type: 'Narrative', status: 'Done', target: 21, limit: 24, reviewer: 'David Park' }
    ];

    await dbConn.insert(documents).values(documentsData);
    console.log(`✅ Created ${documentsData.length} documents`);

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${permissionData.length} permissions`);
    console.log(`   - ${roleData.length} roles`);
    console.log(`   - ${rolePermissionData.length} role-permission mappings`);
    console.log(`   - 0 users (will be created on first signup)`);
    console.log(`   - ${settingsData.length} application settings`);
    console.log(`   - ${documentsData.length} documents`);
    console.log('\n👤 First User Setup:');
    console.log('   ⚠️  The FIRST user to sign up will automatically become Super Admin');
    console.log('   📝 Go to your app and create your admin account via sign up');
    console.log('   🔒 All subsequent users will get the default "User" role\n');

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
