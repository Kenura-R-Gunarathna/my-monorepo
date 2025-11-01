import { router } from '../trpc'
import { authRouter } from './auth'
import { userRouter } from './user'
import { adminRouter } from './admin/_app'

/**
 * Main tRPC router - combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  admin: adminRouter,
})

/**
 * Export type for use in frontend
 */
export type AppRouter = typeof appRouter
