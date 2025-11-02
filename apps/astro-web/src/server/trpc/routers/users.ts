import { router, publicProcedure } from '../trpc'
import { 
  usersPaginationSchema, 
  userIdSchema, 
  createUserSchema, 
  updateUserSchema 
} from '@krag/zod-schema'
import { user } from '@krag/drizzle-orm-server'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'

export const usersRouter = router({
  /**
   * Get paginated list of users
   * Supports filtering, sorting, and search
   */
  list: publicProcedure
    .input(usersPaginationSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, search, isActive, roleId } = input
      const offset = (page - 1) * pageSize

      // Build where conditions
      const conditions = []
      
      if (search) {
        conditions.push(
          or(
            like(user.name, `%${search}%`),
            like(user.email, `%${search}%`),
            like(user.firstName, `%${search}%`),
            like(user.lastName, `%${search}%`)
          )
        )
      }
      
      if (isActive !== undefined) {
        conditions.push(eq(user.isActive, isActive))
      }
      
      if (roleId !== undefined) {
        conditions.push(eq(user.roleId, roleId))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const [{ total }] = await ctx.db
        .select({ total: count() })
        .from(user)
        .where(whereClause)

      // Get paginated data
      const orderByColumn = sortBy === 'name' ? user.name :
                           sortBy === 'email' ? user.email :
                           sortBy === 'roleId' ? user.roleId :
                           sortBy === 'isActive' ? user.isActive :
                           user.createdAt

      const data = await ctx.db
        .select()
        .from(user)
        .where(whereClause)
        .orderBy(sortOrder === 'desc' ? desc(orderByColumn) : asc(orderByColumn))
        .limit(pageSize)
        .offset(offset)

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    }),

  /**
   * Get user by ID
   */
  getById: publicProcedure
    .input(userIdSchema)
    .query(async ({ ctx, input }) => {
      const [userData] = await ctx.db
        .select()
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1)

      if (!userData) {
        throw new Error('User not found')
      }

      return userData
    }),

  /**
   * Create new user
   */
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = crypto.randomUUID()
      await ctx.db
        .insert(user)
        .values({
          ...input,
          id: userId,
          emailVerified: false,
        })

      return { id: userId, success: true }
    }),

  /**
   * Update user
   */
  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      await ctx.db
        .update(user)
        .set(data)
        .where(eq(user.id, id))

      return { success: true }
    }),

  /**
   * Delete user
   */
  delete: publicProcedure
    .input(userIdSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(user)
        .where(eq(user.id, input.id))

      return { success: true }
    }),

  /**
   * Get unique role IDs for filtering
   */
  getRoleIds: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ roleId: user.roleId })
      .from(user)
      .where(eq(user.roleId, user.roleId)) // Filter out nulls
      .orderBy(asc(user.roleId))

    return result.map(r => r.roleId).filter(Boolean)
  })
})
