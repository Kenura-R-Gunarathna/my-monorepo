import { router, publicProcedure } from '../trpc'

export const authRouter = router({
  /**
   * Get current session
   * Note: Better Auth handles actual authentication
   * This just exposes session via tRPC for convenience
   */
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session || null
  }),
})
