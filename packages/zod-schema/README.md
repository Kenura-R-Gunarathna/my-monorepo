# @krag/zod-schema

Shared Zod validation schemas for the monorepo, ensuring type-safe data validation across all apps and packages.

## 📋 Overview

This package provides:
- ✅ Centralized validation schemas using Zod
- 🔄 Shared schemas across web and desktop apps
- 🛡️ Type-safe validation for forms, APIs, and databases
- 📝 Schema inference for TypeScript types
- 🎯 Reusable validation patterns
- 🔧 Custom validators and refinements

## 🏗️ Architecture

### Tech Stack
- **Validation**: Zod
- **TypeScript**: Full type inference

### Schema Categories

```typescript
// User & Auth
export const userSchema
export const loginSchema
export const registerSchema
export const updateProfileSchema

// Entities
export const postSchema
export const commentSchema
export const roleSchema
export const permissionSchema

// Settings & Config
export const settingsSchema
export const themeSchema
export const notificationSchema

// Common
export const idSchema
export const emailSchema
export const passwordSchema
export const dateRangeSchema
```

### Project Structure
```
packages/zod-schema/
├── src/
│   ├── index.ts              # Main exports
│   ├── user.ts               # User schemas
│   ├── auth.ts               # Auth schemas
│   ├── post.ts               # Post schemas
│   ├── settings.ts           # Settings schemas
│   ├── common.ts             # Common validators
│   └── refinements.ts        # Custom refinements
└── package.json
```

## 🚀 Getting Started

### Installation

Already included in the monorepo:
```bash
pnpm install
```

## 📖 Usage

### 1. Import Schemas

```typescript
import { 
  userSchema, 
  loginSchema, 
  createPostSchema 
} from '@krag/zod-schema'
```

### 2. Validate Data

```typescript
import { loginSchema } from '@krag/zod-schema'

const result = loginSchema.safeParse({
  email: 'user@example.com',
  password: 'password123'
})

if (result.success) {
  console.log('Valid data:', result.data)
} else {
  console.error('Validation errors:', result.error.errors)
}
```

### 3. Use with TypeScript

```typescript
import { userSchema } from '@krag/zod-schema'
import type { z } from 'zod'

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  // TypeScript will enforce all required fields
}
```

### 4. Use in tRPC Procedures

```typescript
import { router, publicProcedure } from '../trpc'
import { loginSchema, createPostSchema } from '@krag/zod-schema'

export const authRouter = router({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      // input is type-safe and validated
      const { email, password } = input
      // ... authentication logic
    }),
    
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      // input is validated against createPostSchema
      return ctx.db.insert(posts).values(input)
    }),
})
```

### 5. Use with TanStack Form

```typescript
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { loginSchema } from '@krag/zod-schema'

function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: zodValidator(loginSchema),
    },
    onSubmit: async ({ value }) => {
      // value is type-safe and validated
      await login(value)
    },
  })
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}>
      <form.Field name="email">
        {(field) => (
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      {/* ... */}
    </form>
  )
}
```

### 6. Use in API Routes (Astro)

```typescript
// src/pages/api/users.ts
import { userSchema } from '@krag/zod-schema'

export async function POST({ request }) {
  const body = await request.json()
  
  // Validate request body
  const result = userSchema.safeParse(body)
  
  if (!result.success) {
    return new Response(JSON.stringify({
      errors: result.error.errors
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // result.data is validated
  const user = await createUser(result.data)
  return Response.json(user)
}
```

## 🎯 Schema Examples

### User Schemas

```typescript
import { z } from 'zod'

export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.number().int().optional(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export const createUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})

export const updateUserSchema = userSchema
  .omit({ id: true, createdAt: true })
  .partial()

export const userIdSchema = z.object({
  id: z.number().int().positive()
})

// Infer types
export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
```

### Auth Schemas

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export type Login = z.infer<typeof loginSchema>
export type Register = z.infer<typeof registerSchema>
```

### Post Schemas

```typescript
import { z } from 'zod'

export const postSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  authorId: z.number().int().positive(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
})

export const createPostSchema = postSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})

