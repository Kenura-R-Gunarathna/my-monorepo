# @krag/better-auth

Better Auth integration package for the KRAG monorepo.

## Overview

This package provides authentication functionality using Better Auth, configured for:
- **Astro Web App** (`apps/astro-web`): Direct integration with session cookies
- **Electron Desktop** (`apps/electron-desktop`): Deep link authentication flow

## Installation

From the monorepo root:

```bash
# Install Better Auth library
pnpm add better-auth --filter @krag/better-auth

# Install package in apps
pnpm add @krag/better-auth --filter astro-web
pnpm add @krag/better-auth --filter electron-desktop

# Install dependencies
pnpm install
```

## Database Setup

### 1. Run Migration

The Better Auth tables are defined in `packages/database-web/migrations/0001_add_better_auth.sql`.

Run the migration:

```bash
cd packages/database-web
pnpm db:migrate
```

### 2. Schema Structure

Better Auth extends your existing schema without breaking changes:

- **users** - Extended with `email_verified`, `image`, `two_factor_enabled`
- **sessions** - Stores user sessions
- **accounts** - Stores OAuth provider accounts
- **verifications** - Stores email verification tokens

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Better Auth
PUBLIC_APP_URL=http://localhost:4321
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Usage

### Server-Side (Astro)

```typescript
import { auth } from "@krag/better-auth";

// In API route: apps/astro-web/src/pages/api/auth/[...all].ts
export const ALL = async (context) => {
  return auth.handler(context.request);
};

// In middleware: apps/astro-web/src/middleware.ts
const session = await auth.api.getSession({
  headers: context.request.headers,
});
```

### Client-Side

```typescript
import { authClient } from "@krag/better-auth/client";

// Sign up
const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "secure_password",
  name: "John Doe",
});

// Sign in
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "secure_password",
});

// OAuth
await authClient.signIn.social({
  provider: "google",
});

// Get session
const session = await authClient.getSession();

// Sign out
await authClient.signOut();
```

### Types

```typescript
import type { Session, User } from "@krag/better-auth/types";

function MyComponent({ user }: { user: User }) {
  // User type includes your custom fields:
  // - roleId
  // - isActive
  // - phoneNumber
  // - firstName
  // - lastName
}
```

## Integration with Existing Systems

### With tRPC

```typescript
// apps/astro-web/src/server/trpc/context.ts
import { auth } from "@krag/better-auth";

export async function createContext({ req }) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  
  return { session, user: session?.user };
}
```

### With CASL Permissions

```typescript
import { auth } from "@krag/better-auth";
import { db } from "@krag/database-astro";

const session = await auth.api.getSession({ headers });

if (session?.user) {
  const userWithPermissions = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      role: {
        with: {
          rolePermissions: {
            with: { permission: true }
          }
        }
      }
    }
  });
  
  // Now use with CASL
}
```

## Electron Deep Link Flow

For Electron desktop app, authentication uses deep links:

1. User clicks "Sign in with Google" in Electron
2. Opens system browser with OAuth URL
3. User authenticates
4. Redirects to: `myapp://auth/callback?token=xxx`
5. Electron intercepts and exchanges token
6. Session stored securely in Electron Store

See `BETTER_AUTH_DEEP_LINKS.md` for detailed implementation.

## Package Structure

```
packages/better-auth/
├── src/
│   ├── index.ts      # Server auth instance
│   ├── client.ts     # Client utilities
│   └── types.ts      # TypeScript types
├── package.json
└── tsconfig.json
```

## Features

- ✅ Email/Password authentication
- ✅ OAuth (Google, GitHub)
- ✅ Session management
- ✅ Email verification
- ✅ Role-based access via existing system
- ✅ Type-safe across monorepo
- ✅ Works with MySQL database
- ✅ Extends existing user schema
- ✅ Deep link support for Electron

## Next Steps

1. Configure OAuth providers in Google/GitHub consoles
2. Implement auth UI components in `@krag/auth-ui`
3. Set up protected routes in Astro
4. Implement Electron deep link handlers
5. Add email verification flow

## Learn More

- [Better Auth Documentation](https://better-auth.com)
- [TanStack Router Integration](../TANSTACK_ROUTER.md)
- [Deep Links Setup](../BETTER_AUTH_DEEP_LINKS.md)
