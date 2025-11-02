# Astro Web Application

The web application built with Astro, featuring SSR, tRPC API routes, Better Auth authentication, and React component integration.

## 📋 Overview

This is the web frontend and backend for the monorepo, providing:
- 🌐 Server-side rendered web pages
- 🔐 Authentication with Better Auth (OAuth, social login)
- 📡 tRPC API routes for type-safe backend communication
- ⚛️ React component integration from `@krag/react-ui`
- 🗄️ MySQL database access via `@krag/drizzle-orm-server`
- 📊 Analytics and web-specific features

## 🏗️ Architecture

### Tech Stack
- **Framework**: Astro with SSR enabled
- **UI Components**: React from `@krag/react-ui`
- **API Layer**: tRPC for type-safe API routes
- **Authentication**: Better Auth
- **Database**: MySQL via `@krag/drizzle-orm-server`
- **Permissions**: CASL via `@krag/casl-permissions`
- **Configuration**: `@krag/config/server` and `@krag/config/public`
- **Validation**: Zod schemas from `@krag/zod-schema`

### Project Structure
```
apps/astro-web/
├── src/
│   ├── pages/               # Astro pages and API routes
│   │   ├── index.astro      # Homepage
│   │   └── api/             # tRPC and auth API routes
│   ├── components/          # Astro-specific components
│   ├── layouts/             # Page layouts
│   ├── middleware.ts        # Astro middleware
│   ├── server/              # Server-side utilities
│   │   └── trpc.ts          # tRPC server setup
│   └── lib/                 # Utilities
├── public/                  # Static assets
│   └── uploads/             # User uploads
├── trpc.ts                  # tRPC client configuration
└── astro.config.mjs         # Astro configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10.20.0+
- MySQL database running

### Installation
From the monorepo root:
```bash
pnpm install
```

### Environment Configuration
Create `.env.astro.development` in the monorepo root:
```env
# Server Configuration
BASE_URL=http://localhost:4321
DATABASE_URL=mysql://root:@localhost:3306/my_monorepo

# Better Auth
AUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

See `@krag/config` package for full configuration options.

### Database Setup
```bash
# Push schema to database
pnpm --filter @krag/drizzle-orm-server db:push

# Seed initial data (optional)
pnpm --filter @krag/drizzle-orm-server db:seed

# Open Drizzle Studio to view data
pnpm --filter @krag/drizzle-orm-server db:studio
```

### Development
```bash
# From monorepo root
pnpm dev:astro

# Or directly
cd apps/astro-web
pnpm dev
```

Server runs at `http://localhost:4321`

### Build
```bash
pnpm build:astro
```

## 🔧 Key Features

### tRPC Integration
The app uses tRPC for type-safe API communication:

```typescript
// Server-side (src/pages/api/trpc/[trpc].ts)
import { appRouter } from '@krag/react-ui/server/routers/_app'
import { createContext } from './context'

export const handler = trpcAstro({
  router: appRouter,
  createContext,
})
```

```typescript
// Client-side (trpc.ts)
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@krag/react-ui/server/routers/_app'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
})
```

### Better Auth Integration
OAuth and social authentication:

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { getServerConfig } from '@krag/config/server'
import { dbConn } from '@krag/drizzle-orm-server'

const config = getServerConfig()

export const auth = betterAuth({
  database: dbConn,
  secret: config.AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
  },
})
```

### React Component Usage
Import shared React components:

```astro
---
// In .astro files
import { Button } from '@krag/react-ui/components/ui/button'
import { UserList } from '@krag/react-ui/features/users'
---

<UserList client:load />
<Button client:idle>Click me</Button>
```

### Database Access
```typescript
import { dbConn, user } from '@krag/drizzle-orm-server'
import { eq } from 'drizzle-orm'

// Query users
const allUsers = await dbConn.query.user.findMany()

// Insert user
await dbConn.insert(user).values({
  id: generateId(15),
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: false,
})
```

### Configuration Management
```typescript
// In API routes (server-side)
import { getServerConfig, getPublicConfig } from '@krag/config/server'

const serverConfig = getServerConfig() // Has secrets
const publicConfig = getPublicConfig()  // Safe for client

// In .astro components (client-side)
import { getServerPublicConfig } from '@krag/config/public'

const config = getServerPublicConfig() // Only public values
```

## 📡 API Routes

### tRPC Routes
- `/api/trpc/*` - All tRPC procedures
  - `user.*` - User management
  - `auth.*` - Authentication
  - `post.*` - Content management
  - `analytics.*` - Web analytics

### Better Auth Routes
- `/api/auth/signin` - Sign in
- `/api/auth/signup` - Sign up
- `/api/auth/signout` - Sign out
- `/api/auth/callback/*` - OAuth callbacks

## 🧪 Development Tips

### Hot Module Replacement
Changes to React components in `@krag/react-ui` will hot reload in Astro.

### TypeScript
The project uses strict TypeScript. Types are shared across the monorepo.

### Client Directives
Use Astro client directives for React components:
- `client:load` - Load on page load
- `client:idle` - Load when browser idle
- `client:visible` - Load when visible
- `client:only="react"` - Only run on client

## 📦 Dependencies

### Workspace Packages
- `@krag/react-ui` - Shared React components
- `@krag/drizzle-orm-server` - MySQL database access
- `@krag/config` - Configuration management
- `@krag/casl-permissions` - Permission management
- `@krag/zod-schema` - Validation schemas

### External Dependencies
- `astro` - Web framework
- `@trpc/server` - tRPC server
- `better-auth` - Authentication
- `drizzle-orm` - Database ORM
- `react` - UI library

## 🔒 Security

### Configuration Security
- Server secrets never exposed to client
- Use `@krag/config/server` for server-side code
- Use `@krag/config/public` for client-side code
- Vite plugin prevents accidental secret exposure

### Authentication
- Better Auth handles sessions securely
- OAuth providers for social login
- CSRF protection enabled
- Secure cookie settings

### Permissions
- CASL-based permission system
- Role-based access control
- Per-route permission checks

## 📚 Related Documentation

- [Astro Documentation](https://docs.astro.build)
- [tRPC Documentation](https://trpc.io)
- [Better Auth Documentation](https://better-auth.com)
- See `@krag/config` README for configuration details
- See `@krag/drizzle-orm-server` README for database details
- See `@krag/react-ui` README for component usage

## 🤝 Contributing

This is part of a monorepo. Make sure to:
1. Run commands from the monorepo root using `--filter`
2. Use shared types from workspace packages
3. Follow the security conventions for config usage
4. Test with both dev and build modes
