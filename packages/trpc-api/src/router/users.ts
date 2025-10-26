// packages/trpc-api/src/router/users.ts
import { router, publicProcedure } from '../trpc'
import { protectedProcedure, requirePermission, requireAbility } from '../middleware/permissions'
import { userSchema, createUserInput } from '@krag/zod-schema'
import { z } from 'zod'

export const userRouter = router({
  // Public endpoint - no permissions needed
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

  // Protected with specific permission
  create: protectedProcedure
    .use(requirePermission('users.create'))
    .input(createUserInput)
    .mutation(async ({ input }) => {
      // User has users.create permission
      // TODO: Replace with actual DB call
      return { success: true, id: '123' }
    }),

  // Protected with CASL ability check
  update: protectedProcedure
    .use(requireAbility('update', 'User'))
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Additional conditional check possible here
      // @ts-expect-error - ctx type will be extended by app
      const canUpdate = ctx.ability.can('update', 'User');
      
      if (!canUpdate) {
        throw new Error('Cannot update this user');
      }

      // TODO: Replace with actual DB call
      return { success: true }
    }),

  // Protected - requires users.read permission
  list: protectedProcedure
    .use(requirePermission('users.read'))
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0)
    }))
    .output(z.array(userSchema))
    .query(async ({ input }) => {
      // TODO: Replace with actual DB call
      return []
    }),

  // Get current user's permissions
  myPermissions: protectedProcedure
    .query(async ({ ctx }) => {
      // @ts-expect-error - ctx type will be extended by app
      return ctx.permissions;
    }),

  // Delete user - requires manage permission
  delete: protectedProcedure
    .use(requirePermission('users.delete'))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Replace with actual DB call
      return { success: true }
    })
})