# @krag/drizzle-orm-server

MySQL database package for the web backend (Astro) with Drizzle ORM.

## 📋 Overview

This package provides:
- 🗄️ MySQL database connection and schema for web/server
- 📊 Web-specific tables (analytics, sessions, OAuth data)
- 🔄 Shared tables with `@krag/drizzle-orm-client` (users, roles, settings)
- 🛠️ Database migrations with Drizzle Kit
- 🌱 Seeding utilities
- 🔍 Drizzle Studio integration
- 💾 Type-safe queries with Drizzle ORM

## 🏗️ Architecture

### Tech Stack
- **Database**: MySQL
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Validation**: Zod schemas from `@krag/zod-schema`

### Database Schema

```typescript
// Web-specific tables
export const analytics = mysqlTable('analytics', {
  id: serial('id').primaryKey(),
  userId: int('user_id').references(() => users.id),
  event: varchar('event', { length: 100 }),
  data: json('data'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: int('user_id').references(() => users.id),
  expiresAt: timestamp('expires_at'),
  data: json('data'),
})

export const oauthAccounts = mysqlTable('oauth_accounts', {
  id: serial('id').primaryKey(),
  userId: int('user_id').references(() => users.id),
  provider: varchar('provider', { length: 50 }),
  providerAccountId: varchar('provider_account_id', { length: 255 }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
})

// Shared tables (also in drizzle-orm-client)
export const users = mysqlTable('users', { /* ... */ })
export const roles = mysqlTable('roles', { /* ... */ })
export const permissions = mysqlTable('permissions', { /* ... */ })
```

### Project Structure
```
packages/drizzle-orm-server/
├── src/
│   ├── index.ts              # Main exports
│   ├── db/
│   │   └── index.ts          # Database connection
│   ├── schema/
│   │   ├── index.ts          # All schemas
│   │   ├── users.ts          # User tables
│   │   ├── analytics.ts      # Analytics tables
│   │   └── auth.ts           # Auth tables
│   └── seed.ts               # Seed script
├── drizzle/                  # Migrations
│   └── 0000_initial.sql
└── drizzle.config.ts         # Drizzle Kit config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL database running
- pnpm 10.20.0+

### Installation

From monorepo root:
```bash
pnpm install
```

### Environment Configuration

Create `.env` in monorepo root:
```env
DATABASE_URL=mysql://root:@localhost:3306/my_monorepo
```

Or use app-specific env:
```env
# .env.astro.development
DATABASE_URL=mysql://user:password@localhost:3306/production_db
```

### Database Commands

```bash
# Push schema to database (development)
pnpm --filter @krag/drizzle-orm-server db:push

# Generate migrations
pnpm --filter @krag/drizzle-orm-server db:generate

# Run migrations
pnpm --filter @krag/drizzle-orm-server db:migrate

# Seed database
pnpm --filter @krag/drizzle-orm-server db:seed

# Open Drizzle Studio
pnpm --filter @krag/drizzle-orm-server db:studio
```

## 📖 Usage

### 1. Get Database Connection

```typescript
import { dbConn } from '@krag/drizzle-orm-server'

// Use dbConn directly - it's a singleton instance
const users = await dbConn.query.user.findMany()
```

**Note**: The package exports `dbConn` (not `db` or `getWebDb()`).

### 2. Import Schema Tables

```typescript
import { 
  user,              // Better Auth user table
  session,           // Better Auth session table
  account,           // Better Auth account/OAuth table
  verification,      // Better Auth verification table
  roles,             // Custom roles table
  permissions,       // Custom permissions table
  rolePermissions,   // Role-Permission junction
  userPermissions,   // User-Permission junction
  analytics,         // Analytics tracking
  documents          // Document management
} from '@krag/drizzle-orm-server'
```

### 3. Query Data

```typescript
import { dbConn, user } from '@krag/drizzle-orm-server'
import { eq, and, desc } from 'drizzle-orm'

// Find all users
const allUsers = await dbConn.query.user.findMany()

// Find one user with relations
const foundUser = await dbConn.query.user.findFirst({
  where: eq(user.id, 'user-uuid'),
  with: {
    sessions: true,
    accounts: true,
  }
})

// Complex query with filtering
const activeUsers = await dbConn.query.user.findMany({
  where: and(
    eq(user.isActive, true),
    eq(user.emailVerified, true)
  ),
  orderBy: [desc(user.createdAt)],
  limit: 10,
})

// Using select for specific columns
const userEmails = await dbConn
  .select({ 
    id: user.id, 
    email: user.email,
    name: user.name 
  })
  .from(user)
  .where(eq(user.isActive, true))
