import { initTRPC } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { EventEmitter } from 'events'
import { sessionManager, settingsManager, type AppSettings } from '@krag/drizzle-orm-client'
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
  themeSetSchema
} from '@krag/zod-schema/trpc/electron'

// Import the new smart routers
import { documentsRouter } from './routers/documents'
import { usersRouter } from './routers/users'
import { rolesRouter } from './routers/roles'
import { permissionsRouter } from './routers/permissions'
import { settingsRouter as smartSettingsRouter } from './routers/settings'
import { syncRouter } from './routers/sync'

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

// Main app router
export const appRouter = router({
  auth: authRouter,
  system: systemRouter,
  db: dbRouter,
  settings: settingsRouter,
  store: storeRouter,
  // Smart offline-first routers with background sync
  documents: documentsRouter,
  users: usersRouter,
  roles: rolesRouter,
  permissions: permissionsRouter,
  smartSettings: smartSettingsRouter,
  // Electron-only sync router
  sync: syncRouter
})

export type AppRouter = typeof appRouter

// Export auth emitter for deep link handling
export { authEmitter }
