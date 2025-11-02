import { router, publicProcedure } from '../trpc'
import { 
  settingsPaginationSchema, 
  idSchema, 
  createSettingSchema, 
  updateSettingSchema 
} from '@krag/zod-schema'
import { z } from 'zod'
import { settings } from '@krag/drizzle-orm-server'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'

// Keep settingKeySchema as it's unique to settings
const settingKeySchema = z.object({
  key: z.string(),
})

export const settingsRouter = router({
  /**
   * Get paginated list of settings
   * Supports filtering, sorting, and search
   */
  list: publicProcedure
    .input(settingsPaginationSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, search, category, isPublic } = input
      const offset = (page - 1) * pageSize

      // Build where conditions
      const conditions = []
      
      if (search) {
        conditions.push(
          or(
            like(settings.key, `%${search}%`),
            like(settings.description, `%${search}%`),
            like(settings.category, `%${search}%`)
          )
        )
      }
      
      if (category) {
        conditions.push(eq(settings.category, category))
      }
      
      if (isPublic !== undefined) {
        conditions.push(eq(settings.isPublic, isPublic))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const [{ total }] = await ctx.db
        .select({ total: count() })
        .from(settings)
        .where(whereClause)

      // Get paginated data
      const orderByColumn = sortBy === 'key' ? settings.key :
                           sortBy === 'category' ? settings.category :
                           settings.createdAt

      const data = await ctx.db
        .select()
        .from(settings)
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
   * Get setting by ID
   */
  getById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const [setting] = await ctx.db
        .select()
        .from(settings)
        .where(eq(settings.id, input.id))
        .limit(1)

      if (!setting) {
        throw new Error('Setting not found')
      }

      return setting
    }),

  /**
   * Get setting by key
   */
  getByKey: publicProcedure
    .input(settingKeySchema)
    .query(async ({ ctx, input }) => {
      const [setting] = await ctx.db
        .select()
        .from(settings)
        .where(eq(settings.key, input.key))
        .limit(1)

      if (!setting) {
        throw new Error('Setting not found')
      }

      return setting
    }),

  /**
   * Get all public settings (for frontend)
   */
  getPublic: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(settings)
      .where(eq(settings.isPublic, true))
      .orderBy(asc(settings.key))

    // Convert to key-value map
    return result.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)
  }),

  /**
   * Create new setting
   */
  create: publicProcedure
    .input(createSettingSchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure value is present
      const data = {
        ...input,
        value: input.value ?? null, // Convert undefined to null if needed
      }
      
      const [newSetting] = await ctx.db
        .insert(settings)
        .values(data)
        .$returningId()

      return { id: newSetting.id, success: true }
    }),

  /**
   * Update setting
   */
  update: publicProcedure
    .input(updateSettingSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      await ctx.db
        .update(settings)
        .set(data)
        .where(eq(settings.id, id))

      return { success: true }
    }),

  /**
   * Update setting by key (convenience method)
   */
  updateByKey: publicProcedure
    .input(z.object({
      key: z.string(),
      value: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(settings)
        .set({ value: input.value })
        .where(eq(settings.key, input.key))

      return { success: true }
    }),

  /**
   * Delete setting
   */
  delete: publicProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(settings)
        .where(eq(settings.id, input.id))

      return { success: true }
    }),

  /**
   * Get unique categories for filtering
   */
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ category: settings.category })
      .from(settings)
      .where(eq(settings.category, settings.category)) // Filter out nulls
      .orderBy(asc(settings.category))

    return result.map(r => r.category).filter(Boolean)
  })
})
