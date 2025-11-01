import { z } from 'zod'
// Import types from better-auth - they already provide proper schemas
import type { User, Session, Account, Verification } from 'better-auth/types'

// ============================================================
// Re-export Better Auth Types
// Use better-auth's official types as the base
// ============================================================

export type { User, Session, Account, Verification } from 'better-auth/types'

// ============================================================
// Extended User Types
// Only extend what we need for our app-specific features
// ============================================================

/**
 * Extended User with role and permissions
 * Used for session management with CASL permissions
 */
export interface ExtendedUser extends User {
  roleId?: number
  roleName?: string
  permissions?: string[]
}

/**
 * Active Session - combines User + Session
 * This is the standard format returned by better-auth session queries
 */
export interface ActiveSession {
  user: User
  session: Session
}

/**
 * Extended Active Session with role data
 * Used when we need role/permission info in the session
 */
export interface ExtendedActiveSession {
  user: ExtendedUser
  session: Session
}

/**
 * User Session Data for Electron store persistence
 * Used by database-electron package for local storage
 */
export interface UserSessionData {
  token: string
  user: ExtendedUser
  roles: string[]
  permissions: string[]
  createdAt: number
}

// ============================================================
// Zod Schemas for Runtime Validation
// Only create schemas where we need runtime validation
// ============================================================

/**
 * Schema for extended user (when storing with role data)
 */
export const extendedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Extended fields
  roleId: z.number().optional(),
  roleName: z.string().optional(),
  permissions: z.array(z.string()).optional()
})

/**
 * Schema for UserSessionData validation
 */
export const userSessionDataSchema = z.object({
  token: z.string(),
  user: extendedUserSchema,
  roles: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
  createdAt: z.number().default(() => Date.now())
})

/**
 * Schema for ActiveSession validation
 */
export const activeSessionSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  session: z.object({
    id: z.string(),
    userId: z.string(),
    expiresAt: z.date(),
    token: z.string(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
})

// ============================================================
// Auth Form Schemas
// For form validation in sign-in, sign-up, etc.
// ============================================================

/**
 * Sign In Schema
 */
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

/**
 * Sign Up Schema
 */
export const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  image: z.string().optional()
})

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  image: z.string().optional()
})

/**
 * Password Reset Schema
 */
export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

/**
 * Change Password Schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

// ============================================================
// Type Exports for Form Schemas
// ============================================================

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

