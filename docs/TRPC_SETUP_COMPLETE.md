# tRPC Setup Complete

## Architecture Overview

The tRPC implementation uses the **new TanStack React Query integration** (recommended by tRPC team) with proper separation of concerns:

### 📦 Packages Structure

**packages/trpc-api** (Shared Types Only)
- Contains type definitions and base procedure setup
- No database operations (frontend can import this)
- Exports: `router`, `publicProcedure`, `protectedProcedure`, `Context` type

**apps/astro-web/src/server/trpc** (Backend Implementation)
- Contains actual database operations using `database-core` + `database-web`
- Server-side only code
- Structure:
  ```
  server/trpc/
  ├── context.ts        # Creates tRPC context with session + db
  ├── trpc.ts           # tRPC instance with procedures
  └── routers/
      ├── _app.ts       # Main app router (exports AppRouter type)
      ├── auth.ts       # Auth router (session queries)
      └── user.ts       # User router (profile, stats, updates)
  ```

### 🔌 Integration Points

**1. Context Creation** (`server/trpc/context.ts`)
```typescript
export async function createContext(opts: { ctx: APIContext }): Promise<Context> {
  const session = await auth.api.getSession({ headers: ctx.request.headers })
  const db = getWebDb() // From @krag/database-web
  return { session, db }
}
```

**2. Protected Procedures** (`server/trpc/trpc.ts`)
```typescript
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, session: ctx.session } })
})
```

**3. API Endpoint** (`pages/api/trpc/[trpc].ts`)
- Uses `fetchRequestHandler` from `@trpc/server/adapters/fetch`
- Calls `createContext` for each request
- Endpoint: `/api/trpc`

**4. React Client** (`lib/trpc.ts` + `lib/trpc-provider.tsx`)
```typescript
// Using new TanStack React Query integration
const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()

// In provider (with SSR-safe QueryClient):
const queryClient = getQueryClient() // Server: new client, Browser: singleton
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
      credentials: 'include'
    })
  ]
})
```

### 📊 Database Integration

**Uses both packages:**
- `@krag/database-core` - Core database connection and shared schemas
- `@krag/database-web` - Web-specific tables + re-exports Better Auth schemas

**Available schemas in routers:**
```typescript
import { user, session } from '@krag/database-web'

// Better Auth schemas are re-exported from database-web:
// - user (with custom fields: firstName, lastName, roleId, etc.)
// - session
// - account
// - verification
```

### 🛡️ Authentication Flow

1. **Better Auth** handles authentication (sign-in, sign-up)
2. **Middleware** stores session in `context.locals`
3. **tRPC Context** fetches session for each API request
4. **Protected Procedures** validate session exists
5. **Routers** use `ctx.session.user.id` for user-specific queries

### 📝 Available Routers

**Auth Router** (`trpc.auth.*`)
- `getSession` - Get current session (public)

**User Router** (`trpc.user.*`)
- `getProfile` - Get current user's full profile (protected)
- `updateProfile` - Update name/image (protected)
- `getUserById` - Get user by ID (public)
- `checkEmailExists` - Check if email exists (public)
- `getStats` - Get user statistics (protected)

### 🔧 Usage Example

```tsx
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTRPC } from '../lib/trpc'

export function MyComponent() {
  const trpc = useTRPC()
  
  // Query - using queryOptions factory
  const { data, isLoading } = useQuery(
    trpc.user.getProfile.queryOptions()
  )
  
  // Mutation - using mutationOptions factory
  const updateProfile = useMutation(
    trpc.user.updateProfile.mutationOptions({
      onSuccess: () => {
        // Refetch or invalidate queries
      }
    })
  )
  
  const handleUpdate = () => {
    updateProfile.mutate({ name: 'New Name' })
  }
  
  return <div>{data?.name}</div>
}
```

### ✅ Dependencies Installed

- `@trpc/client@11.7.1`
- `@trpc/server@11.7.1` ✅ (upgraded from 11.7.0)
- `@trpc/tanstack-react-query@11.7.1` ✅ (new TanStack integration)
- `@tanstack/react-query@5.90.5`
- `superjson@2.2.5` ✅ (newly installed)

### 🎯 Key Benefits

1. **Type Safety** - Full end-to-end type inference
2. **No Code Generation** - Types derived automatically
3. **Proper Separation** - Shared types vs backend implementation
4. **Database Integration** - Uses database-core + database-web
5. **Auth Integration** - Works with Better Auth session
6. **Validation** - Uses zod-schema for input validation
7. **TanStack Native** - Uses queryOptions/mutationOptions factories (recommended pattern)
8. **SSR-Safe** - QueryClient properly handled for server/browser contexts

### 📚 Next Steps

To use tRPC in your components:

1. Wrap your app with `TRPCProvider` (in Astro layout)
2. Use `const trpc = useTRPC()` hook to get tRPC instance
3. Use `useQuery(trpc.router.procedure.queryOptions())` for queries
4. Use `useMutation(trpc.router.procedure.mutationOptions())` for mutations
5. Add more routers in `server/trpc/routers/` as needed
6. Always export router types from `_app.ts`

Example: See `components/user-profile-example.tsx` for complete usage demo

### 📖 Why TanStack React Query Integration?

This setup uses the **new TanStack React Query integration** (`@trpc/tanstack-react-query`) instead of the classic `@trpc/react-query` because:

- ✅ More TanStack Query-native with `queryOptions()` and `mutationOptions()` factories
- ✅ Better TypeScript inference
- ✅ Easier to use with standard TanStack Query patterns
- ✅ Recommended by tRPC team as the future
- ✅ Simpler API and better integration with React Query ecosystem
