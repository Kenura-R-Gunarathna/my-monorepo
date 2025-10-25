// apps/astro-web/src/server/index.ts
import { Hono } from 'hono'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@krag/trpc-api'

const app = new Hono().basePath('/api')

// Middleware
app.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// tRPC endpoint - handle both GET and POST
app.on(['GET', 'POST'], '/trpc/*', async (c) => {
  return fetchRequestHandler({
    router: appRouter,
    endpoint: '/api/trpc',
    req: c.req.raw,
    createContext: async () => {
      return {}
    },
  })
})

// File upload endpoint
app.post('/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }

  try {
    // Save file to public/uploads/
    const bytes = await file.arrayBuffer()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `./public/uploads/${fileName}`
    
    // In a real app, you'd use fs to write the file
    // For now, we'll just return the file info
    // TODO: Implement actual file saving with fs/promises
    
    return c.json({ 
      success: true,
      url: `/uploads/${fileName}`,
      size: file.size,
      type: file.type,
      name: file.name
    })
  } catch (error) {
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

// Serve uploaded files
app.get('/files/*', async (c) => {
  // Redirect to the actual file in public/uploads/
  const filePath = c.req.path.replace('/api/files', '/uploads')
  return c.redirect(filePath)
})

export default app