```

### 4. Insert Data

```typescript
import { dbConn, user } from '@krag/drizzle-orm-server'
import { generateId } from 'lucia' // or any UUID generator

// Insert single user
await dbConn.insert(user).values({
  id: generateId(15),
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: false,
  roleId: 2,
})

// Insert multiple users
await dbConn.insert(user).values([
  { 
    id: generateId(15),
    name: 'Alice', 
    email: 'alice@example.com',
    emailVerified: false 
  },
  { 
    id: generateId(15),
    name: 'Bob', 
    email: 'bob@example.com',
    emailVerified: false 
  },
])
```

### 5. Update Data

```typescript
import { dbConn, user } from '@krag/drizzle-orm-server'
import { eq } from 'drizzle-orm'

// Update user (updatedAt is automatic via $onUpdate)
await dbConn.update(user)
  .set({ name: 'Jane Doe' })
  .where(eq(user.id, 'user-uuid'))

// Update multiple users
await dbConn.update(user)
  .set({ isActive: false })
  .where(eq(user.roleId, 3))

// Conditional update
await dbConn.update(user)
  .set({ emailVerified: true })
  .where(eq(user.email, 'john@example.com'))
```

### 6. Delete Data

```typescript
import { dbConn, user, session } from '@krag/drizzle-orm-server'
import { eq, lt } from 'drizzle-orm'

// Delete user (sessions cascade automatically)
await dbConn.delete(user).where(eq(user.id, 'user-uuid'))

// Delete expired sessions
await dbConn.delete(session).where(lt(session.expiresAt, new Date()))

// Delete inactive users
await dbConn.delete(user).where(eq(user.isActive, false))
```

### 7. Analytics Tracking

```typescript
import { dbConn, analytics } from '@krag/drizzle-orm-server'
import { eq, desc } from 'drizzle-orm'

// Track event
await dbConn.insert(analytics).values({
  eventName: 'page_view',
  eventCategory: 'navigation',
  userId: 123, // optional
  sessionId: 'session-uuid',
  metadata: {
    page: '/dashboard',
    referrer: 'https://google.com',
    duration: 5000,
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
})

// Get analytics by event name
const pageViews = await dbConn.query.analytics.findMany({
  where: eq(analytics.eventName, 'page_view'),
  orderBy: [desc(analytics.createdAt)],
  limit: 100,
})

// Get analytics by category
const userActions = await dbConn.query.analytics.findMany({
  where: eq(analytics.eventCategory, 'user_action'),
  orderBy: [desc(analytics.createdAt)],
})
```

### 8. Session Management (Better Auth)

```typescript
import { dbConn, session, user } from '@krag/drizzle-orm-server'
import { eq, lt } from 'drizzle-orm'
import { generateId } from 'lucia'

// Create session
await dbConn.insert(session).values({
  id: generateId(15),
  userId: 'user-uuid',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  token: generateSessionToken(),
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
})

// Get session with user
const userSession = await dbConn.query.session.findFirst({
  where: eq(session.token, sessionToken),
  with: { user: true }
})

// Clean expired sessions
await dbConn.delete(session).where(lt(session.expiresAt, new Date()))

// Delete all user sessions (logout all devices)
await dbConn.delete(session).where(eq(session.userId, 'user-uuid'))
```

### 9. OAuth Integration (Better Auth)

```typescript
import { dbConn, account, user } from '@krag/drizzle-orm-server'
import { eq, and } from 'drizzle-orm'
import { generateId } from 'lucia'

// Link OAuth account
await dbConn.insert(account).values({
  id: generateId(15),
  userId: 'user-uuid',
  providerId: 'google',
  accountId: googleProfile.id,
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token,
  expiresAt: new Date(Date.now() + 3600 * 1000),
})

// Find user by OAuth provider
const userAccount = await dbConn.query.account.findFirst({
  where: and(
    eq(account.providerId, 'google'),
    eq(account.accountId, googleId)
  ),
  with: { user: true }
})

if (userAccount) {
  console.log('User found:', userAccount.user)
}
```

## 🔧 Configuration

### Drizzle Config (drizzle.config.ts)

```typescript
import { defineConfig } from 'drizzle-kit'
import { getServerConfig } from '@krag/config/server'

const config = getServerConfig()

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: config.DATABASE_URL,
  },
})
```

### Connection (src/index.ts)

```typescript
import { drizzle } from 'drizzle-orm/mysql2'
import { getServerConfig } from '@krag/config/server'

const config = getServerConfig()
const dbUrl = config.DATABASE_URL

if (!dbUrl) {
  throw new Error('DATABASE_URL is required')  
}

// Export schema
export * from './schema'

