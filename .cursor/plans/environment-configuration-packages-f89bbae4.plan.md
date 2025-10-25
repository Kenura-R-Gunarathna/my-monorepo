<!-- f89bbae4-854b-4088-b1cd-f1d21d79cb92 e425dce5-bbf1-4173-968f-03efd455330f -->
# Environment Configuration Setup

## Overview

Create separate configuration packages for Astro and Electron with independent environment management, Zod validation, and type-safe imports.

## Package Structure

```
packages/
├── config-astro/
│   ├── src/
│   │   ├── index.ts          # Main config export
│   │   ├── schema.ts         # Zod validation schema
│   │   └── loader.ts         # Environment file loader
│   └── package.json
└── config-electron/
    ├── src/
    │   ├── index.ts          # Main config export
    │   ├── schema.ts         # Zod validation schema
    │   └── loader.ts         # Environment file loader
    └── package.json
```

## Environment Files (Root)

```
.env                           # Main mode selector
.env.astro.development        # Astro dev config
.env.astro.production         # Astro prod config
.env.electron.development     # Electron dev config
.env.electron.production      # Electron prod config
```

## Implementation Steps

### 1. Create `packages/config-astro`

**package.json:**

- Name: `@krag/config-astro`
- Dependencies: `zod`, `dotenv`
- Exports: `{ ".": "./src/index.ts" }`

**src/schema.ts:**

- Define Zod schema for Astro config
- Include: `API_URL`, `DATABASE_URL`, `PORT`, `NODE_ENV`, etc.

**src/loader.ts:**

- Read `ASTRO_MODE` from main `.env`
- Load `.env.astro.{mode}` file
- Merge with process.env

**src/index.ts:**

- Import schema and loader
- Validate environment variables
- Export typed config object
- Throw errors if validation fails

### 2. Create `packages/config-electron`

**package.json:**

- Name: `@krag/config-electron`
- Dependencies: `zod`, `dotenv`
- Exports: `{ ".": "./src/index.ts" }`

**src/schema.ts:**

- Define Zod schema for Electron config
- Include: `API_URL`, `WINDOW_WIDTH`, `WINDOW_HEIGHT`, `AUTO_UPDATE_URL`, etc.

**src/loader.ts:**

- Read `ELECTRON_MODE` from main `.env`
- Load `.env.electron.{mode}` file
- Merge with process.env

**src/index.ts:**

- Import schema and loader
- Validate environment variables
- Export typed config object
- Throw errors if validation fails

### 3. Create Root Environment Files

**.env:**

```env
ASTRO_MODE=development
ELECTRON_MODE=development
```

**.env.astro.development:**

```env
API_URL=http://localhost:4321
DATABASE_URL=postgresql://localhost:5432/dev
PORT=4321
NODE_ENV=development
```

**.env.astro.production:**

```env
API_URL=https://api.example.com
DATABASE_URL=postgresql://prod-db:5432/prod
PORT=3000
NODE_ENV=production
```

**.env.electron.development:**

```env
API_URL=http://localhost:4321
WINDOW_WIDTH=1200
WINDOW_HEIGHT=800
AUTO_UPDATE_URL=
NODE_ENV=development
```

**.env.electron.production:**

```env
API_URL=https://api.example.com
WINDOW_WIDTH=1200
WINDOW_HEIGHT=800
AUTO_UPDATE_URL=https://updates.example.com
NODE_ENV=production
```

### 4. Update `.gitignore`

Add:

```
.env
.env.*.local
.env.astro.*
.env.electron.*
```

Keep templates:

```
.env.example
.env.astro.example
.env.electron.example
```

### 5. Integrate into Apps

**apps/astro-web/package.json:**

- Add dependency: `@krag/config-astro: "workspace:*"`

**apps/astro-web/src/server/index.ts:**

```typescript
import { config } from '@krag/config-astro'

// Use: config.DATABASE_URL, config.API_URL, etc.
```

**apps/electron-desktop/package.json:**

- Add dependency: `@krag/config-electron: "workspace:*"`

**apps/electron-desktop/src/main/index.ts:**

```typescript
import { config } from '@krag/config-electron'

// Use: config.WINDOW_WIDTH, config.API_URL, etc.
```

### 6. Add Example Files

Create `.env.example`, `.env.astro.example`, `.env.electron.example` with all keys but no values for documentation.

## Key Features

- Independent mode control per app
- Zod validation at startup
- Type-safe config access
- Clear separation between Astro and Electron configs
- Fail-fast on missing/invalid environment variables

## Usage Pattern

```typescript
import { config } from '@krag/config-astro'

console.log(config.DATABASE_URL)  // Fully typed
console.log(config.API_URL)       // Autocomplete available
```

### To-dos

- [ ] Create packages/config-astro with package.json, schema.ts, loader.ts, and index.ts
- [ ] Create packages/config-electron with package.json, schema.ts, loader.ts, and index.ts
- [ ] Create root .env files (.env, .env.astro.development, .env.astro.production, .env.electron.development, .env.electron.production)
- [ ] Update .gitignore to exclude sensitive env files and create .env.example files
- [ ] Add @krag/config-astro to astro-web and update server to use config
- [ ] Add @krag/config-electron to electron-desktop and update main process to use config