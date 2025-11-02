import { z } from 'zod'

// Re-export z for convenience
export { z }

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

// Generic ID schema for delete/getById operations
export const idSchema = z.object({
  id: z.number().int()
})

// ============================================================
// Users Schemas (from auth table)
// ============================================================

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  roleId: z.number().nullable(),
  isActive: z.boolean(),
  phoneNumber: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable()
})

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  roleId: z.number().optional(),
  isActive: z.boolean().default(true),
  phoneNumber: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional()
})

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string()
})

export const userIdSchema = z.object({
  id: z.string()
})

export const usersPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'email', 'createdAt', 'roleId', 'isActive']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  roleId: z.number().optional(),
})

// ============================================================
// Roles Schemas
// ============================================================

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  isSystemRole: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string())
})

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isSystemRole: z.boolean().default(false)
})

export const updateRoleSchema = createRoleSchema.partial().extend({
  id: z.number().int()
})

export const rolesPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'createdAt', 'isActive']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
})

// ============================================================
// Permissions Schemas
// ============================================================

export const permissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  resource: z.string(),
  action: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  conditions: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string())
})

export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  resource: z.string().min(1, 'Resource is required').max(50),
  action: z.string().min(1, 'Action is required').max(50),
  description: z.string().optional(),
  category: z.string().max(50).optional(),
  conditions: z.string().optional(),
  isActive: z.boolean().default(true)
})

export const updatePermissionSchema = createPermissionSchema.partial().extend({
  id: z.number().int()
})

export const permissionsPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'resource', 'action', 'category', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
})

// ============================================================
// Settings Schemas
// ============================================================

export const settingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.any(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string())
})

export const createSettingSchema = z.object({
  key: z.string().min(1, 'Key is required').max(255),
  value: z.any(), // Required - must provide a value
  category: z.string().max(100).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false)
})

export const updateSettingSchema = createSettingSchema.partial().extend({
  id: z.number().int()
})

export const settingsPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['key', 'category', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
})

// ============================================================
// Type exports
// ============================================================

// Rename User to UserData to avoid conflict with better-auth User type
export type UserData = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

export type Role = z.infer<typeof roleSchema>
export type CreateRole = z.infer<typeof createRoleSchema>
export type UpdateRole = z.infer<typeof updateRoleSchema>

export type Permission = z.infer<typeof permissionSchema>
export type CreatePermission = z.infer<typeof createPermissionSchema>
export type UpdatePermission = z.infer<typeof updatePermissionSchema>

export type Setting = z.infer<typeof settingSchema>
export type CreateSetting = z.infer<typeof createSettingSchema>
export type UpdateSetting = z.infer<typeof updateSettingSchema>
