**Excellent question!** Let me analyze both approaches for your monorepo structure.

---

## Approach Comparison

### Option 1: Separate Packages (Recommended for Scale)

```
apps/
├── web/                    # Astro web app
└── desktop/                # Electron desktop app

packages/
├── ui/                     # shadcn components only
├── auth-ui/                # Auth components (imports from @repo/ui)
├── database/               # Drizzle schema, migrations
├── auth/                   # Better Auth configuration
├── permissions/            # CASL, permission logic
└── typescript-config/      # Shared TS configs
```

### Option 2: Combined UI Package

```
apps/
├── web/                    # Astro web app
└── desktop/                # Electron desktop app

packages/
├── react-ui/               # shadcn + auth components combined
├── database/               # Drizzle schema, migrations
├── auth/                   # Better Auth configuration
├── permissions/            # CASL, permission logic
└── typescript-config/      # Shared TS configs
```

---

## My Recommendation: **Option 1 (Separate Packages)**

Here's why:

### ✅ Benefits of Separation

1. **Clear Boundaries** - UI primitives vs. auth-specific components
2. **Reusability** - Use shadcn components without auth dependencies
3. **Tree-shaking** - Better bundle size (web might not need all auth UI)
4. **Testability** - Test UI components independently
5. **Team Scalability** - Different teams can own different packages
6. **Flexibility** - Easy to swap auth providers without touching UI
7. **Version Control** - Update shadcn without affecting auth logic

### When Option 2 Makes Sense:
- ❌ Small team (<3 developers)
- ❌ Simple auth requirements
- ❌ Both apps always use identical UI
- ❌ Don't want maintenance overhead

---

## Complete Monorepo Structure (Recommended)

```
my-app/
├── apps/
│   ├── web/                          # Astro web application
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/           # App-specific components
│   │   │   └── layouts/
│   │   ├── astro.config.mjs
│   │   └── package.json
│   │
│   └── desktop/                      # Electron desktop app
│       ├── src/
│       ├── electron/
│       └── package.json
│
├── packages/
│   ├── ui/                           # Pure shadcn components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/              # shadcn primitives
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── dialog.tsx
│   │   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── index.ts
│   │   │   ├── lib/
│   │   │   │   └── utils.ts
│   │   │   └── index.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── auth-ui/                      # Auth-specific components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── signup-form.tsx
│   │   │   │   ├── oauth-buttons.tsx
│   │   │   │   ├── profile-menu.tsx
│   │   │   │   ├── permission-gate.tsx
│   │   │   │   └── role-badge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-permissions.ts
│   │   │   │   └── use-session.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── database/                     # Database layer
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── users.ts
│   │   │   │   ├── roles.ts
│   │   │   │   ├── permissions.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── index.ts
│   │   │   ├── migrations/
│   │   │   └── index.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── auth/                         # Auth configuration
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   └── client.ts
│   │   └── package.json
│   │
│   ├── permissions/                  # Permission logic
│   │   ├── src/
│   │   │   ├── abilities.ts
│   │   │   ├── resolver.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── trpc/                         # tRPC setup
│   │   ├── src/
│   │   │   ├── routers/
│   │   │   ├── middleware/
│   │   │   ├── context.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── typescript-config/            # Shared TS configs
│       ├── base.json
│       ├── nextjs.json
│       └── react-library.json
│
├── package.json                      # Root package.json
├── pnpm-workspace.yaml              # Workspace config
├── turbo.json                        # Turborepo config
└── tsconfig.json                     # Root TS config
```

---

## Package Setup

### Root `package.json`

```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "db:generate": "turbo run db:generate",
    "db:migrate": "turbo run db:migrate",
    "db:seed": "turbo run db:seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".astro/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

---

## 1. UI Package (shadcn only)

### `packages/ui/package.json`

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./globals.css": "./src/styles/globals.css"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.263.1",
    "tailwind-merge": "^2.2.0"
  }
}
```

### `packages/ui/src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### `packages/ui/src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### `packages/ui/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 2. Auth UI Package

