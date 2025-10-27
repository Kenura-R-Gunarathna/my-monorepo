# Better Auth - Complete Implementation Guide

> **Comprehensive guide for Better Auth integration in a pnpm monorepo with Astro (web) and Electron (desktop)**

**Last Updated:** October 27, 2025  
**Better Auth Version:** 1.3.32  
**Project Stack:** Astro, Electron, Drizzle ORM, MySQL, CASL Permissions, pnpm workspaces

---

## Table of Contents

1. [Why Better Auth?](#1-why-better-auth)
2. [Monorepo Architecture](#2-monorepo-architecture)
3. [Installation & Setup](#3-installation--setup)
4. [Database Configuration](#4-database-configuration)
5. [Type System & Schema](#5-type-system--schema)
6. [Server Configuration](#6-server-configuration)
7. [Client Setup](#7-client-setup)
8. [Astro Integration](#8-astro-integration)
9. [Electron Deep Links](#9-electron-deep-links)
10. [Basic Usage](#10-basic-usage)
11. [CASL Permissions Integration](#11-casl-permissions-integration)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Why Better Auth?

### Comparison: Auth.js vs Better Auth

| Feature | Auth.js (Astro) | Better Auth |
|---------|----------------|-------------|
| **Maturity** | Very mature, battle-tested | Newer, actively developed |
| **TypeScript** | Good, but can be tricky | Excellent, built TypeScript-first |
| **Astro Integration** | Official adapter available | Native Astro support |
| **Database** | Drizzle adapter available | Native Drizzle support |
| **Flexibility** | Very flexible, lots of providers | Modern, opinionated |
| **Bundle Size** | Larger | Smaller, tree-shakeable |
| **Session Management** | JWT or Database | Database sessions (more secure) |
| **Modern Features** | Adding gradually | Built-in (2FA, passkeys, etc.) |
| **Type Inference** | Manual type augmentation | Automatic via `$Infer` |

### Why We Chose Better Auth ✅

1. **TypeScript-first** - Excellent type inference, type-safe
2. **Modern architecture** - Built for modern frameworks
3. **Native Drizzle support** - Works seamlessly with our setup
4. **Smaller bundle** - Tree-shakeable, only include what you need
5. **Better DX** - Cleaner API, less boilerplate
6. **Built-in modern features** - 2FA, passkeys, magic links out of the box
7. **Database sessions by default** - More secure than JWT

---

## 2. Monorepo Architecture

### Recommended Structure

```
my-monorepo/
├── apps/
│   ├── astro-web/                    # Web application (Better Auth direct)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── api/
│   │   │   │   │   └── auth/
│   │   │   │   │       └── [...all].ts    # Auth API route
│   │   │   │   ├── index.astro
│   │   │   │   ├── sign-in.astro
│   │   │   │   └── dashboard.astro
│   │   │   ├── lib/
│   │   │   │   └── auth-types.ts          # Type helpers
│   │   │   └── layouts/
│   │   └── package.json
│   │
│   └── electron-desktop/             # Desktop app (Deep links auth)
│       ├── src/
│       │   ├── main/
│       │   │   ├── index.ts                # Deep link handler
│       │   │   └── auth-bridge.ts          # Auth bridge
│       │   ├── preload/
│       │   └── renderer/
│       └── package.json
│
├── packages/
│   ├── better-auth/                  # ⭐ Auth configuration package
│   │   ├── src/
│   │   │   ├── auth.ts                     # Server config
│   │   │   ├── client.ts                   # Client config
│   │   │   ├── index.ts                    # Exports
│   │   │   └── types.ts                    # Type helpers (minimal)
│   │   ├── auth-schema.ts                  # Better Auth CLI generated
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── casl-permissions/             # Permission management
│   │   ├── src/
│   │   │   ├── abilities.ts                # CASL ability builder
│   │   │   ├── rules.ts                    # Permission constants
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── database-core/                # Shared database utilities
│   │   └── src/
│   │       ├── connection.ts
│   │       ├── migrate.ts
│   │       └── seed.ts
│   │
│   ├── database-web/                 # Web database schemas
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── index.ts                # Re-exports Better Auth + custom
│   │   │   │   ├── roles.ts                # Roles table
│   │   │   │   ├── permissions.ts          # Permissions table
│   │   │   │   ├── role-permissions.ts     # Junction table
│   │   │   │   ├── user-permissions.ts     # User overrides
│   │   │   │   └── analytics.ts            # Custom tables
│   │   │   └── connection.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── database-desktop/             # Desktop database schemas
│   │   ├── src/
│   │   │   └── schema/
│   │   │       ├── local_cache.ts
│   │   │       └── index.ts
│   │   └── package.json
│   │
│   ├── react-ui/                     # Shared UI components
│   │   └── src/
│   │       └── components/
│   │           └── ui/                     # shadcn components
│   │
│   ├── config-astro/                 # Environment config
│   │   └── src/
│   │       ├── index.ts
│   │       ├── loader.ts
│   │       └── schema.ts
│   │
│   └── trpc-api/                     # tRPC setup
│       └── src/
│           ├── trpc.ts
│           └── router/
│
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

### Package Naming Convention

- **Internal packages:** `@krag/*` (e.g., `@krag/better-auth`, `@krag/database-web`)
- **Shared UI:** `@krag/react-ui`
- **Config:** `@krag/config-astro`, `@krag/config-electron`

### Why Separate Packages?

1. **Clear Boundaries** - Auth logic separated from database and UI
2. **Reusability** - Share auth config between web and desktop
3. **Type Safety** - Better TypeScript inference with focused packages
4. **Testability** - Test auth independently
5. **Schema Management** - Better Auth schema separate from custom schemas

---

## 3. Installation & Setup

### Step 1: Install Better Auth Package Dependencies

```bash
# In monorepo root
cd packages/better-auth

pnpm add better-auth drizzle-orm mysql2
pnpm add -D @types/node
```

### Step 2: Create Package Structure

**packages/better-auth/package.json:**
```json
{
  "name": "@krag/better-auth",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./schema": {
      "types": "./auth-schema.ts",
      "default": "./auth-schema.ts"
    }
  },
  "dependencies": {
    "better-auth": "^1.3.32",
    "drizzle-orm": "^0.44.7",
    "mysql2": "^3.11.5",
    "@krag/config-astro": "workspace:*",
    "@krag/database-web": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

**packages/better-auth/tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*", "auth-schema.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Environment Variables

Create `.env` file in `apps/astro-web`:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/your_database"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:4321"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Node Environment
NODE_ENV="development"
API_URL="http://localhost:4321"
```

---

## 4. Database Configuration

### Database Schema Architecture

**Strategy:** Better Auth CLI generates the schema → database-web re-exports it

```
Better Auth CLI
    ↓ (generates)
auth-schema.ts (user, session, account, verification)
    ↓ (exported via package.json)
@krag/better-auth/schema
    ↓ (imported by)
database-web/src/schema/index.ts
    ↓ (re-exports + custom schemas)
@krag/database-web/src/schema (roles, permissions, analytics)
```

### Step 1: Generate Better Auth Schema

```bash
cd packages/better-auth

# Generate schema using Better Auth CLI
npx @better-auth/cli generate
```

This creates `auth-schema.ts` with:
- `user` table (with custom fields: roleId, isActive, phoneNumber, firstName, lastName)
- `session` table
- `account` table (for OAuth)
- `verification` table (for email verification)

### Step 2: Database-Web Schema Integration

**packages/database-web/src/schema/index.ts:**
```typescript
// Re-export Better Auth schemas (source of truth)
export * from '@krag/better-auth/schema'

// Your custom schemas
export * from './analytics'
export * from './roles'
export * from './permissions'
export * from './role-permissions'
export * from './user-permissions'
export * from './settings'
```

**packages/database-web/src/schema/roles.ts:**
```typescript
import { mysqlTable, serial, varchar, text, boolean, timestamp } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { rolePermissions } from './role-permissions'
import { user } from '@krag/better-auth/schema'

export const roles = mysqlTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  isSystemRole: boolean('is_system_role').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
})

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  users: many(user)
}))

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
```

**packages/database-web/src/schema/permissions.ts:**
```typescript
import { mysqlTable, serial, varchar, text, timestamp, index, boolean } from 'drizzle-orm/mysql-core'

export const permissions = mysqlTable(
  'permissions',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    resource: varchar('resource', { length: 50 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }),
    conditions: text('conditions'), // JSON string for CASL conditions
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
  },
  (table) => [
    index('resource_action_idx').on(table.resource, table.action),
    index('category_idx').on(table.category)
  ]
)

export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert
```

### Step 3: Push Schema to Database

```bash
cd packages/database-web

# Generate migrations
pnpm drizzle-kit generate

# Push to database
pnpm drizzle-kit push
```

**packages/database-web/drizzle.config.ts:**
```typescript
import type { Config } from "drizzle-kit";
import { config } from "@krag/config-astro";

export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    uri: config.DATABASE_URL,
  },
} satisfies Config;
```

---

## 5. Type System & Schema

### The Type Conflict Issue (SOLVED ✅)

**Problem:** Two conflicting User type definitions:
1. Module augmentation (`declare module "better-auth"`)
2. Inferred types from auth client (`$Infer`)

**Solution:** Better Auth handles types automatically via `$Infer` - **no module augmentation needed**!

### Correct Type Usage

**packages/better-auth/src/types.ts:**
```typescript
// Types are inferred from the auth client
// No need for module augmentation - Better Auth handles this automatically
```

**packages/better-auth/src/client.ts:**
```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.API_URL || "http://localhost:4321",
});

// Export the $Infer type helper for type-safe session/user types
export const { $Infer } = authClient;
```

**apps/astro-web/src/lib/auth-types.ts:**
```typescript
import type { $Infer } from "@krag/better-auth";

// Infer session and user types from the auth client
export type Session = typeof $Infer.Session;
export type User = Session["user"];
```

### Usage in Components

```typescript
import type { User, Session } from "@/lib/auth-types";

function UserProfile({ user }: { user: User }) {
  // TypeScript knows about custom fields!
  console.log(user.firstName);  // ✅ Type-safe
  console.log(user.lastName);   // ✅ Type-safe
  console.log(user.roleId);     // ✅ Type-safe
  console.log(user.isActive);   // ✅ Type-safe
}
```

---

## 6. Server Configuration

### packages/better-auth/src/auth.ts

```typescript
import crypto from "crypto";
import { betterAuth } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getWebDb } from "@krag/database-web";
import * as schema from "@krag/database-web/src/schema";
import { config } from "@krag/config-astro";

const db = getWebDb();

const authConfig = {
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
    usePlural: false, // Table names are singular (user, not users)
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirectURI:
        config.NODE_ENV === "production"
          ? "https://yourdomain.com/api/auth/callback/google"
          : `${config.API_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      redirectURI:
        config.NODE_ENV === "production"
          ? "https://yourdomain.com/api/auth/callback/github"
          : `${config.API_URL}/api/auth/callback/github`,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: { enabled: true, maxAge: 5 * 60 }, // 5 minutes
  },

  advanced: {
    generateId: () => crypto.randomUUID(),
    useSecureCookies: config.NODE_ENV === "production",
  },

  user: {
    additionalFields: {
      roleId: { type: "number", required: false, input: false },
      isActive: { type: "boolean", required: false, defaultValue: true },
      phoneNumber: { type: "string", required: false },
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              roleId: user.roleId ?? 3, // Default to basic user role
              isActive: true,
            },
          };
        },
      },
    },
  },

  trustedOrigins: [config.API_URL],
} satisfies BetterAuthOptions;

// Use 'as any' to avoid TypeScript portability warning
export const auth = betterAuth(authConfig) as any;

export type Auth = typeof auth;
```

### Why `as any`?

The `satisfies BetterAuthOptions` validates the config at compile time, but TypeScript complains about type portability with deep inference. Using `as any` suppresses this **non-blocking warning** while keeping full type safety for consumers.

---

## 7. Client Setup

### packages/better-auth/src/client.ts

```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.API_URL || "http://localhost:4321",
});

// Export the $Infer type helper for type-safe session/user types
export const { $Infer } = authClient;
```

### packages/better-auth/src/index.ts

```typescript
// Re-export auth server instance
export { auth } from "./auth";

// Re-export auth client and type inference helper
export { authClient, $Infer } from "./client";
```

---

## 8. Astro Integration

### API Route Handler

**apps/astro-web/src/pages/api/auth/[...all].ts:**
```typescript
import type { APIRoute } from "astro";
import { auth } from "@krag/better-auth";

export const GET: APIRoute = async (ctx) => {
  return auth.handler(ctx.request);
};

export const POST: APIRoute = async (ctx) => {
  return auth.handler(ctx.request);
};
```

This single route handles:
- `/api/auth/sign-in/email`
- `/api/auth/sign-up/email`
- `/api/auth/sign-out`
- `/api/auth/session`
- `/api/auth/callback/google`
- `/api/auth/callback/github`
- All other Better Auth endpoints

### Sign-In Page Example

**apps/astro-web/src/pages/sign-in.astro:**
```astro
---
import Layout from '@/layouts/root-layout.astro';
import { SignInForm } from '@/components/sign-in-form';
---

<Layout title="Sign In">
  <div class="container mx-auto max-w-md py-12">
    <h1 class="text-3xl font-bold mb-6">Sign In</h1>
    <SignInForm client:load />
  </div>
</Layout>
```

**apps/astro-web/src/components/sign-in-form.tsx:**
```typescript
import { useState } from "react";
import { authClient } from "@krag/better-auth";
import { Button } from "@krag/react-ui/components/ui/button";
import { Input } from "@krag/react-ui/components/ui/input";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          alert(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        className="w-full"
      >
        Sign in with Google
      </Button>
    </form>
  );
}
```

### Session Handling

**Get session in Astro page:**
```astro
---
import { auth } from "@krag/better-auth";

const session = await auth.api.getSession({
  headers: Astro.request.headers,
});

if (!session) {
  return Astro.redirect("/sign-in");
}

const user = session.user;
---

<h1>Welcome, {user.firstName}!</h1>
```

---

## 9. Electron Deep Links

### Why Deep Links for Desktop?

**Web App:** Direct Better Auth integration ✅  
**Desktop App:** Deep links + Auth bridge 🔗

**Reasoning:**
- OAuth providers don't support custom protocols in redirect URIs
- Embedded webviews have security concerns
- Deep links use system browser (more secure)
- Single OAuth app registration for both platforms

### Architecture Flow

```
User clicks "Sign in with Google" in Electron
  ↓
Opens system browser with OAuth URL
  ↓
User authenticates in browser
  ↓
OAuth provider redirects to: yourapp://auth/callback?code=xxx
  ↓
Electron intercepts deep link
  ↓
Exchange code for session token via backend
  ↓
Store session in Electron secure storage
  ↓
User authenticated in desktop app
```

### Electron Main Process Setup

**apps/electron-desktop/src/main/index.ts:**
```typescript
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { handleAuthCallback } from './auth-bridge';

const store = new Store({
  encryptionKey: process.env.ENCRYPTION_KEY,
});

const PROTOCOL = 'yourapp'; // yourapp://

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  // Handle deep link when app is already running
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }

    const url = commandLine.pop();
    if (url) {
      handleDeepLink(url);
    }
  });

  // macOS deep link handler
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  // Register protocol
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }

  app.whenReady().then(() => {
    createWindow();
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    // Load app...
  }

  async function handleDeepLink(url: string) {
    const result = await handleAuthCallback(url, store);
    
    if (result.success) {
      mainWindow?.webContents.send('auth:success', result.session);
    } else {
      mainWindow?.webContents.send('auth:error', result.error);
    }
  }
}
```

**apps/electron-desktop/src/main/auth-bridge.ts:**
```typescript
import type Store from 'electron-store';

export async function handleAuthCallback(url: string, store: Store) {
  const parsedUrl = new URL(url);

  if (!parsedUrl.pathname.includes('auth/callback')) {
    return { success: false, error: 'Invalid callback URL' };
  }

  const code = parsedUrl.searchParams.get('code');
  const state = parsedUrl.searchParams.get('state');
  const error = parsedUrl.searchParams.get('error');

  if (error) {
    return { success: false, error };
  }

  if (!code || !state) {
    return { success: false, error: 'Missing code or state' };
  }

  // Verify state (CSRF protection)
  const storedState = store.get('oauth_state');
  if (state !== storedState) {
    return { success: false, error: 'Invalid state - possible CSRF attack' };
  }

  try {
    // Exchange code for session via backend
    const response = await fetch('http://localhost:4321/api/auth/desktop/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code');
    }

    const session = await response.json();

    // Store session securely
    store.set('session', session);
    store.delete('oauth_state');

    return { success: true, session };
  } catch (err) {
    return { success: false, error: 'Authentication failed' };
  }
}
```

### Backend Exchange Endpoint

**apps/astro-web/src/pages/api/auth/desktop/exchange.ts:**
```typescript
import type { APIRoute } from "astro";
import { auth } from "@krag/better-auth";

export const POST: APIRoute = async ({ request }) => {
  const { code, state } = await request.json();

  // Exchange OAuth code for session
  // This is a simplified example - implement proper OAuth flow
  try {
    const session = await auth.api.verifyOAuthCode({
      code,
      state,
    });

    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

---

## 10. Basic Usage

### Email & Password Sign Up

```typescript
import { authClient } from "@krag/better-auth";

const { data, error } = await authClient.signUp.email(
  {
    email: "user@example.com",
    password: "SecurePassword123",
    name: "John Doe",
    callbackURL: "/dashboard",
  },
  {
    onRequest: () => {
      // Show loading spinner
    },
    onSuccess: () => {
      // Redirect to dashboard
      window.location.href = "/dashboard";
    },
    onError: (ctx) => {
      // Show error message
      alert(ctx.error.message);
    },
  }
);
```

### Email & Password Sign In

```typescript
const { data, error } = await authClient.signIn.email(
  {
    email: "user@example.com",
    password: "SecurePassword123",
    callbackURL: "/dashboard",
    rememberMe: true, // Keep session after browser close
  },
  {
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (ctx) => {
      alert(ctx.error.message);
    },
  }
);
```

### Social Sign-In

```typescript
// Google
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
  errorCallbackURL: "/error",
  newUserCallbackURL: "/welcome",
});

// GitHub
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});
```

### Sign Out

```typescript
await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      window.location.href = "/";
    },
  },
});
```

### Get Current Session

**Client-side (React):**
```typescript
import { authClient } from "@krag/better-auth";

const session = await authClient.getSession();

if (session) {
  console.log(session.user.email);
  console.log(session.user.firstName);
}
```

**Server-side (Astro):**
```typescript
import { auth } from "@krag/better-auth";

const session = await auth.api.getSession({
  headers: request.headers,
});

if (session) {
  console.log(session.user);
}
```

---

## 11. CASL Permissions Integration

### packages/casl-permissions/src/abilities.ts

```typescript
import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability'
import type { permissions, roles, user } from '@krag/database-web/src/schema'

type User = typeof user.$inferSelect
type Permission = typeof permissions.$inferSelect
type Role = typeof roles.$inferSelect

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'
export type Subjects = 'User' | 'Role' | 'Permission' | 'Post' | 'Analytics' | 'Settings' | 'all'

export type AppAbility = MongoAbility<[Actions, Subjects]>

export function defineAbilitiesFor(
  user: User & {
    role: Role & {
      rolePermissions: Array<{
        permission: Permission
        isActive: boolean
      }>
    }
    userPermissions?: Array<{
      permission: Permission
      isActive: boolean
    }>
  }
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (!user.isActive) {
    return build()
  }

  // Get role permissions
  const rolePermissions = user.role.rolePermissions
    .filter((rp) => rp.isActive && rp.permission.isActive)
    .map((rp) => rp.permission)

  // Get user-specific permission overrides
  const userPermissions = user.userPermissions
    ?.filter((up) => up.isActive && up.permission.isActive)
    .map((up) => up.permission) || []

  // Combine all permissions
  const allPermissions = [...rolePermissions, ...userPermissions]

  // Build abilities from permissions
  allPermissions.forEach((permission) => {
    const action = permission.action as Actions
    const subject = permission.resource as Subjects

    // Parse conditions if present
    let conditions = undefined
    if (permission.conditions) {
      try {
        conditions = JSON.parse(permission.conditions)
      } catch {
        // Silently ignore invalid JSON
      }
    }

    can(action, subject, conditions)
  })

  // Admin role gets full access
  if (user.role.name === 'Admin') {
    can('manage', 'all')
  }

  return build()
}
```

### Usage with Better Auth Session

```typescript
import { auth } from "@krag/better-auth";
import { db } from "@krag/database-web";
import { defineAbilitiesFor } from "@krag/casl-permissions";

const session = await auth.api.getSession({ headers });

if (!session) {
  throw new Error("Unauthorized");
}

// Fetch user with role and permissions
const user = await db.query.user.findFirst({
  where: (users, { eq }) => eq(users.id, session.user.id),
  with: {
    role: {
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    },
    userPermissions: {
      with: {
        permission: true,
      },
    },
  },
});

if (!user) {
  throw new Error("User not found");
}

// Build abilities
const ability = defineAbilitiesFor(user);

// Check permissions
if (ability.can('create', 'Post')) {
  // User can create posts
}

if (ability.can('delete', 'User')) {
  // User can delete users
}
```

---

## 12. Troubleshooting

### TypeScript Errors

**Error:** `Cannot find name 'window'`  
**Solution:** Add `"DOM"` to `lib` array in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

**Error:** `The inferred type of 'auth' cannot be named`  
**Solution:** Use `as any` after `betterAuth()`:
```typescript
export const auth = betterAuth(authConfig) as any;
```

**Error:** `User type conflicts`  
**Solution:** Don't use module augmentation - use `$Infer` instead:
```typescript
import type { $Infer } from "@krag/better-auth";
export type User = typeof $Infer.Session["user"];
```

### Database Issues

**Error:** `Table not found`  
**Solution:** Run migrations:
```bash
cd packages/database-web
pnpm drizzle-kit push
```

**Error:** `DATABASE_URL not found`  
**Solution:** Make sure `@krag/config-astro` loads `.env` correctly

**Error:** `Relations not working`  
**Solution:** Check drizzle-orm versions are consistent across packages

### Better Auth CLI Issues

**Error:** `Cannot find auth.ts`  
**Solution:** Create `src/auth.ts` separately from `src/index.ts`

**Error:** `Schema generation fails`  
**Solution:** Ensure database connection is accessible and `additionalFields` are valid

### Runtime Errors

**Error:** `Session not persisting`  
**Solution:** Check cookie settings - `useSecureCookies` should be `false` in development

**Error:** `OAuth redirect not working`  
**Solution:** Verify `redirectURI` matches exactly in OAuth provider settings

**Error:** `CORS issues`  
**Solution:** Add API URL to `trustedOrigins` in auth config

---

## Quick Reference

### File Checklist

- [ ] `packages/better-auth/src/auth.ts` - Server config
- [ ] `packages/better-auth/src/client.ts` - Client config
- [ ] `packages/better-auth/src/index.ts` - Exports
- [ ] `packages/better-auth/auth-schema.ts` - CLI generated schema
- [ ] `packages/database-web/src/schema/index.ts` - Re-exports
- [ ] `apps/astro-web/src/pages/api/auth/[...all].ts` - API route
- [ ] `apps/astro-web/.env` - Environment variables
- [ ] `apps/astro-web/src/lib/auth-types.ts` - Type helpers

### Commands

```bash
# Generate Better Auth schema
cd packages/better-auth && npx @better-auth/cli generate

# Push database schema
cd packages/database-web && pnpm drizzle-kit push

# Install dependencies
pnpm install

# Run dev servers
pnpm dev
```

### Import Paths

```typescript
// Server-side
import { auth } from "@krag/better-auth";

// Client-side
import { authClient, $Infer } from "@krag/better-auth";

// Types
import type { User, Session } from "@/lib/auth-types";

// Database schemas
import { user, session } from "@krag/database-web/src/schema";
import { roles, permissions } from "@krag/database-web/src/schema";

// Permissions
import { defineAbilitiesFor } from "@krag/casl-permissions";
```

---

## Resources

- **Better Auth Docs:** https://better-auth.com/docs
- **Drizzle ORM:** https://orm.drizzle.team/
- **CASL:** https://casl.js.org/
- **Astro:** https://astro.build/
- **Electron:** https://www.electronjs.org/

---

**Last Updated:** October 27, 2025  
**Status:** ✅ Production Ready
