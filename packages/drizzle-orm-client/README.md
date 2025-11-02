# @krag/drizzle-orm-client

SQLite database package for the desktop application (Electron) with Drizzle ORM.

## 📋 Overview

This package provides:
- 💾 SQLite local database for Electron app
- 🔐 Encrypted local storage with electron-store
- 📱 Desktop-specific tables (local cache, offline data)
- 🔄 Shared tables with `@krag/drizzle-orm-server` (users, roles, settings)
- 🛠️ Database migrations with Drizzle Kit
- 🌱 Seeding utilities
- 🔍 Drizzle Studio integration
- ⚡ Type-safe queries with Drizzle ORM

## 🏗️ Architecture

### Tech Stack
- **Database**: SQLite (better-sqlite3)
- **ORM**: Drizzle ORM
- **Storage**: electron-store (encrypted)
- **Migrations**: Drizzle Kit
- **Validation**: Zod schemas from `@krag/zod-schema`

### Database Schema

```typescript
// Desktop-specific tables
export const localCache = sqliteTable('local_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value', { mode: 'json' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
})

export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entity: text('entity').notNull(), // 'user', 'post', etc.
  entityId: integer('entity_id'),
  operation: text('operation').notNull(), // 'create', 'update', 'delete'
  data: text('data', { mode: 'json' }),
  synced: integer('synced', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
})

// Shared tables (also in drizzle-orm-server)
export const users = sqliteTable('users', { /* ... */ })
export const roles = sqliteTable('roles', { /* ... */ })
export const settings = sqliteTable('settings', { /* ... */ })
```

### Project Structure
```
packages/drizzle-orm-client/
├── src/
│   ├── index.ts              # Main exports
│   ├── db/
│   │   ├── index.ts          # SQLite connection
│   │   └── schema.ts         # Schema exports
│   ├── schema/
│   │   ├── index.ts          # All schemas
│   │   ├── users.ts          # User tables
│   │   ├── cache.ts          # Cache tables
│   │   └── sync.ts           # Sync tables
│   ├── store/
│   │   ├── index.ts          # electron-store setup
│   │   ├── session.ts        # Session management
│   │   ├── settings.ts       # App settings
│   │   └── cache.ts          # Local cache
│   └── seed.ts               # Seed script
├── drizzle/                  # Migrations
│   └── 0000_initial.sql
└── drizzle.config.ts         # Drizzle Kit config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Electron app
- pnpm 10.20.0+

### Installation

From monorepo root:
```bash
pnpm install
```

### Environment Configuration

Create `.env.electron.development` in monorepo root:
```env
# Database file location
DB_FILE_NAME=local.db
DB_ENCRYPTION_KEY=your-encryption-key-here

# Store encryption
STORE_ENCRYPTION_KEY=another-encryption-key
```

### Database Commands

```bash
# Push schema to SQLite (development)
pnpm --filter @krag/drizzle-orm-client db:push

# Generate migrations
pnpm --filter @krag/drizzle-orm-client db:generate

# Run migrations
pnpm --filter @krag/drizzle-orm-client db:migrate

# Seed database
pnpm --filter @krag/drizzle-orm-client db:seed

# Open Drizzle Studio
pnpm --filter @krag/drizzle-orm-client db:studio
```

## 📖 Usage

### 1. Get Database Connection

```typescript
import { dbConn } from '@krag/drizzle-orm-client'

// Use dbConn directly - it's a singleton instance
const users = await dbConn.query.users.findMany()
```

**Note**: The package exports `dbConn` (not `db` or `getDesktopDb()`). The database is automatically initialized with the path from Electron's `app.getPath('userData')`.

### 2. Import Schema Tables

```typescript
import { 
  users,            // User management
  roles,            // User roles
  permissions,      // Permissions
  rolePermissions,  // Role-Permission junction
  userPermissions,  // User-Permission junction
  documents,        // Document management
  analytics         // Local analytics tracking
} from '@krag/drizzle-orm-client'
```

### 3. Query Data

```typescript
import { dbConn, users } from '@krag/drizzle-orm-client'
import { eq, and } from 'drizzle-orm'

// Find all users
const allUsers = await dbConn.query.users.findMany()

// Find one user with relations
const user = await dbConn.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    role: true,
    documents: true,
  }
})

// Complex query with filtering
const activeUsers = await dbConn.query.users.findMany({
  where: eq(users.isActive, 1), // SQLite uses 1/0 for boolean
  orderBy: (users, { desc }) => [desc(users.createdAt)],
  limit: 10,
})

