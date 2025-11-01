
import { z } from 'zod'

// ============================================================
// Auth Schemas
// ============================================================

export const oauthProviderSchema = z.enum(['github', 'google'])

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable()
})

export const setSessionSchema = z.object({
  sessionToken: z.string(),
  user: userSchema,
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional()
})

export const startOAuthSchema = z.object({
  provider: oauthProviderSchema
})

// ============================================================
// System Schemas
// ============================================================

export const appPathSchema = z.enum(['userData', 'temp', 'appData'])

export const openExternalSchema = z.object({
  url: z.string().url()
})

// ============================================================
// Database Schemas
// ============================================================

export const dbQuerySchema = z.object({
  table: z.string(),
  where: z.record(z.any()).optional()
})

export const dbInsertSchema = z.object({
  table: z.string(),
  data: z.record(z.any())
})

export const dbUpdateSchema = z.object({
  table: z.string(),
  where: z.record(z.any()),
  data: z.record(z.any())
})

export const dbDeleteSchema = z.object({
  table: z.string(),
  where: z.record(z.any())
})

// ============================================================
// Settings Schemas
// ============================================================

export const themeSchema = z.enum(['light', 'dark', 'system'])

export const settingsKeySchema = z.string()

export const settingsSetSchema = z.object({
  key: z.string(),
  value: z.any()
})

export const settingsUpdateSchema = z.record(z.any())

export const themeSetSchema = themeSchema

