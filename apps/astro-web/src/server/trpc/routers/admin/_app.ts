// apps/astro-web/src/server/trpc/routers/admin/_app.ts
import { router } from '../../trpc'
import { permissionsRouter } from './permissions'

/**
 * Admin router - combines all admin sub-routers
 * All procedures require admin-level authentication
 */
export const adminRouter = router({
  permissions: permissionsRouter,
  // Add more admin routers here:
  // roles: rolesRouter,
  // users: usersRouter,
  // analytics: analyticsRouter,
})