// Export database connection
export const dbConn = drizzle(dbUrl)
```

**Note**: The package uses the simple `drizzle(dbUrl)` pattern which internally creates a mysql2 connection. Schema and relations are exported separately.

## 🌱 Seeding

Edit `src/seed.ts`:

```typescript
import { dbConn, user, roles, permissions } from './index'
import { generateId } from 'lucia'
import bcrypt from 'bcrypt'

async function seed() {
  console.log('🌱 Seeding database...')
  
  // Create roles
  const roleData = [
    { id: 1, name: 'admin', description: 'Administrator with full access' },
    { id: 2, name: 'editor', description: 'Can create and edit content' },
    { id: 3, name: 'viewer', description: 'Read-only access' },
  ]
  
  await dbConn.insert(roles).values(roleData)
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await dbConn.insert(user).values({
    id: generateId(15),
    name: 'Admin User',
    email: 'admin@example.com',
    emailVerified: true,
    roleId: 1,
    isActive: true,
  })
  
  console.log('✅ Database seeded successfully')
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0))
```

Run with:
```bash
pnpm --filter @krag/drizzle-orm-server db:seed
```

## 🔄 Migrations

### Generate Migration

After changing schema:
```bash
pnpm --filter @krag/drizzle-orm-server db:generate
```

This creates a new migration file in `drizzle/` directory.

### Run Migrations

```bash
pnpm --filter @krag/drizzle-orm-server db:migrate
```

### Push Schema (Development)

For rapid development, skip migrations and push schema directly:
```bash
pnpm --filter @krag/drizzle-orm-server db:push
```

⚠️ **Warning**: `db:push` can cause data loss. Use migrations in production.

## 🔍 Drizzle Studio

Visual database browser:

```bash
pnpm --filter @krag/drizzle-orm-server db:studio
```

Opens at `https://local.drizzle.studio`

## 📦 Exports

```typescript
// From @krag/drizzle-orm-server

// Database connection (singleton)
export { dbConn }

// Better Auth tables
export { 
  user,          // Better Auth user table
  session,       // Better Auth session table  
  account,       // Better Auth OAuth account table
  verification   // Better Auth verification table
}

// Custom tables
export { 
  roles,            // User roles
  permissions,      // Permissions
  rolePermissions,  // Role-Permission junction
  userPermissions,  // User-Permission junction
  analytics,        // Analytics tracking
  documents         // Document management
}

// Type exports
export type { User, NewUser } from './schema/auth'
export type { Analytics, NewAnalytics } from './schema/analytics'
// ... other types
```

### Usage Pattern

```typescript
// ✅ Correct - Import dbConn directly
import { dbConn, user, roles } from '@krag/drizzle-orm-server'
const users = await dbConn.query.user.findMany()

// ❌ Incorrect - These don't exist
import { db } from '@krag/drizzle-orm-server'        // Wrong
import { getWebDb } from '@krag/drizzle-orm-server'  // Wrong
```

## 🧪 Testing

```typescript
import { describe, it, expect, afterEach } from 'vitest'
import { dbConn, user } from '@krag/drizzle-orm-server'
import { eq, like } from 'drizzle-orm'
import { generateId } from 'lucia'

describe('Users', () => {
  afterEach(async () => {
    // Clean up test data
    await dbConn.delete(user).where(like(user.email, '%@test.com'))
  })
  
  it('should create user', async () => {
    const userId = generateId(15)
    
    await dbConn.insert(user).values({
      id: userId,
      name: 'Test User',
      email: 'test@test.com',
      emailVerified: false,
    })
    
    const found = await dbConn.query.user.findFirst({
      where: eq(user.email, 'test@test.com')
    })
    
    expect(found).toBeDefined()
    expect(found?.email).toBe('test@test.com')
    expect(found?.id).toBe(userId)
  })
  
  it('should update user', async () => {
    const userId = generateId(15)
    
    // Create
    await dbConn.insert(user).values({
      id: userId,
      name: 'Original Name',
      email: 'update@test.com',
      emailVerified: false,
    })
    
    // Update
    await dbConn.update(user)
      .set({ name: 'Updated Name' })
      .where(eq(user.id, userId))
    
    // Verify
    const updated = await dbConn.query.user.findFirst({
      where: eq(user.id, userId)
    })
    
    expect(updated?.name).toBe('Updated Name')
  })
})
```

## 📚 Related Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- See `@krag/config` README for configuration
- See `@krag/zod-schema` README for validation

## 🤝 Contributing

This is part of a monorepo. Make sure to:
1. Run commands from the monorepo root using `--filter`
2. Generate migrations for schema changes
3. Update seed data when adding new tables
4. Test queries with Drizzle Studio
5. Document new tables in this README
