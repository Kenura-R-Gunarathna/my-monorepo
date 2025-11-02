import { router, publicProcedure } from '../trpc'
import { 
  rolesPaginationSchema, 
  idSchema, 
  createRoleSchema, 
  updateRoleSchema 
} from '@krag/zod-schema'
import { roles } from '@krag/drizzle-orm-server'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'

export const rolesRouter = router({
  /**
   * Get paginated list of roles
   * Supports filtering, sorting, and search
   */
  list: publicProcedure
    .input(rolesPaginationSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, search, isActive } = input
      const offset = (page - 1) * pageSize

      // Build where conditions
      const conditions = []
      
      if (search) {
        conditions.push(
          or(
            like(roles.name, `%${search}%`),
            like(roles.description, `%${search}%`)
          )
        )
      }
      
      if (isActive !== undefined) {
        conditions.push(eq(roles.isActive, isActive))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const [{ total }] = await ctx.db
        .select({ total: count() })
        .from(roles)
        .where(whereClause)

      // Get paginated data
      const orderByColumn = sortBy === 'name' ? roles.name :
                           sortBy === 'isActive' ? roles.isActive :
                           roles.createdAt

      const data = await ctx.db
        .select()
        .from(roles)
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
   * Get role by ID
   */
  getById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const [role] = await ctx.db
        .select()
        .from(roles)
        .where(eq(roles.id, input.id))
        .limit(1)

      if (!role) {
        throw new Error('Role not found')
      }

      return role
    }),

  /**
   * Create new role
   */
  create: publicProcedure
    .input(createRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const [newRole] = await ctx.db
        .insert(roles)
        .values(input)
        .$returningId()

      return { id: newRole.id, success: true }
    }),

  /**
   * Update role
   */
  update: publicProcedure
    .input(updateRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Check if it's a system role
      const [existingRole] = await ctx.db
        .select()
        .from(roles)
        .where(eq(roles.id, id))
        .limit(1)

      if (existingRole?.isSystemRole && data.isSystemRole === false) {
        throw new Error('Cannot modify system role status')
      }

      await ctx.db
        .update(roles)
        .set(data)
        .where(eq(roles.id, id))

      return { success: true }
    }),

  /**
   * Delete role
   */
  delete: publicProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if it's a system role
      const [role] = await ctx.db
        .select()
        .from(roles)
        .where(eq(roles.id, input.id))
        .limit(1)

      if (role?.isSystemRole) {
        throw new Error('Cannot delete system role')
      }

      await ctx.db
        .delete(roles)
        .where(eq(roles.id, input.id))

      return { success: true }
    }),

  /**
   * Get all active roles for dropdown
   */
  getActive: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(roles)
      .where(eq(roles.isActive, true))
      .orderBy(asc(roles.name))

    return result
  })
})
