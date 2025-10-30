// apps/astro-web/src/server/trpc/routers/admin/permissions.ts
import { router, protectedProcedure } from '../../trpc'
import { z } from 'zod'
import { eq, and, like, desc, asc } from 'drizzle-orm'
import { permissions, roles, rolePermissions, userPermissions } from '@krag/database-web'
import { 
  getUserPermissions, 
  userHasPermission, 
  userCan,
  getUserPermissionsByCategory 
} from '../../../utils/permissions'

/**
 * Admin permissions router - requires admin access
 * Manages permissions, roles, and permission assignments
 */
export const permissionsRouter = router({
  /**
   * Get all permissions with optional filtering
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: Add admin permission check
      // const canManagePermissions = await userCan(ctx.session.user.id, 'manage', 'permissions', ctx.db)
      // if (!canManagePermissions) throw new TRPCError({ code: 'FORBIDDEN' })

      const conditions = []

      if (input.search) {
        conditions.push(
          like(permissions.name, `%${input.search}%`)
        )
      }

      if (input.category) {
        conditions.push(eq(permissions.category, input.category))
      }

      if (input.isActive !== undefined) {
        conditions.push(eq(permissions.isActive, input.isActive))
      }

      const results = await ctx.db
        .select()
        .from(permissions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(asc(permissions.category), asc(permissions.name))

      return results
    }),

  /**
   * Get permission by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
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
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        resource: z.string().min(1),
        action: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newPermission] = await ctx.db
        .insert(permissions)
        .values(input)
        .$returningId()

      return newPermission
    }),

  /**
   * Update permission
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      await ctx.db
        .update(permissions)
        .set(updateData)
        .where(eq(permissions.id, id))

      return { success: true }
    }),

  /**
   * Delete permission
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(permissions)
        .where(eq(permissions.id, input.id))

      return { success: true }
    }),

  /**
   * Get user's effective permissions
   */
  getUserPermissions: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Note: Better Auth uses string IDs, but permissions system might use number
      // Convert if needed or adjust permissions.ts to handle string IDs
      return getUserPermissions(input.userId, ctx.db)
    }),

  /**
   * Get user's permissions grouped by category
   */
  getUserPermissionsByCategory: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getUserPermissionsByCategory(input.userId, ctx.db)
    }),

  /**
   * Check if user has specific permission
   */
  checkPermission: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        permissionName: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const hasPermission = await userHasPermission(
        input.userId,
        input.permissionName,
        ctx.db
      )
      return { hasPermission }
    }),

  /**
   * Grant permission to user
   */
  grantToUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        permissionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Insert or update to make sure permission is active
      await ctx.db
        .insert(userPermissions)
        .values({
          userId: input.userId,
          permissionId: input.permissionId,
          isActive: true,
        })
        .onDuplicateKeyUpdate({
          set: { isActive: true }
        })

      return { success: true }
    }),

  /**
   * Revoke permission from user
   */
  revokeFromUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        permissionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Either delete or set isActive to false
      await ctx.db
        .delete(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, input.userId),
            eq(userPermissions.permissionId, input.permissionId)
          )
        )

      return { success: true }
    }),

  /**
   * Assign permission to role
   */
  assignToRole: protectedProcedure
    .input(
      z.object({
        roleId: z.number(),
        permissionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(rolePermissions).values({
        roleId: input.roleId,
        permissionId: input.permissionId,
      })

      return { success: true }
    }),

  /**
   * Remove permission from role
   */
  removeFromRole: protectedProcedure
    .input(
      z.object({
        roleId: z.number(),
        permissionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, input.roleId),
            eq(rolePermissions.permissionId, input.permissionId)
          )
        )

      return { success: true }
    }),

  /**
   * Get all permissions for a role
   */
  getRolePermissions: protectedProcedure
    .input(z.object({ roleId: z.number() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select({
          permission: permissions,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, input.roleId))

      return results.map((r) => r.permission)
    }),
})
