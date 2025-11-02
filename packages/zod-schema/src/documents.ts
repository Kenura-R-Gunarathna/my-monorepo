import { z } from 'zod'

// Document schemas
export const documentSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.number(),
  limit: z.number(),
  reviewer: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string())
})

export const createDocumentSchema = z.object({
  header: z.string().min(1, 'Header is required'),
  type: z.string().min(1, 'Type is required'),
  status: z.string().min(1, 'Status is required'),
  target: z.number().int().min(0),
  limit: z.number().int().min(0),
  reviewer: z.string().min(1, 'Reviewer is required')
})

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: z.number().int()
})

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional()
})

export const documentIdSchema = z.object({
  id: z.number().int()
})

export const paginatedResponseSchema = z.object({
  data: z.array(documentSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
})

export type Document = z.infer<typeof documentSchema>
export type CreateDocument = z.infer<typeof createDocumentSchema>
export type UpdateDocument = z.infer<typeof updateDocumentSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>