// Using select for specific columns
const userNames = await dbConn
  .select({ 
    id: users.id, 
    name: users.name,
    email: users.email 
  })
  .from(users)
  .where(eq(users.isActive, 1))
```

### 4. Insert, Update, Delete

```typescript
import { dbConn, users } from '@krag/drizzle-orm-client'
import { eq } from 'drizzle-orm'

// Insert
await dbConn.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
  roleId: 2,
  isActive: 1,
})

// Update
await dbConn.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, 1))

// Delete
await dbConn.delete(users).where(eq(users.id, 1))
```

### 5. Analytics Tracking (Local)

```typescript
import { dbConn, analytics } from '@krag/drizzle-orm-client'
import { eq, desc } from 'drizzle-orm'

// Track local event
await dbConn.insert(analytics).values({
  eventName: 'document_opened',
  eventCategory: 'user_action',
  userId: 123,
  metadata: {
    documentId: 'doc-123',
    duration: 5000,
  },
})

// Get local analytics
const recentEvents = await dbConn.query.analytics.findMany({
  where: eq(analytics.eventCategory, 'user_action'),
  orderBy: [desc(analytics.createdAt)],
  limit: 50,
})
```

### 6. electron-store Integration

```typescript
import { store } from '@krag/drizzle-orm-client'

// Set value
store.set('theme', 'dark')

// Get value
const theme = store.get('theme') // 'dark'

// Set nested value
store.set('user.preferences.notifications', true)

// Get nested value
const notifications = store.get('user.preferences.notifications')

// Check if key exists
if (store.has('theme')) {
  console.log('Theme is set')
}

// Delete value
store.delete('theme')

// Clear all (use with caution)
store.clear()
```

### 7. Session & Settings Management

Session and settings are managed through electron-store:

```typescript
import { store } from '@krag/drizzle-orm-client'

// Session management
store.set('session', {
  userId: 123,
  token: 'abc123',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
})

const session = store.get('session')
if (session && session.expiresAt > Date.now()) {
  console.log('User ID:', session.userId)
}

store.delete('session') // Logout

// App settings
store.set('settings', {
  theme: 'dark',
  language: 'en',
  enableSync: true,
  syncInterval: 300000, // 5 minutes
})

const settings = store.get('settings')
console.log('Theme:', settings.theme)
```

### 8. App Settings

```typescript
import { 
  getSettings, 
  updateSettings 
} from '@krag/drizzle-orm-client/store/settings'

// Get all settings
const settings = getSettings()

// Update settings
updateSettings({
  theme: 'dark',
  language: 'en',
  enableSync: true,
  syncInterval: 300000, // 5 minutes
})

// Get specific setting
const theme = getSettings().theme
```

## 🔧 Configuration

### Drizzle Config (drizzle.config.ts)

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './local.db',
  },
})
```

### Connection (src/db/index.ts)

```typescript
import { drizzle } from 'drizzle-orm/libsql'
import { app } from 'electron'
import { join } from 'path'

// Get user data directory path
const dbPath = join(app.getPath('userData'), 'app.db')

// Initialize database with file path
export const dbConn = drizzle(`file:${dbPath}`)

// Export all schemas
export * from '../schema'
```

**Note**: The package uses `drizzle-orm/libsql` for SQLite support. The database file is stored in Electron's user data directory (`app.getPath('userData')`).

### electron-store Config (src/store/index.ts)

```typescript
import Store from 'electron-store'

// Note: Encryption can be configured if needed
export const store = new Store({
  schema: {
    theme: {
      type: 'string',
      default: 'system'
    },
    language: {
      type: 'string',
      default: 'en'
    },
    enableSync: {
      type: 'boolean',
      default: true
    }
  }
})
```

## 🔄 Sync with Web Backend

Example sync pattern (implement based on your needs):

```typescript
import { dbConn, users, documents } from '@krag/drizzle-orm-client'
import { eq } from 'drizzle-orm'

async function syncToServer() {
  // Get local data
  const localUsers = await dbConn.query.users.findMany()
  
  // Sync to server via HTTP/tRPC
  try {
    const response = await fetch(`${API_URL}/sync/users`, {
      method: 'POST',
      body: JSON.stringify(localUsers),
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      console.log('Sync successful')
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Run sync every 5 minutes
setInterval(syncToServer, 5 * 60 * 1000)
```

**Note**: Implement sync logic based on your application needs. Consider using a sync queue table or tracking last sync timestamps.

