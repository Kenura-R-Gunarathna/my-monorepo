# Quick Start Commands - Copy & Paste

## ⚠️ IMPORTANT: Use --filter from root!

Due to workspace dependencies, install packages using `--filter` from the root directory.

## 1️⃣ Install Dependencies (Run First)

**Run these commands from the ROOT directory:**

```cmd
cd c:\laragon\www\test-monorepo-system\my-monorepo

rem Install for database-core
pnpm --filter @krag/database-core add drizzle-orm mysql2
pnpm --filter @krag/database-core add -D drizzle-kit tsx

rem Install for database-web
pnpm --filter @krag/database-astro add drizzle-orm mysql2
pnpm --filter @krag/database-astro add -D drizzle-kit tsx

rem Install for database-desktop
pnpm --filter @krag/database-electron add drizzle-orm mysql2
pnpm --filter @krag/database-electron add -D drizzle-kit tsx

rem Install drizzle-orm in apps (needed for queries)
pnpm --filter astro-web add drizzle-orm
pnpm --filter electron-desktop add drizzle-orm

rem Link everything
pnpm install
```

## 2️⃣ Create .env File (Root Directory)

Create file: `c:\laragon\www\test-monorepo-system\my-monorepo\.env`

```env
DATABASE_URL=mysql://root:@localhost:3306/my_monorepo
```

## 3️⃣ Push Schema to Database

```cmd
cd c:\laragon\www\test-monorepo-system\my-monorepo
pnpm --filter @krag/database-core db:push
pnpm --filter @krag/database-astro db:push
pnpm --filter @krag/database-electron db:push
```

## 4️⃣ Seed Database (Optional)

```cmd
pnpm --filter @krag/database-astro db:seed
pnpm --filter @krag/database-electron db:seed
```

## 5️⃣ Test with Drizzle Studio

```cmd
pnpm --filter @krag/database-core db:studio
```

---

## ✅ Files Created

### Database Packages:
- ✅ `packages/database-core/src/connection.ts`
- ✅ `packages/database-core/src/index.ts`
- ✅ `packages/database-core/src/schema/index.ts`
- ✅ `packages/database-core/drizzle.config.ts`

- ✅ `packages/database-web/src/connection.ts`
- ✅ `packages/database-web/src/index.ts`
- ✅ `packages/database-web/src/seed.ts`
- ✅ `packages/database-web/drizzle.config.ts`

- ✅ `packages/database-desktop/src/connection.ts`
- ✅ `packages/database-desktop/src/index.ts`
- ✅ `packages/database-desktop/src/seed.ts`
- ✅ `packages/database-desktop/drizzle.config.ts`

### App Examples:
- ✅ `apps/astro-web/src/pages/users.astro`
- ✅ `apps/astro-web/src/pages/api/users.ts`
- ✅ `apps/electron-desktop/src/main/database.ts`

### Updated:
- ✅ `apps/astro-web/package.json` (added @krag/database-astro)
- ✅ `apps/electron-desktop/package.json` (added @krag/database-electron)

---

## 🎯 What Each Package Does

| Package | Used By | Contains |
|---------|---------|----------|
| `@krag/database-core` | Both | `users`, `roles`, `settings`, `sync_queue` |
| `@krag/database-astro` | Astro | Core + `analytics` (add more web tables here) |
| `@krag/database-electron` | Electron | Core + `local_cache` (add more desktop tables here) |

---

## 🚀 Usage Quick Reference

### Astro (any .astro page):
```typescript
import { getWebDb, users } from '@krag/database-astro';

// Option 1: Use environment variable
const db = getWebDb();

// Option 2: Pass DATABASE_URL directly
const db = getWebDb('mysql://root:@localhost:3306/mydb');

const allUsers = await db.select().from(users);
```

### Electron (main process):
```typescript
import { getDesktopDb, users, localCache } from '@krag/database-electron';

// Option 1: Use environment variable
const db = getDesktopDb();

// Option 2: Pass DATABASE_URL directly (useful for app-specific DBs)
const db = getDesktopDb(`mysql://root:@localhost:3306/electron_${app.getName()}`);

const allUsers = await db.select().from(users);
```

---

## 📝 Next: Add Your Own Tables

### For Astro-specific tables:
Edit: `packages/database-web/src/schema/analytics.ts`

### For Electron-specific tables:
Edit: `packages/database-desktop/src/schema/local_cache.ts`

After adding tables, run:
```cmd
pnpm --filter @krag/database-astro db:push
# or
pnpm --filter @krag/database-electron db:push
```
