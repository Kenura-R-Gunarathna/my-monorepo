# Monorepo Package Aliases Setup# Monorepo Package Aliases Setup# Alias Setup for @/packages/react-ui



This document explains how all package aliases are configured in this monorepo using the `@/packages/` prefix.kenura-uoc: why setting up alias in packages of a monorepo vite i shard?



## Why `@/packages/` Instead of `@packages/`?GitHub Copilot: Setting up aliases in a monorepo with Vite can be tricky due to **multiple configuration points** and **path resolution complexity**. Here are the main challenges:



Using `@/packages/` avoids confusion with npm scoped packages (like `@company/package-name`) and makes it clear these are internal monorepo packages.## Common Issues



## Available Package Aliases1. **Multiple `tsconfig.json` files**

   - Root workspace config

All packages in this monorepo have consistent aliases:   - Individual package configs

   - Paths need to be defined in each relevant config

```typescript

@/packages/better-auth/*       → packages/better-auth/src/*2. **Vite config per package**

@/packages/casl-permissions/*  → packages/casl-permissions/src/*   - Each Vite app needs its own alias configuration

@/packages/config-astro/*      → packages/config-astro/src/*   - Must resolve paths relative to the package location, not the root

@/packages/config-electron/*   → packages/config-electron/src/*

@/packages/database-core/*     → packages/database-core/src/*3. **Path resolution conflicts**

@/packages/database-desktop/*  → packages/database-desktop/src/*   - Node.js module resolution vs TypeScript vs Vite

@/packages/database-web/*      → packages/database-web/src/*   - Symlinked dependencies in node_modules can cause confusion

@/packages/react-ui/*          → packages/react-ui/src/*

@/packages/trpc-api/*          → packages/trpc-api/src/*4. **Workspace protocol**

@/packages/zod-schema/*        → packages/zod-schema/src/*   - Using `workspace:*` in package.json

```   - Build tools may not understand workspace references



## Configuration Structure## Typical Solution



Each alias is configured in **two places**:You need to configure aliases in **three places**:



### 1. Root `tsconfig.json`**1. Root `tsconfig.json`:**

```json

Located at: `my-monorepo/tsconfig.json`{

  "compilerOptions": {

```json    "baseUrl": ".",

