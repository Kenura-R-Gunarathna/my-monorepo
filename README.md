# KRAG Monorepo

A full-stack TypeScript monorepo with Astro web application and Electron desktop application, sharing React components, database schemas, and business logic.

## 📋 Overview

This monorepo provides:
- 🌐 **Astro Web App** - SSR web application with Better Auth, tRPC, and MySQL
- 🖥️ **Electron Desktop App** - Cross-platform desktop app with SQLite and encrypted storage
- ⚛️ **Shared React UI** - Component library used by both apps
- 🗄️ **Database Packages** - MySQL (web) and SQLite (desktop) with Drizzle ORM
- 🔐 **Permission System** - CASL-based authorization
- ⚙️ **Configuration** - Secure, type-safe config management
- ✅ **Validation** - Shared Zod schemas

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Apps Layer                             │
├────────────────────────────┬────────────────────────────────┤
│   Astro Web (SSR)          │   Electron Desktop             │
│   • Better Auth            │   • SQLite Database            │
│   • MySQL Database         │   • Electron Store             │
│   • OAuth/Social Login     │   • IPC Communication          │
│   • tRPC HTTP              │   • tRPC IPC                   │
└─────────────┬──────────────┴──────────────┬─────────────────┘
              │                             │
              └──────────┬──────────────────┘
                         │
              ┌──────────▼──────────┐
              │  Shared Packages    │
              ├─────────────────────┤
              │ • @krag/react-ui    │  ← React components
              │ • @krag/config      │  ← Configuration
              │ • @krag/zod-schema  │  ← Validation
              │ • @krag/casl-perm   │  ← Permissions
              │ • @krag/drizzle-*   │  ← Database
              └─────────────────────┘
```

## 📁 Project Structure

```
my-monorepo/
├── apps/
│   ├── astro-web/              # Web application
│   └── electron-desktop/       # Desktop application
├── packages/
│   ├── react-ui/               # Shared React components
│   ├── config/                 # Configuration management
│   ├── drizzle-orm-server/     # MySQL database (web)
│   ├── drizzle-orm-client/     # SQLite database (desktop)
│   ├── casl-permissions/       # Authorization system
│   └── zod-schema/             # Validation schemas
├── scripts/
│   └── quick-validate.js       # Validation script
├── .env                        # Environment variables
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspace config
└── tsconfig.json               # Root TypeScript config
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 10.20.0 or higher
- **MySQL** database running (for web app)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd my-monorepo

# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env` file in the root directory. Copy from `.env.example`:

```bash
# Copy template
cp .env.example .env

# Edit with your values
# Add secrets to .env.local (gitignored)
```

**`.env` (All configuration in one file)**
```env
# Environment
NODE_ENV=development

# Shared
LOG_LEVEL=info

# Server (Astro Web App)
BASE_URL=http://localhost:4321
API_ENDPOINT=http://localhost:4321/api
DATABASE_URL=mysql://root:@localhost:3306/my_monorepo
SESSION_SECRET=your-secret-key-here-minimum-32-chars
BETTER_AUTH_URL=http://localhost:4321/api/auth

# Server - OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Client (Electron Desktop App)
API_URL=http://localhost:4321
ASTRO_BASE_URL=http://localhost:4321
WINDOW_WIDTH=1200
WINDOW_HEIGHT=800
DB_FILE_NAME=app.db
DB_ENCRYPTION_KEY=your-encryption-key-here
```

**Environment File Loading:**
- `.env` - Base configuration (all apps)
- `.env.development` - Development overrides (optional)
- `.env.production` - Production overrides (optional)
- `.env.local` - Local secrets (gitignored, highest priority)

Managed by `@krag/config` package.

### Database Setup

```bash
# Push schemas to databases
pnpm --filter @krag/drizzle-orm-server db:push
pnpm --filter @krag/drizzle-orm-client db:push

# Seed databases (optional)
pnpm --filter @krag/drizzle-orm-server db:seed
pnpm --filter @krag/drizzle-orm-client db:seed
```

### Development

```bash
# Run all apps in parallel
pnpm dev

# Run specific apps
pnpm dev:astro        # Web app only
pnpm dev:electron     # Desktop app only
pnpm dev:ui           # UI package only

# Run multiple apps
pnpm dev:astro:ui     # Web + UI
```

### Build

```bash
# Build all
pnpm build

# Build specific apps
pnpm build:astro
pnpm build:electron
pnpm build:ui
```

### Electron Build Targets

```bash
# Windows
pnpm --filter electron-desktop build:win

# macOS
pnpm --filter electron-desktop build:mac

# Linux
pnpm --filter electron-desktop build:linux
```

