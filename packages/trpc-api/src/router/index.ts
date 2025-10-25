// packages/trpc-api/src/router/index.ts
import { router, publicProcedure } from '../trpc'
import { userRouter } from './users'
// import { postRouter } from './posts'

export const appRouter = router({
  user: userRouter,
  // post: postRouter,
})

export type AppRouter = typeof appRouter
