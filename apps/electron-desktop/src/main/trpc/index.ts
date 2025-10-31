import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';
import { sessionManager, settingsManager, cacheManager } from '@krag/database-electron';

// Event emitter for auth callbacks
const authEmitter = new EventEmitter();

// Initialize tRPC
const t = initTRPC.create({
  isServer: true,
});

// Create router
export const router = t.router;
export const publicProcedure = t.procedure;

// Auth router
const authRouter = router({
  startOAuth: publicProcedure
    .input(z.object({
      provider: z.enum(['github', 'google']),
    }))
    .mutation(async ({ input }) => {
      const { shell } = await import('electron');
      const ASTRO_BASE_URL = process.env.ASTRO_BASE_URL || 'http://localhost:4321';
      
      const callbackUrl = 'myapp://auth/callback';
      const oauthUrl = `${ASTRO_BASE_URL}/api/auth/signin/${input.provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      
      shell.openExternal(oauthUrl);
      
      return { success: true, provider: input.provider };
    }),

  setSession: publicProcedure
    .input(z.object({
      sessionToken: z.string(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string().nullable(),
        image: z.string().nullable(),
      }),
      roles: z.array(z.string()).optional(),
      permissions: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      // Store session using sessionManager
      sessionManager.set({
        token: input.sessionToken,
        user: input.user as any,
        roles: input.roles || [],
        permissions: input.permissions || [],
        createdAt: Date.now(),
      });

      return { success: true };
    }),

  getSession: publicProcedure
    .query(async () => {
      return sessionManager.get();
    }),

  clearSession: publicProcedure
    .mutation(async () => {
      sessionManager.clear();
      return { success: true };
    }),

  onAuthCallback: publicProcedure
    .subscription(() => {
      return observable<{ sessionToken: string }>((emit) => {
        const handler = (data: { sessionToken: string }) => {
          emit.next(data);
        };

        authEmitter.on('auth:callback', handler);

        return () => {
          authEmitter.off('auth:callback', handler);
        };
      });
    }),
});

// System router
const systemRouter = router({
  getAppVersion: publicProcedure
    .query(async () => {
      const { app } = await import('electron');
      return { version: app.getVersion() };
    }),

  getAppPath: publicProcedure
    .input(z.enum(['userData', 'temp', 'appData']))
    .query(async ({ input }) => {
      const { app } = await import('electron');
      return { path: app.getPath(input) };
    }),

  getPlatform: publicProcedure
    .query(async () => {
      return { platform: process.platform };
    }),

  openExternal: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      const { shell } = await import('electron');
      await shell.openExternal(input.url);
      return { success: true };
    }),
});

// Database router
const dbRouter = router({
  query: publicProcedure
    .input(z.object({
      table: z.string(),
      where: z.record(z.any()).optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Implement database query using drizzle
      return { data: [] };
    }),

  insert: publicProcedure
    .input(z.object({
      table: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement database insert using drizzle
      return { success: true };
    }),

  update: publicProcedure
    .input(z.object({
      table: z.string(),
      where: z.record(z.any()),
      data: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement database update using drizzle
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({
      table: z.string(),
      where: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement database delete using drizzle
      return { success: true };
    }),
});

// Settings router
const settingsRouter = router({
  get: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return settingsManager.get(input as any);
    }),

  set: publicProcedure
    .input(z.object({
      key: z.string(),
      value: z.any(),
    }))
    .mutation(async ({ input }) => {
      settingsManager.set(input.key as any, input.value);
      return { success: true };
    }),

  getAll: publicProcedure
    .query(async () => {
      return settingsManager.getAll();
    }),

  update: publicProcedure
    .input(z.record(z.any()))
    .mutation(async ({ input }) => {
      settingsManager.update(input);
      return { success: true };
    }),

  theme: router({
    get: publicProcedure.query(async () => settingsManager.theme.get()),
    set: publicProcedure
      .input(z.enum(['light', 'dark', 'system']))
      .mutation(async ({ input }) => {
        settingsManager.theme.set(input);
        return { success: true };
      }),
  }),
});

// Store router (electron-store management)
const storeRouter = router({
  getSession: publicProcedure
    .query(async () => {
      return sessionManager.get();
    }),

  getAll: publicProcedure
    .query(async () => {
      return settingsManager.getAll();
    }),
});

// Main app router
export const appRouter = router({
  auth: authRouter,
  system: systemRouter,
  db: dbRouter,
  settings: settingsRouter,
  store: storeRouter,
});

export type AppRouter = typeof appRouter;

// Export auth emitter for deep link handling
export { authEmitter };