{    "paths": {

  "compilerOptions": {      "@shared/*": ["packages/shared/src/*"],

    "baseUrl": ".",      "@utils/*": ["packages/utils/src/*"]

    "paths": {    }

      "@/packages/react-ui/*": ["packages/react-ui/src/*"],  }

      "@/packages/better-auth/*": ["packages/better-auth/src/*"],}

      "@/packages/casl-permissions/*": ["packages/casl-permissions/src/*"],```

      "@/packages/config-astro/*": ["packages/config-astro/src/*"],

      "@/packages/config-electron/*": ["packages/config-electron/src/*"],**2. Each package's `vite.config.ts`:**

      "@/packages/database-core/*": ["packages/database-core/src/*"],```typescript

      "@/packages/database-desktop/*": ["packages/database-desktop/src/*"],import { defineConfig } from 'vite'

      "@/packages/database-web/*": ["packages/database-web/src/*"],import path from 'path'

      "@/packages/trpc-api/*": ["packages/trpc-api/src/*"],

      "@/packages/zod-schema/*": ["packages/zod-schema/src/*"]export default defineConfig({

    }  resolve: {

  }    alias: {

}      '@shared': path.resolve(__dirname, '../../shared/src'),

```      '@utils': path.resolve(__dirname, '../../utils/src')

    }

**Purpose:** Allows all packages and apps to import from any package using the alias.  }

})

### 2. Each Package's `tsconfig.json````



Each package has its own tsconfig with a self-referencing alias:**3. Package `tsconfig.json`:**

```json

**Example:** `packages/better-auth/tsconfig.json`{

```json  "extends": "../../tsconfig.json",

{  "compilerOptions": {

  "compilerOptions": {    "baseUrl": ".",

    // ... other options    "paths": {

    "baseUrl": ".",      "@shared/*": ["../../shared/src/*"]

    "paths": {    }

      "@/packages/better-auth/*": ["./src/*"]  }

    }}

  }```

}

```The coordination between these three systems is what makes it "hard"!



**Purpose:** Allows the package to use its own alias internally.---



## Usage ExamplesThis document explains how all package aliases are configured in this monorepo.This document explains how the `@/packages/react-ui` alias is configured in this monorepo package.



### Cross-Package Imports



Import from any package in your monorepo:## Available Package Aliases## Why Aliases in Monorepo are Hard



```typescript

// In apps/astro-web or apps/electron-desktop

import { Button } from '@/packages/react-ui/components/ui/button'All packages in this monorepo have consistent aliases using the `@/packages/` prefix:Setting up aliases in a monorepo with Vite is tricky because you need to configure **multiple systems** that each handle path resolution differently:

import { authClient } from '@/packages/better-auth/client'

import { userSchema } from '@/packages/zod-schema/user'

import { trpc } from '@/packages/trpc-api/client'

import { db } from '@/packages/database-web/client'```typescript1. **TypeScript Compiler** - Needs to know how to resolve types

import { defineAbilityFor } from '@/packages/casl-permissions/abilities'

import { loadAstroConfig } from '@/packages/config-astro'@/packages/react-ui/*          → packages/react-ui/src/*2. **Vite Bundler** - Needs to know how to resolve modules during build

import { loadElectronConfig } from '@/packages/config-electron'

```@/packages/better-auth/*       → packages/better-auth/src/*3. **Multiple Config Files** - Root and package-level configs must be coordinated



### Internal Package Imports@/packages/casl-permissions/*  → packages/casl-permissions/src/*



Use aliases within the same package:@/packages/database-core/*     → packages/database-core/src/*## The Three Configuration Points



```typescript@/packages/database-desktop/*  → packages/database-desktop/src/*

// In packages/better-auth/src/middleware/auth.ts

import { authClient } from '@/packages/better-auth/client'@/packages/database-web/*      → packages/database-web/src/*### 1. Root `tsconfig.json`

import { userSchema } from '@/packages/better-auth/schema'

@/packages/trpc-api/*          → packages/trpc-api/src/*

// Instead of relative paths:

// import { authClient } from '../client'@/packages/zod-schema/*        → packages/zod-schema/src/*Located at: `my-monorepo/tsconfig.json`

// import { userSchema } from '../schema'

``````



### Database Packages```json



```typescript## Configuration Structure{

// Web database (PostgreSQL/MySQL for web apps)

import { db } from '@/packages/database-web/client'  "compilerOptions": {

import { users, posts } from '@/packages/database-web/schema'

Each alias is configured in **two places**:    "baseUrl": ".",

// Desktop database (SQLite for Electron)

import { db } from '@/packages/database-desktop/client'    "paths": {

import { settings } from '@/packages/database-desktop/schema'

### 1. Root `tsconfig.json`      "@/packages/react-ui/*": ["packages/react-ui/src/*"]

// Shared core utilities

import { createTransaction } from '@/packages/database-core/utils'    }

```

Located at: `my-monorepo/tsconfig.json`  }

### Config Packages

}

```typescript

// Astro-specific configuration```json```

import { astroEnv, loadAstroConfig } from '@/packages/config-astro'

{

// Electron-specific configuration

import { electronEnv, loadElectronConfig } from '@/packages/config-electron'  "compilerOptions": {**Purpose:** Allows other packages/apps in the monorepo to import from `@/packages/react-ui`

```

    "baseUrl": ".",

### API & Schema Packages

    "paths": {**Example usage from other packages:**

```typescript

// tRPC API      "@/packages/react-ui/*": ["packages/react-ui/src/*"],```typescript

import { appRouter } from '@/packages/trpc-api/router'

import { createContext } from '@/packages/trpc-api/context'      "@/packages/better-auth/*": ["packages/better-auth/src/*"],import { Button } from '@/packages/react-ui/components/ui/button'



// Zod Schemas      "@/packages/casl-permissions/*": ["packages/casl-permissions/src/*"],import { LoginForm } from '@/packages/react-ui/components/auth/login-form'

import { 

  loginSchema,       "@/packages/database-core/*": ["packages/database-core/src/*"],```

  signupSchema 

} from '@/packages/zod-schema/auth'      "@/packages/database-desktop/*": ["packages/database-desktop/src/*"],

import { 

  createPostSchema,       "@/packages/database-web/*": ["packages/database-web/src/*"],### 2. Package `tsconfig.app.json`

  updatePostSchema 

} from '@/packages/zod-schema/post'      "@/packages/trpc-api/*": ["packages/trpc-api/src/*"],

```

      "@/packages/zod-schema/*": ["packages/zod-schema/src/*"]Located at: `packages/react-ui/tsconfig.app.json`

## Special Case: Vite-Based Packages

    }

For packages using Vite (like `react-ui`), you also need to configure `vite.config.ts`:

  }```json

**File:** `packages/react-ui/vite.config.ts`

```typescript}{

import { defineConfig } from 'vite'

import path from 'path'```  "compilerOptions": {



export default defineConfig({    "baseUrl": ".",

  resolve: {

    alias: {**Purpose:** Allows all packages and apps to import from any package using the alias.    "paths": {

      '@/packages/react-ui': path.resolve(__dirname, './src'),

    },      "@/*": ["./src/*"],

  },

  // ... other config### 2. Each Package's `tsconfig.json`      "@/packages/react-ui/*": ["./src/*"]

})

```    }



**When needed:**Each package has its own tsconfig with a self-referencing alias:  }

- Only for packages with their own Vite build setup

- Required for proper bundling in library mode}

- Must use absolute paths with `path.resolve(__dirname, ...)`

**Example:** `packages/better-auth/tsconfig.json````

## Apps Configuration

```json

Your apps (`apps/astro-web`, `apps/electron-desktop`) need their own alias configuration:

{**Purpose:** Allows the package itself to use the alias internally

### Astro Apps

  "compilerOptions": {

**File:** `apps/astro-web/astro.config.mjs`

```javascript    // ... other options**Example usage within react-ui package:**

import { defineConfig } from 'astro/config'

import path from 'path'    "baseUrl": ".",```typescript

import { fileURLToPath } from 'url'

    "paths": {// Instead of relative paths:

const __dirname = fileURLToPath(new URL('.', import.meta.url))

      "@/packages/better-auth/*": ["./src/*"]import { cn } from '@/packages/react-ui/lib/utils'

export default defineConfig({

  vite: {    }// vs

    resolve: {

      alias: {  }import { cn } from './lib/utils'

        '@/packages/react-ui': path.resolve(__dirname, '../../packages/react-ui/src'),

        '@/packages/better-auth': path.resolve(__dirname, '../../packages/better-auth/src'),}```

        '@/packages/config-astro': path.resolve(__dirname, '../../packages/config-astro/src'),

        '@/packages/database-web': path.resolve(__dirname, '../../packages/database-web/src'),```

        '@/packages/trpc-api': path.resolve(__dirname, '../../packages/trpc-api/src'),

        '@/packages/zod-schema': path.resolve(__dirname, '../../packages/zod-schema/src'),### 3. Package `vite.config.ts`

        // Add other packages as needed

      },**Purpose:** Allows the package to use its own alias internally.

    },

  },Located at: `packages/react-ui/vite.config.ts`

})

```## Usage Examples



### Electron Apps```typescript



**File:** `apps/electron-desktop/electron.vite.config.ts`### Cross-Package Importsimport { defineConfig } from 'vite'

```typescript

import { defineConfig } from 'electron-vite'import path from 'path'

import path from 'path'

Import from any package in your monorepo:

export default defineConfig({

  renderer: {export default defineConfig({

    resolve: {

      alias: {```typescript  resolve: {

        '@/packages/react-ui': path.resolve(__dirname, '../../packages/react-ui/src'),

        '@/packages/better-auth': path.resolve(__dirname, '../../packages/better-auth/src'),// In apps/astro-web or apps/electron-desktop    alias: {

        '@/packages/config-electron': path.resolve(__dirname, '../../packages/config-electron/src'),

        '@/packages/database-desktop': path.resolve(__dirname, '../../packages/database-desktop/src'),import { Button } from '@/packages/react-ui/components/ui/button'      '@': path.resolve(__dirname, './src'),

        '@/packages/trpc-api': path.resolve(__dirname, '../../packages/trpc-api/src'),

        '@/packages/zod-schema': path.resolve(__dirname, '../../packages/zod-schema/src'),import { authClient } from '@/packages/better-auth/client'      '@/packages/react-ui': path.resolve(__dirname, './src'),

        // Add other packages as needed

      },import { userSchema } from '@/packages/zod-schema/user'    },

    },

  },import { trpc } from '@/packages/trpc-api/client'  },

})

```import { db } from '@/packages/database-web/client'  // ... other config



## Why Aliases in Monorepos Are Hardimport { defineAbilityFor } from '@/packages/casl-permissions/abilities'})



Setting up aliases in a monorepo is challenging because of:``````



1. **Multiple Configuration Systems**

   - TypeScript path mapping (`tsconfig.json`)

   - Bundler resolution (Vite, Webpack, etc.)### Internal Package Imports**Purpose:** Tells Vite how to resolve the alias during bundling

   - Node.js module resolution

   - Each system needs its own configuration



2. **Multiple Config Files**Use aliases within the same package:**Important:** Must use `path.resolve(__dirname, ...)` to get absolute paths

   - Root workspace config

   - Individual package configs

   - App-specific configs

   - All must be coordinated```typescript## What About `packages/react-ui/tsconfig.json`?



3. **Path Resolution Complexity**// In packages/better-auth/src/middleware/auth.ts

   - Relative paths differ based on where the config lives

   - Symlinked dependencies in `node_modules` can confuse toolsimport { authClient } from '@/packages/better-auth/client'This file should **NOT** contain path aliases:

   - Build vs development environments may differ

import { userSchema } from '@/packages/better-auth/schema'

4. **Workspace Protocol**

   - `workspace:*` in `package.json` works for npm/pnpm```json

   - But TypeScript and bundlers need explicit path mapping

// Instead of relative paths:{

## Benefits

// import { authClient } from '../client'  "files": [],

✅ **Clean imports** - No complex relative paths like `../../../../packages/...`  

✅ **Refactor-friendly** - Move files without breaking imports  // import { userSchema } from '../schema'  "references": [

✅ **Consistent** - Same import pattern across all packages  

✅ **Type-safe** - Full TypeScript support  ```    { "path": "./tsconfig.app.json" },

✅ **IDE support** - Autocomplete and go-to-definition work perfectly  

✅ **Clear dependencies** - Easy to see cross-package dependencies      { "path": "./tsconfig.node.json" }

✅ **No npm confusion** - `@/packages/` clearly distinguishes from `@scope/package`

### Database Packages  ]

## Common Issues

}

