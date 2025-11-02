import { initTRPC, TRPCError } from '@trpc/server'
import type { TRPCContext } from './context'
import superjson from 'superjson'
import type { Session } from 'better-auth/types'

/**
 * Initialize tRPC with context type
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

/**
 * Export router, procedures, and middleware
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected context with guaranteed session
 */
type ProtectedContext = TRPCContext & {
  session: Session
}

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure: ReturnType<typeof t.procedure.use<ProtectedContext>> = t.procedure.use<ProtectedContext>(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource' 
    })
  }
  
  return next({
    ctx: {
      ...ctx,
      // session is now guaranteed to be non-null
      session: ctx.session,
    },
  })
})

/**
 * Middleware for additional logging (optional)
 */
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start
  
  console.log(`[tRPC] ${type} ${path} - ${durationMs}ms`)
  
  return result
})
