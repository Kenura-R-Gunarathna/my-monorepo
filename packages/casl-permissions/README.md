# @krag/casl-permissions

CASL-based permission management for the KRAG monorepo.

## Installation

From monorepo root:

```bash
pnpm add @casl/ability --filter @krag/casl-permissions
pnpm install
```

## Usage

### Define Abilities

```typescript
import { defineAbilitiesFor } from '@krag/casl-permissions'
import { getWebDb, users, roles } from '@krag/database-web'
import { eq } from 'drizzle-orm'

const db = getWebDb()

// Get user with role and permissions
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    role: {
      with: {
        rolePermissions: {
          with: {
            permission: true
          }
        }
      }
    },
    userPermissions: {
      with: {
        permission: true
      }
    }
  }
})

// Build abilities
const ability = defineAbilitiesFor(user)

// Check permissions
if (ability.can('read', 'Post')) {
  // User can read posts
}

if (ability.can('create', 'User')) {
  // User can create users
}
```

### Permission Rules

```typescript
import { PermissionRules } from '@krag/casl-permissions/rules'

// Use predefined permission strings
const canCreatePost = ability.can('create', 'Post')
// Or use constants
const canCreateUser = PermissionRules.USER_CREATE
```

### With tRPC

```typescript
import { defineAbilitiesFor } from '@krag/casl-permissions'
import { TRPCError } from '@trpc/server'

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const ability = defineAbilitiesFor(ctx.user)

  return next({
    ctx: {
      ...ctx,
      ability
    }
  })
})
```

## Permission Format

Permissions follow the format: `resource:action`

- **Resource**: The subject being accessed (User, Post, Role, etc.)
- **Action**: create, read, update, delete, manage

Examples:
- `User:create` - Can create users
- `Post:read` - Can read posts
- `Role:manage` - Full access to roles
- `all:manage` - Admin wildcard (full access)

## Conditional Permissions

Store JSON conditions in the `conditions` field:

```typescript
// In database
{
  name: 'Post:update',
  resource: 'Post',
  action: 'update',
  conditions: JSON.stringify({ authorId: '{{ userId }}' })
}

// CASL will check: can user update posts WHERE post.authorId === user.id
```
