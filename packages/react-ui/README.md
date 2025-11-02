# @krag/react-ui

Shared React component library with shadcn/ui, TanStack Router, TanStack Query, TanStack Form, and tRPC integration.

## 📋 Overview

This package provides:
- ⚛️ Shared React components used by both Astro web and Electron desktop apps
- 🎨 shadcn/ui components (buttons, forms, dialogs, etc.)
- 🔀 TanStack Router for client-side routing
- 🔄 TanStack Query for data fetching and caching
- 📝 TanStack Form with Zod validation
- 📡 Unified tRPC client (IPC + HTTP hybrid)
- 🎯 Custom hooks and utilities
- 🌗 Theme management (light/dark/system)

## 🏗️ Architecture

### Tech Stack
- **UI Framework**: React 18+
- **Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Forms**: TanStack Form
- **API**: tRPC client
- **Validation**: Zod via `@krag/zod-schema`
- **Build**: Vite

### Project Structure
```
packages/react-ui/
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   └── features/            # Feature components
│   │       ├── auth/
│   │       ├── users/
│   │       └── posts/
│   ├── providers/
│   │   ├── TRPCProvider.tsx    # tRPC + React Query
│   │   ├── ThemeProvider.tsx   # Theme management
│   │   └── RouterProvider.tsx  # TanStack Router
│   ├── hooks/
│   │   ├── usePlatformFeatures.ts  # Platform detection
│   │   ├── usePermissions.ts       # CASL permissions
│   │   └── useTheme.ts            # Theme management
│   ├── lib/
│   │   ├── trpc.ts             # tRPC client setup
│   │   └── utils.ts            # Utilities
│   ├── server/
│   │   ├── routers/            # tRPC routers
│   │   │   ├── _app.ts         # Root router
│   │   │   ├── users.ts        # User routes
│   │   │   ├── posts.ts        # Post routes
│   │   │   └── auth.ts         # Auth routes
│   │   └── trpc.ts             # tRPC server setup
│   └── App.tsx                 # Main app component
├── public/
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10.20.0+

### Installation

From monorepo root:
```bash
pnpm install
```

### Development

```bash
# Run standalone dev server
pnpm --filter @krag/react-ui dev

# Or from root
pnpm dev:ui
```

### Build

```bash
pnpm --filter @krag/react-ui build
```

## 📖 Usage

### 1. Import Components

```typescript
// UI Components
import { Button } from '@krag/react-ui/components/ui/button'
import { Input } from '@krag/react-ui/components/ui/input'
import { Dialog } from '@krag/react-ui/components/ui/dialog'
import { Card } from '@krag/react-ui/components/ui/card'

// Feature Components
import { UserList } from '@krag/react-ui/features/users'
import { LoginForm } from '@krag/react-ui/features/auth'
import { PostEditor } from '@krag/react-ui/features/posts'
```

### 2. Use in Astro

```astro
---
// src/pages/index.astro
import { UserList } from '@krag/react-ui/features/users'
import { Button } from '@krag/react-ui/components/ui/button'
---

<html>
  <body>
    <UserList client:load />
    <Button client:idle>Click me</Button>
  </body>
</html>
```

### 3. Use in Electron

```typescript
// src/renderer/App.tsx
import { TRPCProvider } from '@krag/react-ui/providers/TRPCProvider'
import { UserList } from '@krag/react-ui/features/users'
import { Button } from '@krag/react-ui/components/ui/button'

function App() {
  return (
    <TRPCProvider>
      <UserList />
      <Button>Click me</Button>
    </TRPCProvider>
  )
}
```

## 🎨 Components

### shadcn/ui Components

All shadcn/ui components are available:

```typescript
import { 
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  Alert,
  Badge,
  Checkbox,
  RadioGroup,
  Select,
  Textarea,
  Switch,
  Tabs,
  Toast,
} from '@krag/react-ui/components/ui'
```

### Button Examples

```typescript
import { Button } from '@krag/react-ui/components/ui/button'

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

### Form Components

```typescript
import { 
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage 
} from '@krag/react-ui/components/ui/form'
import { Input } from '@krag/react-ui/components/ui/input'
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
          <div>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <FormMessage>{field.state.meta.errors}</FormMessage>
          </div>
        )}
      </form.Field>
      
      <Button type="submit">Login</Button>
    </form>
  )
}
```

## 📡 tRPC Integration

### Unified tRPC Client

The tRPC client intelligently routes between IPC (Electron) and HTTP (Web):

```typescript
import { trpc } from '@krag/react-ui/lib/trpc'

// In React components
function UserList() {
  const { data, isLoading } = trpc.user.list.useQuery()
  const createUser = trpc.user.create.useMutation()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <Button onClick={() => createUser.mutate({ 
        name: 'John', 
        email: 'john@example.com' 
      })}>
        Add User
      </Button>
    </div>
  )
}
```

### Route Namespaces

| Namespace | Electron | Web | Description |
|-----------|----------|-----|-------------|
| `store.*` | ✅ IPC | ❌ | electron-store operations |
| `system.*` | ✅ IPC | ❌ | System APIs (version, platform) |
| `db.*` | ✅ IPC | ❌ | Local SQLite CRUD |
| `user.*` | ✅ IPC/HTTP | ✅ HTTP | User management (shared) |
| `post.*` | ✅ IPC/HTTP | ✅ HTTP | Content management (shared) |
| `auth.*` | ✅ HTTP | ✅ HTTP | OAuth/Social auth |
| `analytics.*` | ❌ | ✅ HTTP | Analytics tracking |

