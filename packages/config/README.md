# @krag/config

Unified, secure configuration management for the monorepo with built-in security boundaries between client and server code.

## Features

✅ **Single Source of Truth** - One package for all configuration  
✅ **Type-Safe** - Full TypeScript support with Zod validation  
✅ **Security by Default** - Prevents secrets from leaking to client  
✅ **Multi-Environment** - Cascading `.env` file support  
✅ **Dev Mode Protection** - Runtime guards + Vite plugin catch violations  
✅ **HMR-Safe** - Works correctly with hot module replacement  

## Installation

```bash
pnpm install
```

## Usage

### Server-Side (Astro API routes, SSR, Node.js servers, Electron main)

```typescript
// ✅ In API routes, middleware, SSR components, Electron main process
import { getServerConfig, getPublicConfig } from '@krag/config/server'

const serverConfig = getServerConfig() // Has DATABASE_URL, secrets
const publicConfig = getPublicConfig() // Only safe values
```

### Client-Side (Browser, Renderer)

```typescript
// ✅ In client components, browser code, Electron renderer
import { getServerPublicConfig } from '@krag/config/public'

const config = getServerPublicConfig() // Only BASE_URL, API_ENDPOINT, etc.
```

### Client App Configuration (Electron main process)

```typescript
// ✅ In Electron main process for desktop app configuration
import { getConfig, getPublicConfig } from '@krag/config/client'

const appConfig = getConfig() // Full client config
const publicConfig = getPublicConfig() // Safe for renderer
```

## Package Exports

```typescript
// Utilities and types
import { ... } from '@krag/config'

// Server-side (Astro SSR, API routes, Node.js servers, Electron main)
import { ... } from '@krag/config/server'

// Client app configuration (Electron main process)
import { ... } from '@krag/config/client'

// Client-safe public config (browser, renderer)
import { ... } from '@krag/config/public'

// Vite security plugin
import { configSecurityPlugin } from '@krag/config/vite-plugin'
```

## Configuration Structure

### Server Config

**Public** (safe for browser):
- `BASE_URL`
- `API_ENDPOINT`
- `ENABLE_ANALYTICS`
- `APP_VERSION`
- `NODE_ENV`, `IS_DEV`, `LOG_LEVEL`

**Private** (never expose):
- `DATABASE_URL`
- `SESSION_SECRET`
- `BETTER_AUTH_URL`
- OAuth secrets (`GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET`)
- API keys (`RESEND_API_KEY`, `STRIPE_SECRET_KEY`)

### Client Config

**Public** (safe for renderer):
- `API_URL`
- `WINDOW_WIDTH`, `WINDOW_HEIGHT`
- `ENABLE_DEV_TOOLS`
- `NODE_ENV`, `IS_DEV`, `LOG_LEVEL`

**Private** (main process only):
- `DB_FILE_NAME`
- `DB_ENCRYPTION_KEY`
- `AUTO_UPDATE_URL`
- `LICENSE_KEY`
- Security settings

## Environment Files

Priority (last wins):
1. `.env` - Committed defaults
2. `.env.development` / `.env.production` - Environment-specific
3. `.env.development.local` / `.env.production.local` - Git-ignored
4. `.env.local` - Git-ignored, highest priority

```bash
# Setup
cp .env.example .env.local
# Edit .env.local with your secrets
```

## Security Features

### 1. Runtime Guards

```typescript
// Throws error if imported in browser
import { getServerConfig } from '@krag/config/server'
```

### 2. Vite Plugin (Dev Mode)

Catches wrong imports during development:

```typescript
// vite.config.ts
import { configSecurityPlugin } from '@krag/config/vite-plugin'

export default defineConfig({
  plugins: [
    configSecurityPlugin({
      serverModules: ['@krag/config/server', '@krag/config/client'],
      clientPatterns: [/src\/components/, /src\/pages/],
    }),
  ],
})
```

### 3. Package.json Exports

Only specific files are importable:
- `/server` - Server-side only
- `/client` - Client app main process only
- `/public` - Client-safe
- `/vite-plugin` - Build tool

### 4. Type System

TypeScript prevents accessing secrets from public config types.

## Development Workflow

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev with validation
pnpm dev  # Runs quick-validate.js first

# 3. Fix any violations shown in console
```

## Quick Validation

```bash
# Check for security violations before commit
pnpm validate:security
```

Scans for:
- Server config imports in client files
- Secrets in browser bundles
- Wrong module usage

## VS Code Integration

Add to `.vscode/settings.json`:

```json
{
  "emeraldwalk.runonsave": {
    "commands": [{
      "match": "src/.*\\.(ts|tsx|js|jsx)$",
      "cmd": "node scripts/quick-validate.js"
    }]
  }
}
```

Gets you instant validation on save!

## Examples

### Server API Route (Astro/Node.js)

```typescript
// src/pages/api/users.ts
import { getServerConfig } from '@krag/config/server'

export async function GET() {
  const config = getServerConfig()
  const db = await connectDB(config.DATABASE_URL)
  return Response.json(await db.users.findMany())
}
```

### Client Component

```tsx
// src/components/Dashboard.tsx
import { getServerPublicConfig } from '@krag/config/public'

export function Dashboard() {
  const config = getServerPublicConfig()
  return <div>API: {config.API_ENDPOINT}</div>
}
```

### Electron Preload Script

```typescript
// src/preload/index.ts
import { contextBridge } from 'electron'
import { getPublicConfig } from '@krag/config/client'

contextBridge.exposeInMainWorld(
  '__CLIENT_PUBLIC_CONFIG__',
  getPublicConfig()
)
```

## Troubleshooting

### "Cannot import @krag/config/server in browser"

✅ **Fix**: Use `@krag/config/public` instead

### "Config not available"

✅ **Fix**: Ensure Vite is configured with `define: { __SERVER_PUBLIC_CONFIG__: ... }`

### HMR breaks after config change

✅ **Fix**: Restart dev server (`pnpm dev`)

## Contributing

When adding new config values:

1. Add to schema in `src/types.ts`
2. Classify as PUBLIC or PRIVATE
3. Update `SECURITY_BOUNDARIES` in `src/security.ts`
4. Update `.env.example`
5. Run `pnpm validate:security`

## License

Private - Internal use only
