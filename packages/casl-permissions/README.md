# @krag/casl-permissions

CASL-based permission and authorization system for the monorepo with role-based access control (RBAC).

## 📋 Overview

This package provides:
- 🔐 Role-based permission management
- ✅ Action-based authorization (CRUD operations)
- 🎯 Resource-specific permissions
- 🔄 Dynamic ability building from database
- 🛡️ Type-safe permission checks
- 📦 Works in both web (Astro) and desktop (Electron) apps

## 🏗️ Architecture

### Tech Stack
- **Authorization**: CASL (Condition-based Access Control)
- **Database**: Drizzle ORM (@krag/drizzle-orm-server)
- **Validation**: TypeScript + Zod

### Core Concepts
```typescript
// Action: what can be done
type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

// Subject: what it's done to
type Subject = 'User' | 'Post' | 'Role' | 'Permission' | 'all'

// Permission: action + subject
// Example: "create Post", "read User", "manage all"
```

### Database Schema
```
roles (admin, editor, viewer)
  ↓ has many
role_permissions
  ↓ references
permissions (create:Post, read:User, etc.)
  ↑ also has
user_permissions (direct user permissions)
  ↓ belongs to
users
```

## 🚀 Installation

Already included in the monorepo. If setting up fresh:

```bash
pnpm add @casl/ability --filter @krag/casl-permissions
pnpm install
```

## 📖 Usage

### 1. Define Abilities for a User

```typescript
import { defineAbilitiesFor } from '@krag/casl-permissions'
import { getWebDb, users } from '@krag/drizzle-orm-server'
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
```

### 2. Check Permissions

```typescript
// Can user perform action on subject?
if (ability.can('read', 'Post')) {
  // Show posts
}

if (ability.can('create', 'User')) {
  // Show create user button
}

if (ability.can('update', 'Post')) {
  // Show edit button
}

if (ability.can('delete', 'User')) {
  // Show delete button
}

// Check with specific subject instance
const post = await db.query.posts.findFirst()
if (ability.can('update', post)) {
  // Can update this specific post
}
```

### 3. Use in API Routes (Astro)

```typescript
// src/pages/api/posts.ts
import { defineAbilitiesFor } from '@krag/casl-permissions'
import { getWebDb, posts } from '@krag/drizzle-orm-server'

export async function POST({ request, locals }) {
  const user = locals.user // From auth middleware
  const ability = defineAbilitiesFor(user)
  
  if (!ability.can('create', 'Post')) {
    return new Response('Forbidden', { status: 403 })
  }
  
  // Create post
  const data = await request.json()
  const db = getWebDb()
  const newPost = await db.insert(posts).values(data)
  
  return Response.json(newPost)
}
```

### 4. Use in tRPC Procedures

```typescript
// In @krag/react-ui/server/routers/posts.ts
import { defineAbilitiesFor } from '@krag/casl-permissions'
import { protectedProcedure } from '../trpc'

export const postsRouter = router({
  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      const ability = defineAbilitiesFor(ctx.user)
      
      if (!ability.can('create', 'Post')) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      
      return ctx.db.insert(posts).values(input)
    }),
    
  update: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ input, ctx }) => {
      const ability = defineAbilitiesFor(ctx.user)
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id)
      })
      
      if (!post || !ability.can('update', post)) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      
      return ctx.db.update(posts).set(input).where(eq(posts.id, input.id))
    }),
})
```

### 5. Use in React Components

```typescript
import { usePermissions } from '@krag/react-ui/hooks/usePlatformFeatures'
import { Button } from '@krag/react-ui/components/ui/button'

function PostList() {
  const { can } = usePermissions()
  
  return (
    <div>
      {can('create', 'Post') && (
        <Button onClick={handleCreate}>Create Post</Button>
      )}
      
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          {can('update', post) && (
            <Button onClick={() => handleEdit(post)}>Edit</Button>
          )}
          {can('delete', post) && (
            <Button onClick={() => handleDelete(post)}>Delete</Button>
          )}
        </div>
      ))}
    </div>
  )
}
```

## 🎯 Permission Rules

### Default Rules (src/rules.ts)

```typescript
// Admin - can do everything
if (user.role?.name === 'admin') {
  can('manage', 'all')
}

// Editor - can manage posts, read users
if (user.role?.name === 'editor') {
  can(['create', 'read', 'update', 'delete'], 'Post')
  can('read', 'User')
}

// Viewer - read only
if (user.role?.name === 'viewer') {
  can('read', ['Post', 'User'])
}

// Own resources - can update own profile
can('update', 'User', { id: user.id })
can('delete', 'Post', { authorId: user.id })
```