export const updatePostSchema = postSchema
  .omit({ id: true, authorId: true, createdAt: true })
  .partial()

export type Post = z.infer<typeof postSchema>
export type CreatePost = z.infer<typeof createPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>
```

### Common Validators

```typescript
import { z } from 'zod'

// Email
export const emailSchema = z.string().email()

// Strong password
export const strongPasswordSchema = z.string()
  .min(8)
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')

// ID
export const idSchema = z.number().int().positive()

// UUID
export const uuidSchema = z.string().uuid()

// Date range
export const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
}).refine((data) => data.to >= data.from, {
  message: 'End date must be after start date',
  path: ['to'],
})

// Pagination
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

// Sort
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc'),
})
```

### Custom Refinements

```typescript
import { z } from 'zod'

// Unique email check
export const uniqueEmailSchema = z.string().email().refine(
  async (email) => {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email)
    })
    return !existing
  },
  { message: 'Email already exists' }
)

// File upload
export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  name: z.string(),
}).refine((data) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  return validTypes.includes(data.file.type)
}, {
  message: 'Invalid file type. Only JPEG, PNG, and WebP allowed',
})

// Phone number
export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number'
)
```

## 🔧 Advanced Usage

### Discriminated Unions

```typescript
const eventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('user_created'),
    userId: z.number(),
    name: z.string(),
  }),
  z.object({
    type: z.literal('post_published'),
    postId: z.number(),
    title: z.string(),
  }),
])

type Event = z.infer<typeof eventSchema>
// Event is: 
// | { type: 'user_created'; userId: number; name: string }
// | { type: 'post_published'; postId: number; title: string }
```

### Recursive Schemas

```typescript
type Category = {
  id: number
  name: string
  children?: Category[]
}

const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    children: z.array(categorySchema).optional(),
  })
)
```

### Transform Data

```typescript
const dateStringSchema = z.string().transform((str) => new Date(str))

const userWithDateSchema = z.object({
  id: z.number(),
  createdAt: dateStringSchema, // Transforms string to Date
})

const result = userWithDateSchema.parse({
  id: 1,
  createdAt: '2024-01-01'
})
// result.createdAt is Date object
```

### Preprocess Data

```typescript
const trimmedStringSchema = z.preprocess(
  (val) => typeof val === 'string' ? val.trim() : val,
  z.string()
)

const emailSchema = z.preprocess(
  (val) => typeof val === 'string' ? val.toLowerCase() : val,
  z.string().email()
)
```

## 📦 Exports

```typescript
// User schemas
export { 
  userSchema, 
  createUserSchema, 
  updateUserSchema,
  userIdSchema 
}

// Auth schemas
export { 
  loginSchema, 
  registerSchema, 
  resetPasswordSchema 
}

// Post schemas
export { 
  postSchema, 
  createPostSchema, 
  updatePostSchema 
}

// Common validators
export { 
  emailSchema, 
  strongPasswordSchema, 
  idSchema,
  uuidSchema,
  dateRangeSchema,
  paginationSchema,
  sortSchema 
}

// Types
export type * from './user'
export type * from './auth'
export type * from './post'
```

## 🧪 Testing

```typescript
import { describe, it, expect } from 'vitest'
import { userSchema, loginSchema } from '@krag/zod-schema'

describe('User Schema', () => {
  it('should validate valid user', () => {
    const result = userSchema.safeParse({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      active: true,
      createdAt: new Date(),
    })
    
    expect(result.success).toBe(true)
  })
  
  it('should reject invalid email', () => {
    const result = userSchema.safeParse({
      id: 1,
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
      createdAt: new Date(),
    })
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('email')
    }
  })
})
```

## 📚 Related Documentation

- [Zod Documentation](https://zod.dev/)
- [TanStack Form + Zod](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- See `@krag/react-ui` README for form usage
- See tRPC routers for API validation examples

## 🤝 Contributing

This is part of a monorepo. Make sure to:
1. Add schemas for all new entities
2. Export inferred TypeScript types
3. Include validation error messages
4. Test all schemas thoroughly
5. Document complex refinements in this README
