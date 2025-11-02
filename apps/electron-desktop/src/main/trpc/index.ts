import { initTRPC } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { EventEmitter } from 'events'
import {
  sessionManager,
  settingsManager,
  type AppSettings,
  dbConn,
  documents
} from '@krag/drizzle-orm-client'
import { getConfig } from '@krag/config/client'
import {
  setSessionSchema,
  startOAuthSchema,
  appPathSchema,
  openExternalSchema,
  dbQuerySchema,
  dbInsertSchema,
  dbUpdateSchema,
  dbDeleteSchema,
  settingsKeySchema,
  settingsSetSchema,
  settingsUpdateSchema,
  themeSetSchema,
  paginationSchema,
  documentIdSchema,
  createDocumentSchema,
  updateDocumentSchema
} from '@krag/zod-schema/trpc/electron'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'

const config = getConfig()

// Event emitter for auth callbacks
const authEmitter = new EventEmitter()

// Initialize tRPC
const t = initTRPC.create({
  isServer: true
})

// Create router
export const router = t.router
export const publicProcedure = t.procedure

// Auth router
const authRouter = router({
  startOAuth: publicProcedure.input(startOAuthSchema).mutation(async ({ input }) => {
    const { shell } = await import('electron')
    const ASTRO_BASE_URL = config.ASTRO_BASE_URL || 'http://localhost:4321'

    const callbackUrl = 'myapp://auth/callback'
    const oauthUrl = `${ASTRO_BASE_URL}/api/auth/signin/${input.provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`

    shell.openExternal(oauthUrl)

    return { success: true, provider: input.provider }
  }),

  setSession: publicProcedure.input(setSessionSchema).mutation(async ({ input }) => {
    // Store session using sessionManager
    sessionManager.set({
      token: input.sessionToken,
      user: {
        ...input.user,
        name: input.user.name || '',
        image: input.user.image || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false
      },
      roles: input.roles || [],
      permissions: input.permissions || [],
      createdAt: Date.now()
    })

    return { success: true }
  }),

  getSession: publicProcedure.query(async () => {
    return sessionManager.get()
  }),

  clearSession: publicProcedure.mutation(async () => {
    sessionManager.clear()
    return { success: true }
  }),

  onAuthCallback: publicProcedure.subscription(() => {
    return observable<{ sessionToken: string }>((emit) => {
      const handler = (data: { sessionToken: string }): void => {
        emit.next(data)
      }

      authEmitter.on('auth:callback', handler)

      return () => {
        authEmitter.off('auth:callback', handler)
      }
    })
  })
})

// System router
const systemRouter = router({
  getAppVersion: publicProcedure.query(async () => {
    const { app } = await import('electron')
    return { version: app.getVersion() }
  }),

  getAppPath: publicProcedure.input(appPathSchema).query(async ({ input }) => {
    const { app } = await import('electron')
    return { path: app.getPath(input) }
  }),

  getPlatform: publicProcedure.query(async () => {
    return { platform: process.platform }
  }),

  openExternal: publicProcedure.input(openExternalSchema).mutation(async ({ input }) => {
    const { shell } = await import('electron')
    await shell.openExternal(input.url)
    return { success: true }
  })
})

// Database router
const dbRouter = router({
  query: publicProcedure.input(dbQuerySchema).query(async (/*{ input }*/) => {
    // TODO: Implement database query using drizzle
    return { data: [] }
  }),

  insert: publicProcedure.input(dbInsertSchema).mutation(async (/*{ input }*/) => {
    // TODO: Implement database insert using drizzle
    return { success: true }
  }),

  update: publicProcedure.input(dbUpdateSchema).mutation(async (/*{ input }*/) => {
    // TODO: Implement database update using drizzle
    return { success: true }
  }),

  delete: publicProcedure.input(dbDeleteSchema).mutation(async (/*{ input }*/) => {
    // TODO: Implement database delete using drizzle
    return { success: true }
  })
})

