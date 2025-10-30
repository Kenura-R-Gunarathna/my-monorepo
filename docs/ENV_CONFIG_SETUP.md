# Environment Configuration Setup

## Overview

This monorepo uses separate environment configuration packages for Astro and Electron with independent mode control, Zod validation, and type-safe access.

## Packages

### `@krag/config-astro`
Configuration package for the Astro web application.

### `@krag/config-electron`
Configuration package for the Electron desktop application.

## Environment Files

All environment files are in the project root:

```
.env                          # Mode selector (ASTRO_MODE, ELECTRON_MODE)
.env.astro.development       # Astro development config
.env.astro.production        # Astro production config
.env.electron.development    # Electron development config
.env.electron.production     # Electron production config
```

## Setup

### 1. Create `.env` file in project root:

```env
ASTRO_MODE=development
ELECTRON_MODE=development
```

### 2. Create Astro environment files:

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

### 3. Create Electron environment files:

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

## Usage

### In Astro Apps

```typescript
import { config } from '@krag/config-astro'

// Access typed config values
console.log(config.API_URL)      // Fully typed
console.log(config.DATABASE_URL) // Autocomplete available
console.log(config.PORT)         // TypeScript knows it's a number
```

### In Electron Apps

```typescript
import { config } from '@krag/config-electron'

// Use config values
const mainWindow = new BrowserWindow({
  width: config.WINDOW_WIDTH,
  height: config.WINDOW_HEIGHT
})

fetch(config.API_URL + '/api/health')
```

## Features

- **Independent Mode Control**: Each app can run in development or production mode independently
- **Zod Validation**: All environment variables are validated at startup
- **Type Safety**: Full TypeScript support with autocomplete
- **Fail-Fast**: App exits immediately if required env vars are missing or invalid
- **Clear Separation**: Astro and Electron configs are completely separate

## Validation

Both config packages validate required environment variables at startup using Zod schemas.

If validation fails, you'll see:
```
❌ Astro configuration validation failed:
[detailed error message]
```

## Changing Environments

To switch between development and production:

1. Edit `.env` file:
   ```env
   ASTRO_MODE=production      # or development
   ELECTRON_MODE=production   # or development
   ```

2. Restart your application

## Example Files

The repository includes `.env.astro.example` and `.env.electron.example` files as templates. Copy these and fill in your values.

## Notes

- All `.env*` files are gitignored except `.example` files
- Environment files are loaded from the project root
- Missing required variables will cause the app to exit on startup
- Optional variables can be omitted and will default to undefined
