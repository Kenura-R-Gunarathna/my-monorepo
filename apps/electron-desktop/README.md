# Electron Desktop Application

Cross-platform desktop application built with Electron, React, TypeScript, and tRPC with local SQLite database.

## 📋 Overview

This is the desktop application for the monorepo, providing:
- 🖥️ Cross-platform desktop app (Windows, macOS, Linux)
- ⚡ Built with Electron + Vite for fast development
- ⚛️ React UI from `@krag/react-ui`
- 📡 Unified tRPC client (IPC + HTTP hybrid)
- 💾 Local SQLite database via `@krag/drizzle-orm-client`
- 🔐 Encrypted local storage with electron-store
- 🔄 Sync capabilities with web backend
- 🎨 Native OS integration

## 🏗️ Architecture

### Tech Stack
- **Framework**: Electron with Vite
- **UI**: React from `@krag/react-ui`
- **IPC Layer**: tRPC over Electron IPC
- **Database**: SQLite via `@krag/drizzle-orm-client`
- **Local Storage**: electron-store (encrypted)
- **Configuration**: `@krag/config/client` and `@krag/config/public`
- **Build**: electron-builder

### Project Structure
```
apps/electron-desktop/
├── src/
│   ├── main/                # Main process (Node.js)
│   │   ├── index.ts         # App entry point
│   │   ├── trpc/            # tRPC IPC handlers
│   │   └── db.ts            # SQLite database
│   ├── preload/             # Preload scripts
│   │   ├── index.ts         # IPC bridge
│   │   └── trpc.ts          # tRPC IPC client
│   └── renderer/            # Renderer process (Browser)
│       ├── src/
│       │   ├── App.tsx      # Main React app
│       │   └── main.tsx     # Entry point
│       └── index.html
├── resources/               # App resources
├── build/                   # Build assets
└── electron.vite.config.ts  # Vite configuration
```

### Process Architecture
```
┌─────────────────────────────────────────────┐
│         Renderer Process (Browser)          │
│  ┌───────────────────────────────────────┐  │
│  │     React UI (@krag/react-ui)         │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Unified tRPC Client            │  │  │
│  │  │  • Local routes → IPC           │  │  │
│  │  │  • Shared routes → IPC or HTTP  │  │  │
│  │  │  • Web routes → HTTP only       │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┘
               │ IPC Bridge (Preload)
┌──────────────▼──────────────────────────────┐
│         Main Process (Node.js)              │
│  ┌───────────────────────────────────────┐  │
│  │     tRPC IPC Router                   │  │
│  │  • store.* - electron-store           │  │
│  │  • system.* - System APIs             │  │
│  │  • db.* - SQLite CRUD                 │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │     SQLite Database                   │  │
│  │  (@krag/drizzle-orm-client)          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10.20.0+

### Installation
From the monorepo root:
```bash
pnpm install
```

### Environment Configuration
Create `.env.electron.development` in the monorepo root:
```env
# Client Configuration
API_ENDPOINT=http://localhost:4321
WEB_BASE_URL=http://localhost:4321

# Local Database
DB_FILE_NAME=local.db
DB_ENCRYPTION_KEY=your-encryption-key-here

# App Settings
ENABLE_SYNC=true
SYNC_INTERVAL=300000
```

See `@krag/config` package for full configuration options.

### Database Setup
The SQLite database is created automatically on first run. To manage it:

```bash
# Push schema to SQLite
pnpm --filter @krag/drizzle-orm-client db:push

# Seed initial data (optional)
pnpm --filter @krag/drizzle-orm-client db:seed

# Open Drizzle Studio
pnpm --filter @krag/drizzle-orm-client db:studio
```

### Development
```bash
# From monorepo root
pnpm dev:electron

# Or directly
cd apps/electron-desktop
pnpm dev
```

### Build
```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

Built apps will be in `dist/` directory.

## 🔧 Key Features

### Unified tRPC Client
The app uses a smart tRPC client that routes between IPC and HTTP:

```typescript
// Automatic routing based on procedure namespace
trpc.store.get.query()           // → IPC (local only)
trpc.system.getVersion.query()   // → IPC (local only)
trpc.user.list.query()           // → IPC or HTTP (shared)
trpc.auth.login.mutate()         // → HTTP (web only)
```

**Route Namespaces:**

| Namespace | Transport | Description |
|-----------|-----------|-------------|
| `store.*` | IPC | electron-store operations |
| `system.*` | IPC | System APIs (version, platform) |
| `db.*` | IPC | Local SQLite CRUD |
| `user.*` | IPC/HTTP | User management (shared) |
| `post.*` | IPC/HTTP | Content (shared) |
| `auth.*` | HTTP | OAuth/Social auth (web) |
| `analytics.*` | HTTP | Analytics (web only) |

### Electron Store (Encrypted Storage)
Secure local key-value storage:

```typescript
import { trpc } from './trpc'

// Store data
await trpc.store.set.mutate({ key: 'theme', value: 'dark' })

// Get data
const theme = await trpc.store.get.query({ key: 'theme' })

// Session management (encrypted)
await trpc.store.setSession.mutate({ userId: '123', token: 'abc' })
const session = await trpc.store.getSession.query()
```