### Issue: "Cannot find module '@/packages/xxx'"

```typescript```

**Solution:** 

1. Check root `tsconfig.json` has the alias defined// Web database (PostgreSQL/MySQL for web apps)

2. Check the package's own `tsconfig.json` has the alias

3. If using Vite/Astro, check their config files have the aliasimport { db } from '@/packages/database-web/client'**Why?** This is a [project references file](https://www.typescriptlang.org/docs/handbook/project-references.html) that just points to other configs. The actual path configuration belongs in `tsconfig.app.json`.

4. Restart your TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "Restart TS Server")

import { users, posts } from '@/packages/database-web/schema'

### Issue: Works in TypeScript but fails at runtime

## Common Issues

**Solution:** The bundler (Vite/Astro/Webpack) needs its own alias configuration. Add to `vite.config.ts` or similar.

// Desktop database (SQLite for Electron)

### Issue: Circular dependencies

import { db } from '@/packages/database-desktop/client'### Issue 1: "Cannot find module '@/packages/react-ui/...'"

**Solution:** Aliases make it easier to create circular dependencies. Keep packages focused and avoid importing back to dependent packages.

import { settings } from '@/packages/database-desktop/schema'

### Issue: Different paths in dev vs build

**Solution:** Check all three config files are set up correctly