// Settings router
const settingsRouter = router({
  get: publicProcedure.input(settingsKeySchema).query(async ({ input }) => {
    return settingsManager.get(input as keyof AppSettings)
  }),

  set: publicProcedure.input(settingsSetSchema).mutation(async ({ input }) => {
    settingsManager.set(input.key as keyof AppSettings, input.value)
    return { success: true }
  }),

  getAll: publicProcedure.query(async () => {
    return settingsManager.getAll()
  }),

  update: publicProcedure.input(settingsUpdateSchema).mutation(async ({ input }) => {
    settingsManager.update(input)
    return { success: true }
  }),

  theme: router({
    get: publicProcedure.query(async () => settingsManager.theme.get()),
    set: publicProcedure.input(themeSetSchema).mutation(async ({ input }) => {
      settingsManager.theme.set(input)
      return { success: true }
    })
  })
})

// Store router (electron-store management)
const storeRouter = router({
  getSession: publicProcedure.query(async () => {
    return sessionManager.get()
  }),

  getAll: publicProcedure.query(async () => {
    return settingsManager.getAll()
  })
})

// Documents router
const documentsRouter = router({
  /**
   * Get paginated list of documents
   */
  list: publicProcedure.input(paginationSchema).query(async ({ input }) => {
    const { page, pageSize, sortBy, sortOrder, search, status, type } = input
    const offset = (page - 1) * pageSize

    // Build where conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(
          like(documents.header, `%${search}%`), like(documents.reviewer, `%${search}%`)
        )
      )
    }

    if (status) {
      conditions.push(eq(documents.status, status))
    }

    if (type) {
      conditions.push(eq(documents.type, type))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count
    const [{ total }] = await dbConn.select({ total: count() }).from(documents).where(whereClause)

    // Get paginated data
    const orderByColumn =
      sortBy === 'header'
        ? documents.header
        : sortBy === 'type'
          ? documents.type
          : sortBy === 'status'
            ? documents.status
            : sortBy === 'target'
              ? documents.target
              : sortBy === 'limit'
                ? documents.limit
                : sortBy === 'reviewer'
                  ? documents.reviewer
                  : documents.createdAt

    const data = await dbConn
      .select()
      .from(documents)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn))
      .limit(pageSize)
      .offset(offset)

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }),

  /**
   * Get document by ID
   */
  getById: publicProcedure.input(documentIdSchema).query(async ({ input }) => {
    const [document] = await dbConn
      .select()
      .from(documents)
      .where(eq(documents.id, input.id))
      .limit(1)

    if (!document) {
      throw new Error('Document not found')
    }

    return document
  }),

  /**
   * Create new document
   */
  create: publicProcedure.input(createDocumentSchema).mutation(async ({ input }) => {
    const [newDocument] = await dbConn
      .insert(documents)
      .values(input)
      .returning({ id: documents.id })

    return { id: newDocument.id, success: true }
  }),

  /**
   * Update document
   */
  update: publicProcedure.input(updateDocumentSchema).mutation(async ({ input }) => {
    const { id, ...data } = input

    await dbConn.update(documents).set(data).where(eq(documents.id, id))

    return { success: true }
  }),

  /**
   * Delete document
   */
  delete: publicProcedure.input(documentIdSchema).mutation(async ({ input }) => {
    await dbConn.delete(documents).where(eq(documents.id, input.id))

    return { success: true }
  }),

  /**
   * Get unique statuses for filtering
   */
  getStatuses: publicProcedure.query(async () => {
    const result = await dbConn
      .select({ status: documents.status })
      .from(documents)
      .groupBy(documents.status)
      .orderBy(asc(documents.status))

    return result.map((r) => r.status)
  }),

  /**
   * Get unique types for filtering
   */
  getTypes: publicProcedure.query(async () => {
    const result = await dbConn
      .select({ type: documents.type })
      .from(documents)
      .groupBy(documents.type)
      .orderBy(asc(documents.type))

    return result.map((r) => r.type)
  })
})

// Main app router
export const appRouter = router({
  auth: authRouter,
  system: systemRouter,
  db: dbRouter,
  settings: settingsRouter,
  store: storeRouter,
  documents: documentsRouter
})

export type AppRouter = typeof appRouter

// Export auth emitter for deep link handling
export { authEmitter }