## 📦 Apps

### [Astro Web](./apps/astro-web/README.md)

Server-side rendered web application with:
- ✅ Better Auth (OAuth, social login)
- ✅ tRPC API routes
- ✅ MySQL database
- ✅ React component integration
- ✅ Analytics and web-specific features

**Key Technologies:**
- Astro (SSR)
- React
- tRPC
- Better Auth
- MySQL + Drizzle ORM

**Development:**
```bash
pnpm dev:astro
```

**URLs:**
- Web app: `http://localhost:4321`
- API: `http://localhost:4321/api/trpc`

[📖 Full Documentation](./apps/astro-web/README.md)

---

### [Electron Desktop](./apps/electron-desktop/README.md)

Cross-platform desktop application with:
- ✅ SQLite local database
- ✅ Encrypted electron-store
- ✅ Unified tRPC (IPC + HTTP)
- ✅ Sync with web backend
- ✅ Native OS integration

**Key Technologies:**
- Electron
- React
- SQLite + Drizzle ORM
- electron-store
- tRPC (IPC)

**Development:**
```bash
pnpm dev:electron
```

[📖 Full Documentation](./apps/electron-desktop/README.md)

## 📦 Packages

### [React UI](./packages/react-ui/README.md)

Shared React component library:
- ✅ shadcn/ui components
- ✅ TanStack Router
- ✅ TanStack Query
- ✅ TanStack Form
- ✅ Unified tRPC client
- ✅ Custom hooks

[📖 Full Documentation](./packages/react-ui/README.md)

---

### [Config](./packages/config/README.md)

Secure configuration management:
- ✅ Server/Client separation
- ✅ Public/Private boundaries
- ✅ Multi-environment support
- ✅ Type-safe with Zod
- ✅ Vite plugin for security

[📖 Full Documentation](./packages/config/README.md)

---

### [Drizzle ORM Server](./packages/drizzle-orm-server/README.md)

MySQL database for web:
- ✅ Web-specific tables
- ✅ Analytics, sessions, OAuth
- ✅ Shared schemas
- ✅ Migrations with Drizzle Kit

[📖 Full Documentation](./packages/drizzle-orm-server/README.md)

---

### [Drizzle ORM Client](./packages/drizzle-orm-client/README.md)

SQLite database for desktop:
- ✅ Local cache and sync queue
- ✅ Encrypted storage
- ✅ Offline-first
- ✅ Shared schemas

[📖 Full Documentation](./packages/drizzle-orm-client/README.md)

---

### [CASL Permissions](./packages/casl-permissions/README.md)

Authorization system:
- ✅ Role-based access control
- ✅ Action-based permissions
- ✅ Dynamic ability building
- ✅ Type-safe checks

[📖 Full Documentation](./packages/casl-permissions/README.md)

---

### [Zod Schema](./packages/zod-schema/README.md)

Validation schemas:
- ✅ Shared Zod schemas
- ✅ Type inference
- ✅ Form validation
- ✅ API validation

[📖 Full Documentation](./packages/zod-schema/README.md)

## 🔧 Common Commands

### Package Management

```bash
# Install dependencies
pnpm install

# Add dependency to specific package
pnpm --filter <package-name> add <dependency>

# Add dev dependency
pnpm --filter <package-name> add -D <dependency>

# Remove dependency
pnpm --filter <package-name> remove <dependency>
```

**Examples:**
```bash
pnpm --filter astro-web add lodash
pnpm --filter @krag/react-ui add -D vitest
pnpm --filter electron-desktop add electron-store
```

### Database Commands

```bash
# Push schemas (development)
pnpm --filter @krag/drizzle-orm-server db:push
pnpm --filter @krag/drizzle-orm-client db:push

# Generate migrations
pnpm --filter @krag/drizzle-orm-server db:generate
pnpm --filter @krag/drizzle-orm-client db:generate

# Run migrations
pnpm --filter @krag/drizzle-orm-server db:migrate
pnpm --filter @krag/drizzle-orm-client db:migrate

# Seed databases
pnpm --filter @krag/drizzle-orm-server db:seed
pnpm --filter @krag/drizzle-orm-client db:seed

# Open Drizzle Studio
pnpm --filter @krag/drizzle-orm-server db:studio
pnpm --filter @krag/drizzle-orm-client db:studio
```

### Validation

```bash
# Quick validation check
pnpm validate

# TypeScript type checking
pnpm tsc --noEmit
```

## 🎯 Key Features

### Unified tRPC Client

