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
import { getWebDb } from '@krag/drizzle-orm-server'

const db = getWebDb()
```

### 2. Import Schema

```typescript
import { 
  users, 
  roles, 
  permissions,
  analytics,
  sessions,
  oauthAccounts 
} from '@krag/drizzle-orm-server'
```

### 3. Query Data

```typescript
import { getWebDb, users } from '@krag/drizzle-orm-server'
import { eq, and, desc } from 'drizzle-orm'

const db = getWebDb()

// Find all users
const allUsers = await db.query.users.findMany()

// Find one user with relations
const user = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    role: true,
    permissions: true,
  }
})

// Complex query
const activeAdmins = await db.query.users.findMany({
  where: and(
    eq(users.active, true),
    eq(users.roleId, 1)
  ),
  orderBy: [desc(users.createdAt)],
  limit: 10,
})
```

### 4. Insert Data

```typescript
import { getWebDb, users } from '@krag/drizzle-orm-server'

const db = getWebDb()

// Insert single user
const [newUser] = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
  password: hashedPassword,
  roleId: 2,
})

// Insert multiple users
await db.insert(users).values([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
])
```

### 5. Update Data

```typescript
import { getWebDb, users } from '@krag/drizzle-orm-server'
import { eq } from 'drizzle-orm'

const db = getWebDb()

// Update user
await db.update(users)
  .set({ name: 'Jane Doe', updatedAt: new Date() })
  .where(eq(users.id, 1))

// Update multiple
await db.update(users)
  .set({ active: false })
  .where(eq(users.roleId, 3))
```

### 6. Delete Data

```typescript
import { getWebDb, users } from '@krag/drizzle-orm-server'
import { eq } from 'drizzle-orm'

const db = getWebDb()

// Delete user
await db.delete(users).where(eq(users.id, 1))

// Delete with condition
await db.delete(sessions).where(lt(sessions.expiresAt, new Date()))
```

### 7. Analytics Tracking

```typescript
import { getWebDb, analytics } from '@krag/drizzle-orm-server'

const db = getWebDb()

// Track event
await db.insert(analytics).values({
  userId: 1,
  event: 'page_view',
  data: {
    page: '/dashboard',
    referrer: 'https://google.com',
    userAgent: req.headers['user-agent'],
  }
})

// Get analytics
const pageViews = await db.query.analytics.findMany({
  where: eq(analytics.event, 'page_view'),
  orderBy: [desc(analytics.createdAt)],
  limit: 100,
})
```

### 8. Session Management

```typescript
import { getWebDb, sessions } from '@krag/drizzle-orm-server'

const db = getWebDb()

// Create session
await db.insert(sessions).values({
  id: generateSessionId(),
  userId: user.id,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  data: { loginAt: new Date(), ipAddress: req.ip }
})

// Get session
const session = await db.query.sessions.findFirst({
  where: eq(sessions.id, sessionId),
  with: { user: true }
})

// Clean expired sessions
await db.delete(sessions).where(lt(sessions.expiresAt, new Date()))
```

### 9. OAuth Integration

```typescript
import { getWebDb, oauthAccounts } from '@krag/drizzle-orm-server'

const db = getWebDb()

// Link OAuth account
await db.insert(oauthAccounts).values({
  userId: user.id,
  provider: 'google',
  providerAccountId: googleProfile.id,
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token,
})

// Find user by OAuth
const account = await db.query.oauthAccounts.findFirst({
  where: and(
    eq(oauthAccounts.provider, 'google'),
    eq(oauthAccounts.providerAccountId, googleId)
  ),
  with: { user: true }
})
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

### Connection (src/db/index.ts)

```typescript
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { getServerConfig } from '@krag/config/server'
import * as schema from '../schema'

const config = getServerConfig()
const connection = mysql.createPool(config.DATABASE_URL)

export const db = drizzle(connection, { schema, mode: 'default' })

export function getWebDb() {
  return db
}
```

## 🌱 Seeding

Edit `src/seed.ts`:

```typescript
import { getWebDb } from './db'
import { users, roles, permissions } from './schema'

async function seed() {
  const db = getWebDb()
  
  // Create roles
  const [admin, editor, viewer] = await db.insert(roles).values([
    { name: 'admin', description: 'Administrator' },
    { name: 'editor', description: 'Content Editor' },
    { name: 'viewer', description: 'Read-only User' },
  ])
  
  // Create admin user
  await db.insert(users).values({
    name: 'Admin User',
    email: 'admin@example.com',
    password: await hashPassword('admin123'),
    roleId: admin.id,
  })
  
  console.log('✅ Database seeded')
}

seed()
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
// Database connection
export { getWebDb } from './db'

// All tables
export * from './schema'

// Specific exports
export { 
  users, 
  roles, 
  permissions,
  rolePermissions,
  userPermissions,
  analytics,
  sessions,
  oauthAccounts 
} from './schema'
```

## 🧪 Testing

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getWebDb, users } from '@krag/drizzle-orm-server'

describe('Users', () => {
  let db: ReturnType<typeof getWebDb>
  
  beforeEach(() => {
    db = getWebDb()
  })
  
  afterEach(async () => {
    // Clean up test data
    await db.delete(users).where(like(users.email, '%@test.com'))
  })
  
  it('should create user', async () => {
    const [user] = await db.insert(users).values({
      name: 'Test User',
      email: 'test@test.com',
    })
    
    expect(user.id).toBeDefined()
    expect(user.email).toBe('test@test.com')
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
