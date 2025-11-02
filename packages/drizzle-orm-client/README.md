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
import { getDesktopDb } from '@krag/drizzle-orm-client'

const db = getDesktopDb()
```

### 2. Import Schema

```typescript
import { 
  users, 
  roles, 
  settings,
  localCache,
  syncQueue 
} from '@krag/drizzle-orm-client'
```

### 3. Query Data

```typescript
import { getDesktopDb, users } from '@krag/drizzle-orm-client'
import { eq, and } from 'drizzle-orm'

const db = getDesktopDb()

// Find all users
const allUsers = await db.query.users.findMany()

// Find one user
const user = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    role: true,
  }
})

// Complex query
const activeUsers = await db.query.users.findMany({
  where: eq(users.active, true),
  orderBy: (users, { desc }) => [desc(users.createdAt)],
})
```

### 4. Local Cache

```typescript
import { getDesktopDb, localCache } from '@krag/drizzle-orm-client'
import { eq } from 'drizzle-orm'

const db = getDesktopDb()

// Set cache
await db.insert(localCache).values({
  key: 'user_preferences',
  value: { theme: 'dark', language: 'en' },
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
})

// Get cache
const cache = await db.query.localCache.findFirst({
  where: eq(localCache.key, 'user_preferences')
})

if (cache && (!cache.expiresAt || cache.expiresAt > new Date())) {
  console.log('Cached data:', cache.value)
}

// Clear expired cache
await db.delete(localCache).where(lt(localCache.expiresAt, new Date()))
```

### 5. Sync Queue

```typescript
import { getDesktopDb, syncQueue } from '@krag/drizzle-orm-client'
import { eq } from 'drizzle-orm'

const db = getDesktopDb()

// Add to sync queue
await db.insert(syncQueue).values({
  entity: 'user',
  entityId: 123,
  operation: 'update',
  data: { name: 'John Doe', email: 'john@example.com' },
  synced: false,
})

// Get pending syncs
const pending = await db.query.syncQueue.findMany({
  where: eq(syncQueue.synced, false),
  orderBy: (queue, { asc }) => [asc(queue.createdAt)],
})

// Mark as synced
await db.update(syncQueue)
  .set({ synced: true })
  .where(eq(syncQueue.id, itemId))

// Clear synced items
await db.delete(syncQueue).where(eq(syncQueue.synced, true))
```

### 6. electron-store Integration

```typescript
import { store } from '@krag/drizzle-orm-client/store'

// Set value
store.set('theme', 'dark')

// Get value
const theme = store.get('theme') // 'dark'

// Set nested value
store.set('user.preferences.notifications', true)

// Get nested value
const notifications = store.get('user.preferences.notifications')

// Delete value
store.delete('theme')

// Clear all
store.clear()
```

### 7. Session Management

```typescript
import { 
  setSession, 
  getSession, 
  clearSession 
} from '@krag/drizzle-orm-client/store/session'

// Set session (encrypted)
await setSession({
  userId: 123,
  token: 'abc123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
})

// Get session
const session = await getSession()
if (session && session.expiresAt > new Date()) {
  console.log('User ID:', session.userId)
}

// Clear session
await clearSession()
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
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import { getConfig } from '@krag/config/client'
import * as schema from '../schema'

const config = getConfig()
const dbPath = path.join(app.getPath('userData'), config.DB_FILE_NAME)
const sqlite = new Database(dbPath)

export const db = drizzle(sqlite, { schema })

export function getDesktopDb() {
  return db
}
```

### electron-store Config (src/store/index.ts)

```typescript
import Store from 'electron-store'
import { getConfig } from '@krag/config/client'

const config = getConfig()

export const store = new Store({
  encryptionKey: config.STORE_ENCRYPTION_KEY,
  schema: {
    theme: {
      type: 'string',
      default: 'system'
    },
    enableSync: {
      type: 'boolean',
      default: true
    }
  }
})
```

## 🔄 Sync with Web Backend

```typescript
import { getDesktopDb, syncQueue } from '@krag/drizzle-orm-client'
import { eq } from 'drizzle-orm'

async function syncToServer() {
  const db = getDesktopDb()
  
  // Get pending operations
  const pending = await db.query.syncQueue.findMany({
    where: eq(syncQueue.synced, false)
  })
  
  for (const item of pending) {
    try {
      // Sync to server via HTTP
      await fetch(`${API_URL}/${item.entity}/${item.entityId}`, {
        method: item.operation === 'delete' ? 'DELETE' : 'PUT',
        body: JSON.stringify(item.data),
        headers: { 'Content-Type': 'application/json' }
      })
      
      // Mark as synced
      await db.update(syncQueue)
        .set({ synced: true })
        .where(eq(syncQueue.id, item.id))
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }
}

// Run sync every 5 minutes
setInterval(syncToServer, 5 * 60 * 1000)
```

## 🌱 Seeding

Edit `src/seed.ts`:

```typescript
import { getDesktopDb } from './db'
import { users, roles, settings } from './schema'

async function seed() {
  const db = getDesktopDb()
  
  // Create roles
  await db.insert(roles).values([
    { name: 'user', description: 'Regular User' },
    { name: 'admin', description: 'Administrator' },
  ])
  
  // Create default settings
  await db.insert(settings).values({
    theme: 'system',
    language: 'en',
    enableSync: true,
  })
  
  console.log('✅ Database seeded')
}

seed()
```

Run with:
```bash
pnpm --filter @krag/drizzle-orm-client db:seed
```

## 📦 Exports

```typescript
// Database connection
export { getDesktopDb } from './db'

// All tables
export * from './schema'

// electron-store
export { store } from './store'
export * from './store/session'
export * from './store/settings'
export * from './store/cache'

// Specific exports
export { 
  users, 
  roles, 
  settings,
  localCache,
  syncQueue 
} from './schema'
```

## 🔒 Security

### Database Encryption
SQLite database can be encrypted using SQLCipher:

```typescript
import Database from 'better-sqlite3'

const sqlite = new Database(dbPath)
sqlite.pragma(`key='${config.DB_ENCRYPTION_KEY}'`)
```

### electron-store Encryption
All sensitive data in electron-store is encrypted:

```typescript
export const store = new Store({
  encryptionKey: config.STORE_ENCRYPTION_KEY
})
```

## 🧪 Testing

```typescript
import { describe, it, expect } from 'vitest'
import { getDesktopDb, users } from '@krag/drizzle-orm-client'

describe('Users', () => {
  it('should create user', async () => {
    const db = getDesktopDb()
    
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
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [electron-store Documentation](https://github.com/sindresorhus/electron-store)
- See `@krag/config` README for configuration
- See `@krag/zod-schema` README for validation

## 🤝 Contributing

This is part of a monorepo. Make sure to:
1. Run commands from the monorepo root using `--filter`
2. Test with both Electron main and renderer processes
3. Encrypt sensitive data in electron-store
4. Document sync patterns in this README
5. Test offline functionality