## 🌱 Seeding

Edit `src/seed.ts`:

```typescript
import { dbConn, users, roles } from './db'

async function seed() {
  console.log('🌱 Seeding local database...')
  
  // Create roles
  await dbConn.insert(roles).values([
    { id: 1, name: 'user', description: 'Regular User' },
    { id: 2, name: 'admin', description: 'Administrator' },
  ])
  
  // Create default user
  await dbConn.insert(users).values({
    name: 'Local User',
    email: 'user@local.com',
    roleId: 1,
    isActive: 1,
  })
  
  // Set default settings in electron-store
  const { store } = await import('./store')
  store.set('settings', {
    theme: 'system',
    language: 'en',
    enableSync: true,
  })
  
  console.log('✅ Database seeded successfully')
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0))
```

Run with:
```bash
pnpm --filter @krag/drizzle-orm-client db:seed
```

## 📦 Exports

```typescript
// From @krag/drizzle-orm-client

// Database connection (singleton)
export { dbConn }

// Tables
export { 
  users,            // User management
  roles,            // User roles
  permissions,      // Permissions
  rolePermissions,  // Role-Permission junction
  userPermissions,  // User-Permission junction
  documents,        // Document management
  analytics         // Local analytics
}

// electron-store
export { store }

// All schema exports
export * from './schema'
```

### Usage Pattern

```typescript
// ✅ Correct - Import dbConn directly
import { dbConn, users, store } from '@krag/drizzle-orm-client'
const allUsers = await dbConn.query.users.findMany()

// ❌ Incorrect - These don't exist
import { db } from '@krag/drizzle-orm-client'           // Wrong
import { getDesktopDb } from '@krag/drizzle-orm-client' // Wrong
```

## 🔒 Security

### Database Location
SQLite database is stored in Electron's secure user data directory:
- **Windows**: `%APPDATA%/YourApp/app.db`
- **macOS**: `~/Library/Application Support/YourApp/app.db`
- **Linux**: `~/.config/YourApp/app.db`

### electron-store Security
- Data is stored in a JSON file in the user data directory
- Optional encryption can be enabled by adding `encryptionKey` to Store config
- Sensitive data like tokens should be encrypted

```typescript
import Store from 'electron-store'

export const store = new Store({
  encryptionKey: 'your-encryption-key', // Add if needed
  schema: { /* ... */ }
})
```

## 🧪 Testing

```typescript
import { describe, it, expect, afterEach } from 'vitest'
import { dbConn, users } from '@krag/drizzle-orm-client'
import { eq, like } from 'drizzle-orm'

describe('Users', () => {
  afterEach(async () => {
    // Clean up test data
    await dbConn.delete(users).where(like(users.email, '%@test.com'))
  })
  
  it('should create user', async () => {
    await dbConn.insert(users).values({
      name: 'Test User',
      email: 'test@test.com',
      roleId: 1,
      isActive: 1,
    })
    
    const found = await dbConn.query.users.findFirst({
      where: eq(users.email, 'test@test.com')
    })
    
    expect(found).toBeDefined()
    expect(found?.email).toBe('test@test.com')
    expect(found?.name).toBe('Test User')
  })
  
  it('should update user', async () => {
    // Create
    await dbConn.insert(users).values({
      name: 'Original Name',
      email: 'update@test.com',
      roleId: 1,
      isActive: 1,
    })
    
    // Get ID
    const created = await dbConn.query.users.findFirst({
      where: eq(users.email, 'update@test.com')
    })
    
    // Update
    await dbConn.update(users)
      .set({ name: 'Updated Name' })
      .where(eq(users.id, created!.id))
    
    // Verify
    const updated = await dbConn.query.users.findFirst({
      where: eq(users.id, created!.id)
    })
    
    expect(updated?.name).toBe('Updated Name')
  })
})
```

## 📚 Related Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [libSQL/Turso Documentation](https://docs.turso.tech/libsql)
- [electron-store Documentation](https://github.com/sindresorhus/electron-store)
- [Electron Documentation](https://www.electronjs.org/docs)
- See `@krag/drizzle-orm-server` README for server database patterns
- See `@krag/zod-schema` README for validation

## 🤝 Contributing

This is part of a monorepo. Make sure to:
1. Run commands from the monorepo root using `--filter`
2. Test with both Electron main and renderer processes
3. Encrypt sensitive data in electron-store
4. Document sync patterns in this README
5. Test offline functionality
