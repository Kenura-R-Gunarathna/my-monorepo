import { router } from '../trpc'
import { authRouter } from './auth'
import { userRouter } from './user'
import { adminRouter } from './admin/_app'
import { documentsRouter } from './documents'

/**
 * Main tRPC router - combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  admin: adminRouter,
  documents: documentsRouter,
})

/**
 * Export type for use in frontend
 */
export type AppRouter = typeof appRouter