**Solution:** Use `path.resolve(__dirname, ...)` for absolute paths rather than relative paths in Vite configs.

// Shared core utilities

## Package Purposes

import { createTransaction } from '@/packages/database-core/utils'### Issue 2: TypeScript finds it but Vite doesn't (or vice versa)

- **`@/packages/better-auth`** - Authentication logic and client (Better Auth)

- **`@/packages/casl-permissions`** - Authorization and permissions (CASL)```

- **`@/packages/config-astro`** - Environment configuration for Astro apps

- **`@/packages/config-electron`** - Environment configuration for Electron apps**Solution:** Make sure both `tsconfig.app.json` paths and `vite.config.ts` alias point to the same location

- **`@/packages/database-core`** - Shared database utilities and types

- **`@/packages/database-desktop`** - SQLite schemas and client for Electron### API & Schema Packages

- **`@/packages/database-web`** - PostgreSQL/MySQL schemas for web apps

- **`@/packages/react-ui`** - Shared React components (shadcn/ui)### Issue 3: Works in one package but not another

- **`@/packages/trpc-api`** - tRPC API routers and procedures

- **`@/packages/zod-schema`** - Shared validation schemas```typescript



## Quick Reference// tRPC API**Solution:** Verify the root `tsconfig.json` has the alias defined



| Package | Alias | Use Case |import { appRouter } from '@/packages/trpc-api/router'

|---------|-------|----------|

| better-auth | `@/packages/better-auth/*` | Authentication |import { createContext } from '@/packages/trpc-api/context'## Testing the Setup

| casl-permissions | `@/packages/casl-permissions/*` | Authorization |

| config-astro | `@/packages/config-astro/*` | Astro env config |

| config-electron | `@/packages/config-electron/*` | Electron env config |

| database-core | `@/packages/database-core/*` | Shared DB utils |// Zod Schemas### Within the react-ui package:

| database-desktop | `@/packages/database-desktop/*` | SQLite for Electron |

