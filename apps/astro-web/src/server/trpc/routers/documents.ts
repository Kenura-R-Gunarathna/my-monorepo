import { router, publicProcedure } from '../trpc'
import { 
  paginationSchema, 
  documentIdSchema, 
  createDocumentSchema, 
  updateDocumentSchema 
} from '@krag/zod-schema'
import { documents } from '@krag/drizzle-orm-server'
import { eq, desc, asc, count, like, and, or } from 'drizzle-orm'

export const documentsRouter = router({
  /**
   * Get paginated list of documents
   * Supports filtering, sorting, and search
   */
  list: publicProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, sortBy, sortOrder, search, status, type } = input
      const offset = (page - 1) * pageSize

      // Build where conditions
      const conditions = []
      
      if (search) {
        conditions.push(
          or(
            like(documents.header, `%${search}%`),
            like(documents.reviewer, `%${search}%`)
          )
        )
      }
      
      if (status) {
        conditions.push(eq(documents.status, status))
      }
      
      if (type) {
        conditions.push(eq(documents.type, type))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count
      const [{ total }] = await ctx.db
        .select({ total: count() })
        .from(documents)
        .where(whereClause)

      // Get paginated data
      const orderByColumn = sortBy === 'header' ? documents.header :
                           sortBy === 'type' ? documents.type :
                           sortBy === 'status' ? documents.status :
                           sortBy === 'target' ? documents.target :
                           sortBy === 'limit' ? documents.limit :
                           sortBy === 'reviewer' ? documents.reviewer :
                           documents.createdAt

      const data = await ctx.db
        .select()
        .from(documents)
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
   * Get document by ID
   */
  getById: publicProcedure
    .input(documentIdSchema)
    .query(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id))
        .limit(1)

      if (!document) {
        throw new Error('Document not found')
      }

      return document
    }),

  /**
   * Create new document
   */
  create: publicProcedure
    .input(createDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const [newDocument] = await ctx.db
        .insert(documents)
        .values(input)
        .$returningId()

      return { id: newDocument.id, success: true }
    }),

  /**
   * Update document
   */
  update: publicProcedure
    .input(updateDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      await ctx.db
        .update(documents)
        .set(data)
        .where(eq(documents.id, id))

      return { success: true }
    }),

  /**
   * Delete document
   */
  delete: publicProcedure
    .input(documentIdSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(documents)
        .where(eq(documents.id, input.id))

      return { success: true }
    }),

  /**
   * Get unique statuses for filtering
   */
  getStatuses: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ status: documents.status })
      .from(documents)
      .orderBy(asc(documents.status))

    return result.map(r => r.status)
  }),

  /**
   * Get unique types for filtering
   */
  getTypes: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ type: documents.type })
      .from(documents)
      .orderBy(asc(documents.type))

    return result.map(r => r.type)
  })
})
