Great question! Let's compare **Auth.js (formerly NextAuth.js) for Astro** vs **Better Auth** for your Astro + tRPC setup.

---

## Quick Comparison Table

| Feature | Auth.js (Astro) | Better Auth |
|---------|----------------|-------------|
| **Maturity** | Very mature, battle-tested | Newer, actively developed |
| **TypeScript** | Good, but can be tricky | Excellent, built TypeScript-first |
| **Astro Integration** | Official adapter available | Native Astro support |
| **tRPC Integration** | Manual setup needed | Better integration story |
| **Database** | Drizzle adapter available | Native Drizzle support |
| **Flexibility** | Very flexible, lots of providers | Modern, opinionated |
| **Bundle Size** | Larger | Smaller, tree-shakeable |
| **Session Management** | JWT or Database | Database sessions (more secure) |
| **Modern Features** | Adding gradually | Built-in (2FA, passkeys, etc.) |
| **Documentation** | Extensive but scattered | Clear, modern docs |
| **Community** | Huge community | Growing community |

---

## Auth.js (Astro Integration)

### ✅ Pros

1. **Battle-tested** - Used by thousands of production apps
2. **Many OAuth providers** - 50+ providers built-in (Google, GitHub, etc.)
3. **Huge ecosystem** - Lots of examples, tutorials, community support
4. **Stable** - Fewer breaking changes
5. **Multiple session strategies** - JWT or database sessions

### ❌ Cons

1. **Complex TypeScript** - Type inference can be painful
2. **Not Astro-native** - Adapted from Next.js, some quirks
3. **Manual tRPC integration** - Need to wire up context yourself
4. **Larger bundle** - More code, even if you don't use it
5. **Callback-heavy** - Lots of callbacks to customize behavior

### Setup Example

```bash
npm install @auth/core @auth/drizzle-adapter
```

#### `src/lib/auth.ts`

```typescript
import { Auth } from '@auth/core';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import Credentials from '@auth/core/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import * as bcrypt from 'bcrypt';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
          with: { role: true }
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};
```

#### `src/pages/api/auth/[...auth].ts`

```typescript
import { Auth } from '@auth/core';
import type { APIRoute } from 'astro';
import { authOptions } from '@/lib/auth';

export const ALL: APIRoute = async ({ request }) => {
  return Auth(request, authOptions);
};
```

#### tRPC Context

```typescript
// server/trpc/context.ts
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getSession } from '@auth/core';
import { authOptions } from '@/lib/auth';

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const session = await getSession(req, authOptions);
  
  return {
    session,
    db,
  };
}
```

---

## Better Auth

### ✅ Pros

1. **TypeScript-first** - Excellent type inference, type-safe
2. **Modern architecture** - Built for modern frameworks
3. **Native Drizzle support** - Works seamlessly with your setup
4. **Smaller bundle** - Tree-shakeable, only include what you need
5. **Better DX** - Cleaner API, less boilerplate
6. **Built-in modern features** - 2FA, passkeys, magic links out of the box
7. **Better tRPC integration** - Designed to work well with tRPC
8. **Database sessions by default** - More secure

### ❌ Cons

1. **Newer** - Less battle-tested in production
2. **Smaller community** - Fewer examples and tutorials
3. **Fewer built-in providers** - Though major ones are supported
4. **Breaking changes** - More likely as it evolves
5. **Less documentation** - Still growing

### Setup Example

```bash
npm install better-auth
```

#### `src/lib/auth.ts`

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'mysql',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
});

export type Auth = typeof auth;
```

#### `src/pages/api/auth/[...all].ts`

```typescript
import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';

export const ALL: APIRoute = async (context) => {
  return auth.handler(context.request);
};
```

#### tRPC Context

```typescript
// server/trpc/context.ts
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { auth } from '@/lib/auth';

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  
  return {
    session,
    db,
  };
}
```

#### Client Setup

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_APP_URL,
});

// Usage in React components
import { authClient } from '@/lib/auth-client';

function LoginForm() {
  const signIn = async (email: string, password: string) => {
    await authClient.signIn.email({
      email,
      password,
    });
  };

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  };
}
```

#### Get User with Permissions

```typescript
// server/trpc/context.ts
export async function createContext({ req }: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  let user = null;
  if (session?.user) {
    // Fetch user with role and permissions
    user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
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
      },
    });
  }
  
  return {
    session,
    user,
    db,
  };
}
```

---

## My Recommendation for Your Stack

Given your setup (Astro + tRPC + Drizzle + Complex Permissions), I recommend **Better Auth** for these reasons:

### Why Better Auth Fits Your Case:

1. **✅ Native TypeScript** - Better type safety across your tRPC procedures
2. **✅ Drizzle-first** - Works seamlessly with your existing schema
3. **✅ Modern approach** - Matches your modern stack (Astro, tRPC)
4. **✅ Cleaner integration** - Less boilerplate for tRPC context
5. **✅ Database sessions** - More secure for sensitive permission checks
6. **✅ Built-in features** - 2FA, email verification, magic links ready to go

### When to Choose Auth.js Instead:

- You need 50+ OAuth providers
- You want JWT sessions for stateless API
- Your team is already familiar with Auth.js
- You need maximum stability (production-critical app)
- You want more community examples

---

## Complete Better Auth Setup for Your Project

### 1. Install

```bash
npm install better-auth
```

### 2. Update Schema (Better Auth needs these tables)

```typescript
// db/schema/auth.ts - Better Auth tables
import { mysqlTable, varchar, timestamp, boolean, int } from 'drizzle-orm/mysql-core';

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
});

export const verificationTokens = mysqlTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

export const accounts = mysqlTable('accounts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: int('expires_at'),
  tokenType: varchar('token_type', { length: 50 }),
  scope: varchar('scope', { length: 255 }),
});
```

### 3. Complete Auth Configuration

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'mysql',
    schema,
  }),
  
  // Email/Password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },
  
  // OAuth Providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
  },
  
  // Callbacks for custom logic
  callbacks: {
    async signUp({ user }) {
      // Assign default role on signup
      await db.update(users)
        .set({ roleId: 3 }) // Default to "viewer" role
        .where(eq(users.id, user.id));
    },
  },
  
  // Two-factor authentication
  twoFactor: {
    enabled: true,
  },
  
  // Trust the proxy (important for production)
  trustedOrigins: [process.env.PUBLIC_APP_URL!],
});
```

### 4. tRPC Integration

```typescript
// server/trpc/middleware/auth.ts
import { TRPCError } from '@trpc/server';
import { t } from '../trpc';
import { getUserPermissions } from '@/lib/permissions/resolver';
import { defineAbilitiesForUser } from '@/lib/permissions/abilities';

export const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Get user with permissions
  const permissions = await getUserPermissions(ctx.session.user.id);
  const ability = await defineAbilitiesForUser(ctx.session.user.id);

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
      permissions,
      ability,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
```

---

## Final Recommendation

**Go with Better Auth** for your complex permission system because:

1. ✅ Better TypeScript integration with tRPC
2. ✅ Native Drizzle support (no adapter quirks)
3. ✅ Modern, clean API
4. ✅ Smaller bundle size
5. ✅ Database sessions (more secure for permission checks)
6. ✅ Built-in 2FA, email verification, magic links

**Choose Auth.js only if:**
- You absolutely need a specific OAuth provider Better Auth doesn't support
- Your team is already experienced with Auth.js
- You need JWT for a stateless API

For your use case with complex role/permission management, Better Auth's database session approach and tighter Drizzle integration will make your life much easier!