| database-web | `@/packages/database-web/*` | PostgreSQL/MySQL for web |import { 

| react-ui | `@/packages/react-ui/*` | UI components |

| trpc-api | `@/packages/trpc-api/*` | API layer |  loginSchema, ```typescript

| zod-schema | `@/packages/zod-schema/*` | Validation schemas |

  signupSchema // src/components/test.tsx

---

} from '@/packages/zod-schema/auth'import { cn } from '@/packages/react-ui/lib/utils'  // Should work

**Last Updated:** October 28, 2025

import { import { Button } from '@/packages/react-ui/components/ui/button'  // Should work

  createPostSchema, ```

  updatePostSchema 

} from '@/packages/zod-schema/post'### From another package (e.g., apps/astro-web):

```

```typescript

## Special Case: Vite-Based Packages// apps/astro-web/src/pages/index.astro

import { Button } from '@/packages/react-ui/components/ui/button'

For packages using Vite (like `react-ui`), you also need to configure `vite.config.ts`:import { LoginForm } from '@/packages/react-ui/components/auth/login-form'

```

**File:** `packages/react-ui/vite.config.ts`

```typescript**Note:** The consuming app also needs to configure the alias in its own `vite.config` or `astro.config` to resolve the alias during its build process.

import { defineConfig } from 'vite'

import path from 'path'## Summary



export default defineConfig({The coordination between **TypeScript path mapping** and **Vite's resolve.alias** across multiple configuration files is what makes monorepo aliases tricky. But once set up correctly in all three places, you get:

  resolve: {

    alias: {✅ Type-safe imports across packages  

      '@/packages/react-ui': path.resolve(__dirname, './src'),✅ Clean, consistent import paths  

    },✅ No complex relative paths like `../../packages/react-ui/src/...`  

  },✅ Easy refactoring and code organization

  // ... other config
})
```

**When needed:**
- Only for packages with their own Vite build setup
- Required for proper bundling in library mode
- Must use absolute paths with `path.resolve(__dirname, ...)`

## Apps Configuration

Your apps (`apps/astro-web`, `apps/electron-desktop`) may need additional configuration:

### Astro Apps

**File:** `apps/astro-web/astro.config.mjs`
```javascript
import { defineConfig } from 'astro/config'
import path from 'path'

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@/packages/react-ui': path.resolve(__dirname, '../../packages/react-ui/src'),
        '@/packages/better-auth': path.resolve(__dirname, '../../packages/better-auth/src'),
        // ... other aliases as needed
      },
    },
  },
})
```

### Electron Apps

**File:** `apps/electron-desktop/electron.vite.config.ts`
```typescript
import { defineConfig } from 'electron-vite'
import path from 'path'

export default defineConfig({
  renderer: {
    resolve: {
      alias: {
        '@/packages/react-ui': path.resolve(__dirname, '../../packages/react-ui/src'),
        '@/packages/database-desktop': path.resolve(__dirname, '../../packages/database-desktop/src'),
        // ... other aliases as needed
      },
    },
  },
})
```

## Benefits

✅ **Clean imports** - No complex relative paths  
✅ **Refactor-friendly** - Move files without breaking imports  
✅ **Consistent** - Same import pattern across all packages  
✅ **Type-safe** - Full TypeScript support  
✅ **IDE support** - Autocomplete and go-to-definition work perfectly  
✅ **Clear dependencies** - Easy to see cross-package dependencies  

## Common Issues

### Issue: "Cannot find module '@/packages/xxx'"

**Solution:** 
1. Check root `tsconfig.json` has the alias defined
2. Check the package's own `tsconfig.json` has the alias
3. If using Vite/Astro, check their config files have the alias
4. Restart your TypeScript server in VS Code

### Issue: Works in TypeScript but fails at runtime

**Solution:** The bundler (Vite/Astro/Webpack) needs its own alias configuration. Add to `vite.config.ts` or similar.

### Issue: Circular dependencies

**Solution:** Aliases make it easier to create circular dependencies. Keep packages focused and avoid importing back to dependent packages.

## Package Purposes

- **`@/packages/react-ui`** - Shared React components (shadcn/ui)
- **`@/packages/better-auth`** - Authentication logic and client
- **`@/packages/casl-permissions`** - Authorization and permissions (CASL)
- **`@/packages/database-core`** - Shared database utilities
- **`@/packages/database-web`** - PostgreSQL/MySQL schemas for web
- **`@/packages/database-desktop`** - SQLite schemas for Electron
- **`@/packages/trpc-api`** - tRPC API routers and procedures
- **`@/packages/zod-schema`** - Shared validation schemas

---

**Last Updated:** October 28, 2025
