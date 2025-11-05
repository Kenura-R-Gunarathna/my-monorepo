# ✅ Settings Architecture Clarification

## Separation of Concerns

### 🎯 The Right Architecture

**Server Settings (astro-web):**
- Stored in MySQL database (`settings` table)
- Managed by server-side code
- Accessed via tRPC API from astro-web
- Examples: Global app settings, feature flags, server config

**Client Settings (electron-desktop):**
- Stored locally using electron-store
- Managed by `apps/electron-desktop/src/main/services/settings-manager.ts`
- Examples: Theme, language, Dolt sync settings, offline queue config

---

## 📦 What Changed

### ❌ Removed from `@krag/drizzle-orm-client`

**File: `packages/drizzle-orm-client/src/store/settings.ts`**
- ❌ This file should be **deprecated** (but keeping for now to avoid breaking changes)
- ❌ No longer exported from package index

**File: `packages/drizzle-orm-client/src/store/index.ts`**
```typescript
// OLD - exported everything
export * from './store';

// NEW - only exports session and cache
export * from './session';
export * from './cache';
export { createSecureStore };
```

**File: `packages/drizzle-orm-client/src/index.ts`**
```typescript
// OLD
export * from './store';

// NEW - explicit exports
export * from './store/session';
export * from './store/cache';
export { createSecureStore } from './store';
```

### ✅ Updated in `apps/electron-desktop`

**File: `apps/electron-desktop/src/main/services/settings-manager.ts`**

New interface structure (flattened for easier access):
```typescript
export interface AppSettings {
  // UI preferences (client-only)
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  preferences: Record<string, unknown>
  
  // Sync settings (client-only)
  autoSync: boolean
  syncInterval: number // minutes
  lastSyncAt: number
  
  // Dolt-specific settings (client-only)
  dolt: {
    remoteUrl: string
    branch: string
    username: string
    conflictResolution: 'ours' | 'theirs' | 'manual'
  }
  
  // Offline queue settings (client-only)
  offline: {
    enabled: boolean
    maxQueueSize: number
    retryAttempts: number
    retryDelay: number
  }
}
```

Added helper methods for tRPC compatibility:
```typescript
class SettingsManager {
  // ... existing methods ...
  
  theme = {
    get: () => this.get('theme'),
    set: (theme) => this.set('theme', theme)
  }
}

export const settingsManager = new SettingsManager()
```

**File: `apps/electron-desktop/src/main/trpc/index.ts`**

Updated import:
```typescript
// OLD
import { sessionManager, settingsManager, type AppSettings } from '@krag/drizzle-orm-client'

// NEW
import { sessionManager } from '@krag/drizzle-orm-client'
import { settingsManager, type AppSettings } from '../services/settings-manager'
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         astro-web                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             Server Settings (MySQL)                   │  │
│  │  • Global app config                                  │  │
│  │  • Feature flags                                      │  │
│  │  • Server-side preferences                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                 │
│                           │                                 │
│                      tRPC API                               │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    electron-desktop                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Client Settings (electron-store)             │  │
│  │  • Theme, language, notifications                     │  │
│  │  • Dolt sync config (remoteUrl, branch, etc)         │  │
│  │  • Offline queue settings                             │  │
│  │  • Auto-sync preferences                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │       Session Store (electron-store)                  │  │
│  │  • Auth token                                         │  │
│  │  • User info                                          │  │
│  │  • Roles & permissions                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Cache Store (electron-store)                  │  │
│  │  • Temporary data                                     │  │
│  │  • Offline queue                                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Data Flow

### Server Settings Flow
```
User → Astro Web UI → tRPC API → MySQL Database
                                      ↓
                              Settings Table
                                      ↓
                         (Synced to client if needed)
```

### Client Settings Flow
```
User → Electron App → SettingsManager → electron-store → Local Disk
                                                              ↓
                                                    ~/.config/app-settings/
```

---

## 🔐 What Stays in @krag/drizzle-orm-client

Only stores that need encryption and are truly client-specific:

1. **Session Store** (`session.ts`)
   - Auth tokens
   - User session data
   - Should stay encrypted

2. **Cache Store** (`cache.ts`)
   - Temporary offline data
   - Should stay encrypted

3. **Utility** (`createSecureStore`)
   - Helper function for creating encrypted stores
   - Can be reused by electron-desktop

---

## ✅ Benefits of This Separation

1. **Clear Boundaries**: Server settings vs client settings
2. **Type Safety**: Each has its own interface
3. **Security**: Sensitive data stays encrypted
4. **Flexibility**: Client settings can change independently
5. **No Confusion**: One source of truth for each type

---

## 🚀 Next Steps

- [ ] Test tRPC settings routes still work
- [ ] Verify theme switching works
- [ ] Remove deprecated `settings.ts` from drizzle-orm-client (optional)
- [ ] Update any other imports if needed
- [ ] Document server settings API for astro-web

---

**Architecture is now properly separated!** 🎉

Server settings → MySQL (via astro-web)  
Client settings → electron-store (via electron-desktop)
