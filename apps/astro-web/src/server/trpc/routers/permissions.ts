import { router, publicProcedure } from '../trpc'
import { 
  permissionsPaginationSchema, 
  idSchema, 
  createPermissionSchema, 
  updatePermissionSchema 
} from '@krag/zod-schema'
import { permissions } from '@krag/drizzle-orm-server'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'

export const permissionsRouter = router({
  /**
   * Get paginated list of permissions
   * Supports filtering, sorting, and search
   */
  list: publicProcedure
    .input(permissionsPaginationSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, search, resource, action, category, isActive } = input
      const offset = (page - 1) * pageSize

      // Build where conditions
      const conditions = []
      
      if (search) {
        conditions.push(
          or(
            like(permissions.name, `%${search}%`),
            like(permissions.description, `%${search}%`),
            like(permissions.resource, `%${search}%`)
          )
        )
      }
      
      if (resource) {
        conditions.push(eq(permissions.resource, resource))
      }
      
      if (action) {
        conditions.push(eq(permissions.action, action))
      }
      
      if (category) {
        conditions.push(eq(permissions.category, category))
      }
      
      if (isActive !== undefined) {
        conditions.push(eq(permissions.isActive, isActive))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const [{ total }] = await ctx.db
        .select({ total: count() })
        .from(permissions)
        .where(whereClause)

      // Get paginated data
      const orderByColumn = sortBy === 'name' ? permissions.name :
                           sortBy === 'resource' ? permissions.resource :
                           sortBy === 'action' ? permissions.action :
                           sortBy === 'category' ? permissions.category :
                           permissions.createdAt

      const data = await ctx.db
        .select()
        .from(permissions)
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
   * Get permission by ID
   */
  getById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const [permission] = await ctx.db
        .select()
        .from(permissions)
        .where(eq(permissions.id, input.id))
        .limit(1)

      if (!permission) {
        throw new Error('Permission not found')
      }

      return permission
    }),

  /**
   * Create new permission
   */
  create: publicProcedure
    .input(createPermissionSchema)
    .mutation(async ({ ctx, input }) => {
      const [newPermission] = await ctx.db
        .insert(permissions)
        .values(input)
        .$returningId()

      return { id: newPermission.id, success: true }
    }),

  /**
   * Update permission
   */
  update: publicProcedure
    .input(updatePermissionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      await ctx.db
        .update(permissions)
        .set(data)
        .where(eq(permissions.id, id))

      return { success: true }
    }),

  /**
   * Delete permission
   */
  delete: publicProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(permissions)
        .where(eq(permissions.id, input.id))

      return { success: true }
    }),

  /**
   * Get unique resources for filtering
   */
  getResources: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ resource: permissions.resource })
      .from(permissions)
      .orderBy(asc(permissions.resource))

    return result.map(r => r.resource)
  }),

  /**
   * Get unique actions for filtering
   */
  getActions: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ action: permissions.action })
      .from(permissions)
      .orderBy(asc(permissions.action))

    return result.map(r => r.action)
  }),

  /**
   * Get unique categories for filtering
   */
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ category: permissions.category })
      .from(permissions)
      .where(eq(permissions.category, permissions.category)) // Filter out nulls
      .orderBy(asc(permissions.category))

    return result.map(r => r.category).filter(Boolean)
  })
})
