// packages/trpc-api/src/router/index.ts
import { router, publicProcedure } from '@/packages/trpc-api/trpc'
import { userRouter } from '@/packages/trpc-api/router/users'
// import { postRouter } from './posts'

export const appRouter = router({
  user: userRouter,
  // post: postRouter,
})

export type AppRouter = typeof appRouter