### TRPCProvider

```typescript
import { TRPCProvider } from '@krag/react-ui/providers/TRPCProvider'

function App() {
  return (
    <TRPCProvider>
      {/* Your app */}
    </TRPCProvider>
  )
}
```

## 🎯 Custom Hooks

### usePlatformFeatures

Detect platform and get system info:

```typescript
import { usePlatformFeatures } from '@krag/react-ui/hooks/usePlatformFeatures'

function App() {
  const { 
    isElectron, 
    isWeb, 
    platform, 
    version,
    hasFeature 
  } = usePlatformFeatures()
  
  return (
    <div>
      <p>Platform: {platform}</p>
      {hasFeature('offline') && <OfflineIndicator />}
      {hasFeature('electron-store') && <StoreManager />}
    </div>
  )
}
```

### usePermissions

Check user permissions (CASL):

```typescript
import { usePermissions } from '@krag/react-ui/hooks/usePermissions'

function PostActions({ post }) {
  const { can } = usePermissions()
  
  return (
    <div>
      {can('update', post) && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      {can('delete', post) && (
        <Button onClick={handleDelete}>Delete</Button>
      )}
    </div>
  )
}
```

### useTheme

Theme management:

```typescript
import { useTheme } from '@krag/react-ui/hooks/useTheme'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </Button>
  )
}
```

## 🔀 TanStack Router

### Define Routes

```typescript
// src/routes/index.tsx
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
  loader: async () => {
    const users = await trpc.user.list.query()
    return { users }
  },
})
```

### Navigation

```typescript
import { Link, useNavigate } from '@tanstack/react-router'

function Navigation() {
  const navigate = useNavigate()
  
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/users">Users</Link>
      <Button onClick={() => navigate({ to: '/settings' })}>
        Settings
      </Button>
    </nav>
  )
}
```

## 📝 Forms with TanStack Form

```typescript
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createUserSchema } from '@krag/zod-schema'
import { trpc } from '@krag/react-ui/lib/trpc'

function CreateUserForm() {
  const createUser = trpc.user.create.useMutation()
  
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onChange: zodValidator(createUserSchema),
    },
    onSubmit: async ({ value }) => {
      await createUser.mutateAsync(value)
    },
  })
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}>
      <form.Field name="name">
        {(field) => (
          <div>
            <Label>Name</Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && (
              <p className="text-red-500">{field.state.meta.errors}</p>
            )}
          </div>
        )}
      </form.Field>
      
      <Button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  )
}
```

## 🌗 Theme Provider

```typescript
import { ThemeProvider } from '@krag/react-ui/providers/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      {/* Your app */}
    </ThemeProvider>
  )
}
```

Themes: `light`, `dark`, `system`

## 🎯 Feature Components

### User Management

```typescript
import { 
  UserList, 
  UserForm, 
  UserDetail 
} from '@krag/react-ui/features/users'

// List users
<UserList onSelect={handleUserSelect} />

// Create/edit user
<UserForm 
  userId={userId} 
  onSuccess={handleSuccess} 
/>

// View user details
<UserDetail userId={userId} />
```

### Authentication

```typescript
import { 
  LoginForm, 
  RegisterForm, 
  ForgotPasswordForm 
} from '@krag/react-ui/features/auth'

<LoginForm onSuccess={() => navigate({ to: '/dashboard' })} />
<RegisterForm onSuccess={() => navigate({ to: '/dashboard' })} />
<ForgotPasswordForm onSuccess={() => navigate({ to: '/login' })} />
```

### Posts

```typescript
import { 
  PostList, 
  PostEditor, 
  PostViewer 
} from '@krag/react-ui/features/posts'

<PostList onSelectPost={handleSelect} />
<PostEditor postId={postId} onSave={handleSave} />
<PostViewer postId={postId} />
```

## 🔧 Adding New shadcn/ui Components

```bash
# From react-ui package
cd packages/react-ui
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Components are added to `src/components/ui/`

## 📦 Exports

```typescript
// Components
export * from './components/ui'
export * from './components/features'

// Providers
export { TRPCProvider } from './providers/TRPCProvider'
export { ThemeProvider } from './providers/ThemeProvider'

// Hooks
export { usePlatformFeatures } from './hooks/usePlatformFeatures'
export { usePermissions } from './hooks/usePermissions'
export { useTheme } from './hooks/useTheme'

// tRPC
export { trpc } from './lib/trpc'

// Server (for Astro/Electron main)
export { appRouter } from './server/routers/_app'
export type { AppRouter } from './server/routers/_app'
```

## 🧪 Development Tips

### Hot Module Replacement
Changes to components will hot reload in both Astro and Electron.

### TypeScript
The package uses strict TypeScript. All components are fully typed.

### Storybook (Optional)
Consider adding Storybook for component development:

```bash
pnpm add -D @storybook/react @storybook/react-vite
```

## 🧪 Testing

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@krag/react-ui/components/ui/button'

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## 📚 Related Documentation

- [React Documentation](https://react.dev/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Query Documentation](https://tanstack.com/query)
- [TanStack Form Documentation](https://tanstack.com/form)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- See `@krag/zod-schema` README for validation
- See `@krag/config` README for configuration

## 🤝 Contributing

This is part of a monorepo. Make sure to:
1. Follow React best practices
2. Use TypeScript for all components
3. Add prop types and JSDoc comments
4. Test components in both Astro and Electron
5. Use Tailwind CSS for styling
6. Follow shadcn/ui conventions
