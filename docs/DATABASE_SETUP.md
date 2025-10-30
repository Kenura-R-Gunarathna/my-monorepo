# Database Setup Guide

This guide shows how to set up and use the database packages in your monorepo.

## 📦 Package Structure

- **`@krag/database-core`** - Shared tables (users, roles, settings, sync_queue)
- **`@krag/database-astro`** - Astro-specific tables (analytics, posts, etc.)
- **`@krag/database-electron`** - Electron-specific tables (local_cache, preferences, etc.)

## 🚀 Step 1: Install Dependencies

Run these commands to install the latest versions:

```cmd
cd c:\laragon\www\test-monorepo-system\my-monorepo\packages\database-core
pnpm add drizzle-orm mysql2
pnpm add -D drizzle-kit tsx

cd ..\database-web
pnpm add drizzle-orm mysql2
pnpm add -D drizzle-kit tsx

cd ..\database-desktop
pnpm add drizzle-orm mysql2
pnpm add -D drizzle-kit tsx

cd ..\..
pnpm install
```

## 🔧 Step 2: Setup Environment Variable

Create/update `.env` file in the **project root**:

```env
DATABASE_URL=mysql://username:password@localhost:3306/database_name
```

Example for Laragon:
```env
DATABASE_URL=mysql://root:@localhost:3306/my_monorepo
```

## 📝 Step 3: Generate Migrations

Generate migrations for each database package:

```cmd
# Generate core migrations
pnpm --filter @krag/database-core db:generate

# Generate web migrations
pnpm --filter @krag/database-astro db:generate

# Generate desktop migrations
pnpm --filter @krag/database-electron db:generate
```

## 🔄 Step 4: Push Schema to Database

Push your schema directly to the database (for development):

```cmd
# Push core schema
pnpm --filter @krag/database-core db:push

# Push web schema
pnpm --filter @krag/database-astro db:push

# Push desktop schema
pnpm --filter @krag/database-electron db:push
```

**Note:** For production, use migrations instead of push.

## 🌱 Step 5: Seed the Database

Run seed files to populate initial data:

```cmd
# Seed web database
pnpm --filter @krag/database-astro db:seed

# Seed desktop database
pnpm --filter @krag/database-electron db:seed
```

## 🎨 Step 6: Open Drizzle Studio (Optional)

View and edit your database visually:

```cmd
# Open studio for core tables
pnpm --filter @krag/database-core db:studio

# Open studio for web tables
pnpm --filter @krag/database-astro db:studio

# Open studio for desktop tables
pnpm --filter @krag/database-electron db:studio
```

## 📖 Usage Examples

### In Astro (astro-web)

#### 1. In an Astro page (.astro):

```astro
---
import { getWebDb, users } from '@krag/database-astro';
import { eq } from 'drizzle-orm';

const db = getWebDb();
const allUsers = await db.select().from(users);
---

<html>
  <body>
    {allUsers.map(user => (
      <div>{user.firstName} {user.lastName}</div>
    ))}
  </body>
</html>
```

#### 2. In an API route (api/*.ts):

```typescript
import type { APIRoute } from 'astro';
import { getWebDb, users } from '@krag/database-astro';

export const GET: APIRoute = async () => {
  const db = getWebDb();
  const allUsers = await db.select().from(users);
  
  return new Response(JSON.stringify(allUsers), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### In Electron (electron-desktop)

#### In main process:

```typescript
import { getDesktopDb, users, localCache } from '@krag/database-electron';
import { eq } from 'drizzle-orm';

const db = getDesktopDb();

// Get users
const allUsers = await db.select().from(users);

// Cache data
await db.insert(localCache).values({
  key: 'app:theme',
  value: JSON.stringify({ theme: 'dark' }),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

// Get cache
const cache = await db
  .select()
  .from(localCache)
  .where(eq(localCache.key, 'app:theme'));
```

## 🔄 Database Commands Cheatsheet

```cmd
# Install dependencies (run once)
pnpm install

# Generate migrations
pnpm --filter @krag/database-core db:generate
pnpm --filter @krag/database-astro db:generate
pnpm --filter @krag/database-electron db:generate

# Push schema to database (development)
pnpm --filter @krag/database-core db:push
pnpm --filter @krag/database-astro db:push
pnpm --filter @krag/database-electron db:push

# Seed database
pnpm --filter @krag/database-astro db:seed
pnpm --filter @krag/database-electron db:seed

# Open Drizzle Studio
pnpm --filter @krag/database-core db:studio
pnpm --filter @krag/database-astro db:studio
pnpm --filter @krag/database-electron db:studio
```

## 📂 File Structure

```
my-monorepo/
├── .env                          # DATABASE_URL here
├── packages/
│   ├── database-core/
│   │   ├── src/
│   │   │   ├── connection.ts    # Database connection
│   │   │   ├── index.ts         # Main exports
│   │   │   └── schema/          # Core tables
│   │   ├── drizzle.config.ts    # Drizzle config
│   │   └── package.json
│   ├── database-web/
│   │   ├── src/
│   │   │   ├── connection.ts    # Web DB connection
│   │   │   ├── index.ts         # Exports core + web
│   │   │   ├── seed.ts          # Seed data
│   │   │   └── schema/          # Web-specific tables
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   └── database-desktop/
│       ├── src/
│       │   ├── connection.ts    # Desktop DB connection
│       │   ├── index.ts         # Exports core + desktop
│       │   ├── seed.ts          # Seed data
│       │   └── schema/          # Desktop-specific tables
│       ├── drizzle.config.ts
│       └── package.json
└── apps/
    ├── astro-web/
    │   └── package.json         # Uses @krag/database-astro
    └── electron-desktop/
        └── package.json         # Uses @krag/database-electron
```

## 🎯 Benefits

1. **Shared Core Tables**: Users, roles, settings are available to both apps
2. **Separate Concerns**: Web and Desktop have their own specific tables
3. **Type Safety**: Full TypeScript support across all packages
4. **Single Source of Truth**: `DATABASE_URL` from root `.env`
5. **Easy Seeding**: Separate seed files for each context

## 🔍 Troubleshooting

### Module not found errors

After installing dependencies, run:
```cmd
cd c:\laragon\www\test-monorepo-system\my-monorepo
pnpm install
```

### Database connection errors

1. Check your `.env` file has the correct `DATABASE_URL`
2. Make sure MySQL is running (Laragon)
3. Test connection: Open Drizzle Studio

### TypeScript errors

Run from project root:
```cmd
pnpm install
```

## 📚 Next Steps

1. ✅ Install dependencies (Step 1)
2. ✅ Setup `.env` file (Step 2)
3. ✅ Push schema to database (Step 4)
4. ✅ Seed database (Step 5)
5. 🚀 Start using in your apps!

For more information, visit [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
