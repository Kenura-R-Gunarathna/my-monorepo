import { router } from '../trpc'
import { authRouter } from './auth'
import { userRouter } from './user'
import { adminRouter } from './admin/_app'
import { documentsRouter } from './documents'
import { usersRouter } from './users'
import { rolesRouter } from './roles'
import { permissionsRouter } from './permissions'
import { settingsRouter } from './settings'

/**
 * Main tRPC router - combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  admin: adminRouter,
  documents: documentsRouter,
  users: usersRouter,
  roles: rolesRouter,
  permissions: permissionsRouter,
  settings: settingsRouter,
})

/**
 * Export type for use in frontend
 */
export type AppRouter = typeof appRouter
