# Better Auth Implementation - Setup Complete

## Overview
Successfully implemented Better Auth from `astro-working-example` into `apps/astro-web` with React components, integrated with your monorepo packages.

## What Was Implemented

### 1. Configuration Updates
- **`packages/config-astro/src/schema.ts`**: Added OAuth provider credentials (Google, GitHub), Resend API key, and Better Auth secret to environment schema

### 2. Authentication Core
- **`apps/astro-web/src/auth.ts`**: Better Auth server configuration using:
  - `@krag/database-astro` for database connection via Drizzle
  - `@krag/config-astro` for environment variables
  - Plugins: Passkey, Two-Factor Authentication
  - Social providers: Google, GitHub
  - Email/Password authentication

### 3. API Routes
- **`apps/astro-web/src/pages/api/auth/[...all].ts`**: Better Auth API handler for all authentication requests

### 4. Middleware
- **`apps/astro-web/src/middleware.ts`**: Protects `/dashboard` and other authenticated routes, redirects unauthenticated users to `/sign-in`

### 5. Client-Side Auth
- **`apps/astro-web/src/lib/auth-client.ts`**: React-based auth client with hooks:
  - `signIn`, `signOut`, `signUp`
  - `useSession` hook for session management
  - Passkey and Two-Factor authentication support

### 6. React Components (Adapted from SolidJS)
- **`src/components/sign-in.tsx`**: Sign-in form with email/password, social OAuth, and passkey support
- **`src/components/sign-up.tsx`**: Registration form with profile image upload
- **`src/components/user-card.tsx`**: User profile display with session information

### 7. Pages
- **`src/pages/index.astro`**: Home page with navigation to sign-in and dashboard
- **`src/pages/sign-in.astro`**: Sign-in page using React component
- **`src/pages/sign-up.astro`**: Sign-up page using React component
- **`src/pages/dashboard.astro`**: Protected dashboard showing user profile

### 8. tRPC Integration
- **`packages/trpc-api/src/router/auth.ts`**: Auth router with procedures for:
  - Getting current session
  - Checking email availability
  - Updating user profile
  - User queries
- **`packages/trpc-api/src/trpc.ts`**: Updated context type to include session data
- **`packages/trpc-api/src/router/index.ts`**: Added auth router to main app router

### 9. Configuration
- **`apps/astro-web/astro.config.mjs`**: Configured for React (removed SolidJS dependency)
- **`apps/astro-web/package.json`**: Added `better-auth` dependency

## Environment Variables Required

Add these to your `.env` file in the monorepo root or in `apps/astro-web`:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/database

# API Configuration
API_URL=http://localhost:4321
PORT=4321
NODE_ENV=development

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Provider (Optional for 2FA)
RESEND_API_KEY=your-resend-api-key

# Better Auth Secret (Generate a random string)
BETTER_AUTH_SECRET=your-secret-key-here
```

## How to Use

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Database Migrations
Make sure your database schema includes the Better Auth tables (user, session, account, verification). These should already be in `packages/database-web`.

### 3. Start Development Server
```bash
cd apps/astro-web
pnpm dev
```

### 4. Test Authentication Flow
1. Visit `http://localhost:4321`
2. Click "Sign In" or navigate to `/sign-up` to create an account
3. After signing in, you'll be redirected to `/dashboard`
4. Try OAuth providers (if configured) or passkey authentication

## Key Features

✅ **Email/Password Authentication**: Full sign-up and sign-in flow
✅ **Social OAuth**: Google and GitHub integration
✅ **Passkey Support**: WebAuthn/FIDO2 passwordless authentication
✅ **Two-Factor Authentication**: OTP via email (needs email provider setup)
✅ **Session Management**: Secure cookie-based sessions
✅ **Protected Routes**: Middleware-based route protection
✅ **React Components**: Fully typed with TypeScript
✅ **Monorepo Integration**: Uses your existing packages (database, config, tRPC)
✅ **tRPC Integration**: Auth router for additional auth-related procedures

## Next Steps

1. **Configure OAuth Providers**: Get API keys from Google and GitHub if you want social login
2. **Setup Email Provider**: Configure Resend or another provider for 2FA OTP emails
3. **Customize UI**: Adjust components in `src/components/` to match your design
4. **Add More Features**: Extend auth router in tRPC for additional functionality
5. **Add Role-Based Access**: Integrate with `@krag/casl-permissions` for authorization
6. **Production Setup**: Update redirect URIs for production environment

## Differences from astro-working-example

- ✅ Uses **React** instead of SolidJS
- ✅ Uses your **monorepo packages** for database and config
- ✅ Integrated with **tRPC** for API operations
- ✅ Uses your existing **UI components** from `@krag/react-ui`
- ✅ Adapted for your **monorepo structure**

## Troubleshooting

### Issue: Can't sign in
- Check database connection in `DATABASE_URL`
- Verify Better Auth tables exist in database
- Check browser console for errors

### Issue: OAuth not working
- Verify client IDs and secrets in `.env`
- Check redirect URIs match in OAuth provider console
- Update callback URLs in `src/auth.ts` for production

### Issue: Components not loading
- Run `pnpm install` to ensure all dependencies are installed
- Check that `better-auth` package is installed in `apps/astro-web`

## Resources

- [Better Auth Documentation](https://better-auth.com)
- [Astro Documentation](https://docs.astro.build)
- [tRPC Documentation](https://trpc.io)