Smart routing between IPC (Electron) and HTTP (Astro):

```typescript
// Automatically routes based on platform and namespace
trpc.store.get()        // → IPC (Electron only)
trpc.system.info()      // → IPC (Electron only)
trpc.user.list()        // → HTTP or IPC (shared)
trpc.auth.login()       // → HTTP (web only)
```

### Configuration Security

Public/Private boundaries prevent secret leakage:

```typescript
// Server-side (has secrets)
import { getServerConfig } from '@krag/config/server'
const config = getServerConfig()

// Client-side (no secrets)
import { getServerPublicConfig } from '@krag/config/public'
const config = getServerPublicConfig()
```

### Permissions

CASL-based authorization:

```typescript
import { usePermissions } from '@krag/react-ui/hooks/usePermissions'

const { can } = usePermissions()

if (can('create', 'Post')) {
  // Show create button
}
```

### Shared React Components

```typescript
// In Astro
<UserList client:load />

// In Electron
<UserList />
```

## 🧪 Development Workflow

### Adding a New Feature

1. **Define schema** in `@krag/zod-schema`
2. **Add database tables** in `@krag/drizzle-orm-*`
3. **Create tRPC router** in `@krag/react-ui/server/routers`
4. **Build UI components** in `@krag/react-ui`
5. **Use in apps** (Astro or Electron)

### Example: Adding "Tasks"

```typescript
// 1. Schema (packages/zod-schema/src/task.ts)
export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
})

// 2. Database (packages/drizzle-orm-server/src/schema/tasks.ts)
export const tasks = mysqlTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }),
  completed: boolean('completed').default(false),
})

// 3. tRPC Router (packages/react-ui/src/server/routers/tasks.ts)
export const tasksRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.tasks.findMany()
  }),
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.db.insert(tasks).values(input)
    }),
})

// 4. UI Component (packages/react-ui/src/features/tasks/TaskList.tsx)
export function TaskList() {
  const { data } = trpc.tasks.list.useQuery()
  return <div>{data?.map(task => <TaskItem task={task} />)}</div>
}

// 5. Use in Astro (apps/astro-web/src/pages/tasks.astro)
import { TaskList } from '@krag/react-ui/features/tasks'
<TaskList client:load />
```

## 🔒 Security

### Configuration
- Secrets never exposed to client
- Vite plugin catches accidental leaks
- Public/Private boundaries enforced

### Authentication
- Better Auth with OAuth
- Secure session management
- CSRF protection

### Permissions
- CASL role-based access control
- Per-route authorization
- Type-safe permission checks

### Desktop Storage
- Encrypted electron-store
- SQLite with optional encryption
- Secure IPC communication

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests for specific package
pnpm --filter @krag/react-ui test

# Watch mode
pnpm test --watch
```

## 📚 Additional Resources

### Documentation
- [Astro Documentation](https://docs.astro.build)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [tRPC Documentation](https://trpc.io)
- [TanStack Documentation](https://tanstack.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### Tools
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) - Database GUI
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [VS Code](https://code.visualstudio.com/) - Recommended IDE

## 🤝 Contributing

### Guidelines

1. **Run from root** - Always use `pnpm --filter` from root directory
2. **Type safety** - Use TypeScript strictly
3. **Shared logic** - Put shared code in packages
4. **Security** - Follow config public/private conventions
5. **Testing** - Add tests for new features
6. **Documentation** - Update relevant READMEs

### Commit Convention

```bash
feat: add new feature
fix: bug fix
docs: documentation update
refactor: code refactoring
test: add tests
chore: maintenance
```

## 📝 License

ISC License - Kenura R. Gunarathna

## 🆘 Troubleshooting

### Build Errors

```bash
# Clean and reinstall
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install

# Clear Vite cache
rm -rf packages/*/node_modules/.vite apps/*/node_modules/.vite
```

### Database Issues

```bash
# Reset databases
pnpm --filter @krag/drizzle-orm-server db:push --force
pnpm --filter @krag/drizzle-orm-client db:push --force
```

### Type Errors

```bash
# Rebuild packages
pnpm build

# Check types
pnpm tsc --noEmit
```

### Electron Won't Start

```bash
# Rebuild native modules
pnpm --filter electron-desktop rebuild

# Clear electron cache
rm -rf apps/electron-desktop/out
```

## 📞 Support

For issues and questions:
1. Check relevant package README
2. Check error logs
3. Verify environment configuration
4. Run `pnpm validate` for quick diagnostics

---

**Built with ❤️ using TypeScript, React, Astro, and Electron**
