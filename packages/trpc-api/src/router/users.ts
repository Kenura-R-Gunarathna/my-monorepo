// packages/trpc-api/src/router/users.ts
import { router, publicProcedure } from '../trpc'
import { userSchema, createUserInput } from '@krag/zod-schema'
import { z } from 'zod'

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(userSchema)
    .query(async ({ input }) => {
      // TODO: Replace with actual DB call
      return {
        id: input.id,
        name: 'John Doe',
        email: 'john@example.com'
      }
    }),

  create: publicProcedure
    .input(createUserInput)
    .mutation(async ({ input }) => {
      // TODO: Replace with actual DB call
      return { success: true, id: '123' }
    }),

  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0)
    }))
    .output(z.array(userSchema))
    .query(async ({ input }) => {
      // TODO: Replace with actual DB call
      return []
    })
})