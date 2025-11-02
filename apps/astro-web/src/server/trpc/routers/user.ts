// apps/astro-web/src/server/trpc/routers/user.ts
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { eq, count } from 'drizzle-orm'
import { user, session } from '@krag/drizzle-orm-server'
import { updateProfileSchema } from '@krag/zod-schema'

export const userRouter = router({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const userProfile = await ctx.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!userProfile[0]) {
      throw new Error('User not found')
    }

    return userProfile[0]
  }),

  /**
   * Update current user's profile
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const updateData: Record<string, string | null> = {}
      if (input.name) updateData.name = input.name
      if (input.image !== undefined) updateData.image = input.image

      await ctx.db
        .update(user)
        .set(updateData)
        .where(eq(user.id, userId))

      // Fetch updated user
      const [updatedUser] = await ctx.db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      return {
        success: true,
        user: updatedUser,
      }
    }),

  /**
   * Get user by ID (public - for viewing profiles)
   */
  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userProfile = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1)

      if (!userProfile[0]) {
        throw new Error('User not found')
      }

      return userProfile[0]
    }),

  /**
   * Check if email exists (useful for registration validation)
   */
  checkEmailExists: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const existingUser = await ctx.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1)

      return {
        exists: existingUser.length > 0,
      }
    }),

  /**
   * Get user statistics (protected)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Count active sessions
    const sessionCount = await ctx.db
      .select({ count: count() })
      .from(session)
      .where(eq(session.userId, userId))

    // Get user info
    const userInfo = await ctx.db
      .select({
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    return {
      activeSessions: sessionCount[0]?.count ?? 0,
      memberSince: userInfo[0]?.createdAt,
      emailVerified: userInfo[0]?.emailVerified ?? false,
      isActive: userInfo[0]?.isActive ?? false,
    }
  }),
})
