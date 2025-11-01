import { Hono } from 'hono'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc/routers/_app'
import { createContext } from './trpc/context'
import { auth } from '../lib/auth'

const app = new Hono().basePath('/api')

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get('/health', (c) => c.json({ status: 'ok' }))

// ============================================================================
// BETTER AUTH ROUTES - Handle all /api/auth/* routes
// ============================================================================
app.on(['GET', 'POST'], '/auth/*', async (c) => {
  return auth.handler(c.req.raw)
})

// ============================================================================
// tRPC ENDPOINT
// ============================================================================
// tRPC endpoint - handle both GET and POST
app.on(['GET', 'POST'], '/trpc/*', async (c) => {
  return fetchRequestHandler({
    router: appRouter,
    endpoint: '/api/trpc',
    req: c.req.raw,
    createContext: () => createContext({ req: c.req.raw }),
  })
})

// ============================================================================
// FILE UPLOAD ENDPOINT
// ============================================================================
// File upload endpoint
app.post('/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name}`
    const uploadDir = './public/uploads'
    const filePath = `${uploadDir}/${fileName}`
    
    // Create directory if it doesn't exist
    const fs = await import('fs/promises')
    await fs.mkdir(uploadDir, { recursive: true })
    
    // Write file
    await fs.writeFile(filePath, buffer)
    
    return c.json({ 
      success: true,
      url: `/uploads/${fileName}`,
      size: file.size,
      type: file.type,
      name: file.name
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

// ============================================================================
// SERVE UPLOADED FILES
// ============================================================================
// Serve uploaded files
app.get('/files/*', async (c) => {
  // Redirect to the actual file in public/uploads/
  const filePath = c.req.path.replace('/api/files', '/uploads')
  return c.redirect(filePath)
})

export default app