### Custom Rules

Add custom rules in `src/rules.ts`:

```typescript
export function defineRules(user: User, builder: AbilityBuilder) {
  const { can, cannot } = builder
  
  // Custom role
  if (user.role?.name === 'moderator') {
    can('read', 'all')
    can('update', 'Post', { published: false }) // Only draft posts
    can('delete', 'Comment')
    cannot('delete', 'Post') // Cannot delete posts
  }
  
  // Conditional permissions
  if (user.emailVerified) {
    can('create', 'Post')
  }
  
  // Time-based permissions
  if (user.subscriptionExpiry > new Date()) {
    can('create', 'PremiumContent')
  }
}
```

## 🔧 API Reference

### `defineAbilitiesFor(user)`
Build ability instance for a user.

**Parameters:**
- `user`: User object with role and permissions

**Returns:**
- `Ability` instance from CASL

**Example:**
```typescript
const ability = defineAbilitiesFor(user)
```

### `ability.can(action, subject)`
Check if action is allowed on subject.

**Parameters:**
- `action`: 'create' | 'read' | 'update' | 'delete' | 'manage'
- `subject`: 'User' | 'Post' | etc. or object instance

**Returns:**
- `boolean`

**Example:**
```typescript
if (ability.can('create', 'Post')) {
  // allowed
}
```

### `ability.cannot(action, subject)`
Opposite of `can()`.

**Example:**
```typescript
if (ability.cannot('delete', 'User')) {
  // not allowed
}
```

## 🗄️ Database Setup

### Migrations

The package expects these tables in your database:

```sql
-- roles table
CREATE TABLE roles (
  id INT PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  description TEXT
);

-- permissions table
CREATE TABLE permissions (
  id INT PRIMARY KEY,
  action VARCHAR(50),
  subject VARCHAR(50),
  conditions JSON
);

-- role_permissions junction table
CREATE TABLE role_permissions (
  role_id INT REFERENCES roles(id),
  permission_id INT REFERENCES permissions(id)
);

-- user_permissions for direct user permissions
CREATE TABLE user_permissions (
  user_id INT REFERENCES users(id),
  permission_id INT REFERENCES permissions(id)
);
```

### Seeding

Seed default roles and permissions:

```typescript
// In @krag/drizzle-orm-server/src/seed.ts
import { db } from './connection'
import { roles, permissions, rolePermissions } from './schema'

// Create roles
const [admin, editor, viewer] = await db.insert(roles).values([
  { name: 'admin', description: 'Full system access' },
  { name: 'editor', description: 'Can manage content' },
  { name: 'viewer', description: 'Read-only access' },
])

// Create permissions
const [createPost, readPost, updatePost, deletePost] = await db
  .insert(permissions)
  .values([
    { action: 'create', subject: 'Post' },
    { action: 'read', subject: 'Post' },
    { action: 'update', subject: 'Post' },
    { action: 'delete', subject: 'Post' },
  ])

// Assign permissions to roles
await db.insert(rolePermissions).values([
  { roleId: admin.id, permissionId: createPost.id },
  { roleId: admin.id, permissionId: readPost.id },
  { roleId: admin.id, permissionId: updatePost.id },
  { roleId: admin.id, permissionId: deletePost.id },
  // ... etc
])
```

## 🧪 Testing

```typescript
import { describe, it, expect } from 'vitest'
import { defineAbilitiesFor } from '@krag/casl-permissions'

describe('Permissions', () => {
  it('admin can manage all', () => {
    const admin = { 
      id: 1, 
      role: { name: 'admin' },
      rolePermissions: [],
      userPermissions: []
    }
    
    const ability = defineAbilitiesFor(admin)
    
    expect(ability.can('manage', 'all')).toBe(true)
    expect(ability.can('delete', 'User')).toBe(true)
  })
  
  it('viewer can only read', () => {
    const viewer = { 
      id: 2, 
      role: { name: 'viewer' },
      rolePermissions: [],
      userPermissions: []
    }
    
    const ability = defineAbilitiesFor(viewer)
    
    expect(ability.can('read', 'Post')).toBe(true)
    expect(ability.can('create', 'Post')).toBe(false)
  })
})
```

## 📚 Related Documentation

- [CASL Documentation](https://casl.js.org/v6/en/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- See `@krag/drizzle-orm-server` README for database schema
- See `@krag/react-ui` README for React hooks

## 🤝 Contributing

This is part of a monorepo. Make sure to:
1. Run commands from the monorepo root using `--filter`
2. Add tests for new permission rules
3. Update database seeds when adding new permissions
4. Document custom rules in this README

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