### Local SQLite Database
```typescript
// In renderer (via tRPC)
const users = await trpc.db.users.list.query()
await trpc.db.users.create.mutate({ name: 'John', email: 'john@example.com' })

// In main process (direct access)
import { dbConn } from '@krag/drizzle-orm-client'

const users = await dbConn.query.users.findMany()
```

### System Integration
```typescript
// Get system info
const info = await trpc.system.getInfo.query()
// { platform: 'win32', version: '1.0.0', arch: 'x64' }

// Open external links
await trpc.system.openExternal.mutate({ url: 'https://example.com' })

// File dialogs
const file = await trpc.system.selectFile.mutate()
```

### Configuration Management
```typescript
// In main process
import { getConfig, getPublicConfig } from '@krag/config/client'

const config = getConfig()        // Full config (has secrets)
const publicConfig = getPublicConfig()  // Safe for renderer

// In renderer
import { getClientPublicConfig } from '@krag/config/public'

const config = getClientPublicConfig() // Only public values
```

### React Component Usage
```typescript
import { TRPCProvider } from '@krag/react-ui/providers/TRPCProvider'
import { Button } from '@krag/react-ui/components/ui/button'
import { UserList } from '@krag/react-ui/features/users'

function App() {
  return (
    <TRPCProvider>
      <UserList />
      <Button>Click me</Button>
    </TRPCProvider>
  )
}
```

## 🔄 Sync with Web Backend

The desktop app can sync with the web backend:

```typescript
// Check if sync is available
const canSync = await trpc.system.canSync.query()

if (canSync) {
  // Sync data
  await trpc.sync.syncAll.mutate()
  
  // Sync specific entities
  await trpc.sync.syncUsers.mutate()
  await trpc.sync.syncPosts.mutate()
}
```

Sync configuration in `.env.electron.development`:
```env
ENABLE_SYNC=true
SYNC_INTERVAL=300000  # 5 minutes
API_ENDPOINT=http://localhost:4321
```

## 📦 Dependencies

### Workspace Packages
- `@krag/react-ui` - Shared React components
- `@krag/drizzle-orm-client` - SQLite database
- `@krag/config` - Configuration management
- `@krag/casl-permissions` - Permission management
- `@krag/zod-schema` - Validation schemas

### External Dependencies
- `electron` - Desktop framework
- `electron-store` - Encrypted local storage
- `@trpc/client` - tRPC client
- `drizzle-orm` - Database ORM
- `react` - UI library
- `vite` - Build tool

## 🔒 Security

### Configuration Security
- Secrets stay in main process
- Use `@krag/config/client` in main process
- Use `@krag/config/public` in renderer
- IPC bridge only exposes safe APIs

### Encrypted Storage
- electron-store with encryption enabled
- Session data encrypted at rest
- Secure credential storage

### IPC Security
- Contextual isolation enabled
- Only whitelisted IPC channels
- No direct Node.js access from renderer

### Code Signing
Configure in `electron-builder.yml`:
```yaml
win:
  certificateFile: path/to/cert.pfx
  certificatePassword: ${CERT_PASSWORD}
mac:
  identity: "Developer ID Application: Your Name"
```

## 🧪 Development Tips

### Hot Module Replacement
Both renderer and main process support HMR in dev mode.

### DevTools
- Electron DevTools opened automatically in development
- React DevTools available
- tRPC DevTools in renderer console

### Debugging
```bash
# Debug main process
pnpm dev --inspect

# Debug with breakpoints
code --inspect-brk apps/electron-desktop
```

### Testing
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

## 📦 Building & Distribution

### Build Configuration
Edit `electron-builder.yml`:

```yaml
appId: com.example.app
productName: My App
directories:
  output: dist
  buildResources: build
files:
  - out/
  - node_modules/
  - package.json
```

### Auto-Update
Configure in `dev-app-update.yml`:

```yaml
provider: github
owner: your-username
repo: your-repo
```

### Code Signing
Required for macOS and Windows distribution. See electron-builder documentation.

## 🚀 Deployment

### Windows
```bash
pnpm build:win
```
Generates: `.exe` installer and portable app

### macOS
```bash
pnpm build:mac
```
Generates: `.dmg` and `.app`

### Linux
```bash
pnpm build:linux
```
Generates: `.AppImage`, `.deb`, `.rpm`

## 📚 Related Documentation

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Vite Documentation](https://electron-vite.org)
- [electron-builder Documentation](https://www.electron.build)
- See `@krag/config` README for configuration details
- See `@krag/drizzle-orm-client` README for database details
- See `@krag/react-ui` README for component usage

## 🤝 Contributing

This is part of a monorepo. Make sure to:
1. Run commands from the monorepo root using `--filter`
2. Use shared types from workspace packages
3. Follow the security conventions for config usage
4. Test IPC communication thoroughly
5. Test builds on target platforms before release
