// apps/astro-web/src/server/trpc/routers/_app.ts
import { router } from '../trpc'
import { authRouter } from './auth'
import { userRouter } from './user'

/**
 * Main tRPC router - combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
})

/**
 * Export type for use in frontend
 */
export type AppRouter = typeof appRouter