### `packages/auth-ui/package.json`

```json
{
  "name": "@repo/auth-ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/auth": "workspace:*",
    "@repo/permissions": "workspace:*",
    "@casl/react": "^4.1.0",
    "lucide-react": "^0.263.1",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

### `packages/auth-ui/src/components/login-form.tsx`

```tsx
"use client"

import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { authClient } from "@repo/auth/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })
      
      // Redirect handled by Better Auth
      window.location.href = "/dashboard"
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    })
  }

  const handleGitHubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
            Google
          </Button>
          <Button variant="outline" onClick={handleGitHubSignIn} disabled={isLoading}>
            GitHub
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
```

### `packages/auth-ui/src/components/permission-gate.tsx`

```tsx
import { usePermissions } from "../hooks/use-permissions"
import type { ReactNode } from "react"

interface PermissionGateProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, isLoading } = usePermissions()

  if (isLoading) return null
  if (!hasPermission(permission)) return <>{fallback}</>

  return <>{children}</>
}
```

### `packages/auth-ui/src/hooks/use-permissions.ts`

```typescript
import { useMemo } from "react"
import { trpc } from "@repo/trpc/client" // You'll need to set this up

export function usePermissions() {
  const { data: permissions, isLoading } = trpc.auth.myPermissions.useQuery()

  const hasPermission = useMemo(() => {
    return (permissionName: string) => {
      return permissions?.some(p => p.name === permissionName && p.isActive) ?? false
    }
  }, [permissions])

  const can = useMemo(() => {
    return (action: string, resource: string) => {
      const permissionName = `${resource}.${action}`
      return hasPermission(permissionName)
    }
  }, [hasPermission])

  return {
    permissions,
    isLoading,
    hasPermission,
    can,
  }
}
```

### `packages/auth-ui/src/hooks/use-auth.ts`

```typescript
import { authClient } from "@repo/auth/client"
import { useEffect, useState } from "react"

export function useAuth() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((session) => {
      setSession(session)
      setIsLoading(false)
    })
  }, [])

  const signOut = async () => {
    await authClient.signOut()
    setSession(null)
  }

  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated: !!session,
    signOut,
  }
}
```

---

## 3. Using in Apps

### `apps/web/package.json`

```json
{
  "name": "web",
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/auth-ui": "workspace:*",
    "@repo/database": "workspace:*",
    "@repo/auth": "workspace:*",
    "@repo/permissions": "workspace:*",
    "@repo/trpc": "workspace:*",
    "astro": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### `apps/web/src/pages/login.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import { LoginForm } from '@repo/auth-ui/components/login-form';
---

<Layout title="Sign In">
  <div class="flex min-h-screen items-center justify-center">
    <LoginForm client:load />
  </div>
</Layout>
```

### `apps/web/src/pages/dashboard.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import { Button } from '@repo/ui/components/ui/button';
import { PermissionGate } from '@repo/auth-ui/components/permission-gate';
---

<Layout title="Dashboard">
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-8">Dashboard</h1>
    
    <PermissionGate permission="posts.create" client:load>
      <Button client:load>Create Post</Button>
    </PermissionGate>
    
    <PermissionGate permission="users.manage" client:load>
      <Button variant="outline" client:load>Manage Users</Button>
    </PermissionGate>
  </div>
</Layout>
```

---

## Benefits Summary

| Aspect | Benefit |
|--------|---------|
| **@repo/ui** | Reusable primitives, no auth coupling |
| **@repo/auth-ui** | Auth-specific logic, imports from @repo/ui |
| **Clean imports** | `import { Button } from "@repo/ui/components/ui/button"` |
| **Type safety** | Full TypeScript across packages |
| **Bundle optimization** | Tree-shake unused components |
| **Testability** | Test UI and auth separately |
| **Maintenance** | Update shadcn without touching auth |
| **Team workflow** | Clear ownership boundaries |

This structure gives you **maximum flexibility and maintainability** while keeping things organized and type-safe!