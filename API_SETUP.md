# API Setup Documentation

## Overview

This monorepo uses **Astro + Hono + tRPC** for a unified backend that serves both the Astro web app and Electron desktop app.

## Architecture

```
apps/astro-web/
├── src/
│   ├── pages/api/[...all].ts  # Routes all API requests to Hono
│   └── server/
│       └── index.ts           # Hono server with tRPC integration
└── public/
    └── uploads/               # File uploads directory

packages/
├── zod-schema/               # Shared validation schemas
└── trpc-api/                 # Shared tRPC router & procedures
```

## Setup Complete ✅

### What Was Set Up

1. **Hono Server** (`apps/astro-web/src/server/index.ts`)
   - Health check endpoint
   - tRPC integration
   - File upload handling
   - File serving

2. **API Route Handler** (`apps/astro-web/src/pages/api/[...all].ts`)
   - Routes all API requests to Hono server
   - Uses Astro's `ALL` catch-all route

3. **tRPC Setup** (`packages/trpc-api/`)
   - Router configuration
   - User procedures (getById, create, list)
   - Type-safe API

4. **Zod Schemas** (`packages/zod-schema/`)
   - User validation schemas
   - Shared between frontends

## API Endpoints

### Health Check
```bash
GET /api/health
```

### tRPC Endpoints
```bash
POST /api/trpc/user.getById
POST /api/trpc/user.create
POST /api/trpc/user.list
```

### File Upload
```bash
POST /api/upload
Content-Type: multipart/form-data

# Response
{
  "success": true,
  "url": "/uploads/1234567890-file.jpg",
  "size": 12345,
  "type": "image/jpeg",
  "name": "file.jpg"
}
```

### File Serving
```bash
GET /api/files/[filename]
# Redirects to /uploads/[filename]
```

## Usage in Frontend

### In Astro Pages
```typescript
// Fetch health check
const response = await fetch('/api/health')
const data = await response.json()

// Upload file
const formData = new FormData()
formData.append('file', file)
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

### In Electron
```typescript
// Connect to same API
const baseURL = process.env.API_URL || 'http://localhost:4321'

const response = await fetch(`${baseURL}/api/health`)
```

## Development

### Start Dev Server
```bash
# Start all apps
pnpm dev

# Start only Astro
pnpm dev:astro
```

### Build for Production
```bash
# Build all
pnpm build

# Build specific app
pnpm build:astro
```

## Next Steps

### TODO: Implement File Saving
Currently, file uploads return file info but don't actually save files. Add:

```typescript
import { writeFile } from 'fs/promises'

// In upload handler
const filePath = `./public/uploads/${fileName}`
await writeFile(filePath, Buffer.from(bytes))
```

### TODO: Add Database
Replace mock data in `packages/trpc-api/src/router/users.ts` with actual database calls.

### TODO: Add Authentication
Add middleware for protected routes and user context.

## Notes

- **Same Domain**: Both Astro pages and API routes run on the same domain, avoiding CORS issues
- **Type Safety**: Full end-to-end type safety with tRPC
- **Monorepo**: Shared packages between Astro and Electron
- **File Handling**: Files saved to `public/uploads/` for easy serving
