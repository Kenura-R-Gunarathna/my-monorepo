// packages/trpc-api/src/router/admin/permissions.ts
import { z } from 'zod';
import { protectedProcedure, requirePermission } from '@/packages/trpc-api/middleware/permissions';
import { router } from '@/packages/trpc-api/trpc';
import { getUserPermissions } from '@/packages/trpc-api/utils/permissions/resolver';

export const adminPermissionsRouter = router({
  // Grant individual permission to user
  grantUserPermission: protectedProcedure
    .use(requirePermission('users.manage-permissions'))
    .input(z.object({
      userId: z.number(),
      permissionId: z.number(),
      conditions: z.record(z.any()).optional(),
      expiresAt: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // @ts-expect-error - ctx type will be extended by app
      const db = ctx.db;
      // @ts-expect-error - ctx type will be extended by app
      const currentUserId = ctx.userId;

      // TODO: Replace with actual DB insert using drizzle
      // Example:
      // await db.insert(userPermissions).values({
      //   userId: input.userId,
      //   permissionId: input.permissionId,
      //   granted: true,
      //   conditions: input.conditions,
      //   expiresAt: input.expiresAt,
      //   grantedBy: currentUserId,
      //   notes: input.notes,
      // });

      return { success: true };
    }),

  // Revoke individual permission from user
  revokeUserPermission: protectedProcedure
    .use(requirePermission('users.manage-permissions'))
    .input(z.object({
      userId: z.number(),
      permissionId: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // @ts-expect-error - ctx type will be extended by app
      const db = ctx.db;
      // @ts-expect-error - ctx type will be extended by app
      const currentUserId = ctx.userId;

      // TODO: Replace with actual DB insert using drizzle
      // Example:
      // await db.insert(userPermissions).values({
      //   userId: input.userId,
      //   permissionId: input.permissionId,
      //   granted: false,
      //   grantedBy: currentUserId,
      //   notes: input.notes,
      // });

      return { success: true };
    }),

  // Remove user permission override (back to role default)
  removeUserPermission: protectedProcedure
    .use(requirePermission('users.manage-permissions'))
    .input(z.object({
      userId: z.number(),
      permissionId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // @ts-expect-error - ctx type will be extended by app
      const db = ctx.db;

      // TODO: Replace with actual DB delete using drizzle
      // Example:
      // await db.delete(userPermissions)
      //   .where(and(
      //     eq(userPermissions.userId, input.userId),
      //     eq(userPermissions.permissionId, input.permissionId)
      //   ));

      return { success: true };
    }),

  // Get user's permission breakdown
  getUserPermissionBreakdown: protectedProcedure
    .use(requirePermission('users.read'))
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      // @ts-expect-error - ctx type will be extended by app
      const db = ctx.db;

      const permissions = await getUserPermissions(input.userId, db);
      
      return {
        rolePermissions: permissions.filter(p => p.source === 'role'),
        grantedPermissions: permissions.filter(p => p.source === 'user-granted'),
        all: permissions,
      };
    }),

  // List all permissions in the system
  listAllPermissions: protectedProcedure
    .use(requirePermission('permissions.read'))
    .input(z.object({
      category: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // @ts-expect-error - ctx type will be extended by app
      const db = ctx.db;

      // TODO: Replace with actual DB query using drizzle
      // Example:
      // const conditions = [];
      // if (input.category) {
      //   conditions.push(eq(permissions.category, input.category));
      // }
      // if (input.isActive !== undefined) {
      //   conditions.push(eq(permissions.isActive, input.isActive));
      // }
      // 
      // return db.query.permissions.findMany({
      //   where: conditions.length > 0 ? and(...conditions) : undefined,
      //   orderBy: [permissions.category, permissions.name],
      // });

      return [];
    }),

  // Grant permission to role
  grantRolePermission: protectedProcedure
    .use(requirePermission('roles.manage-permissions'))
    .input(z.object({
      roleId: z.number(),
      permissionId: z.number(),
      conditions: z.record(z.any()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // @ts-expect-error - ctx type will be extended by app
      const db = ctx.db;
      // @ts-expect-error - ctx type will be extended by app
      const currentUserId = ctx.userId;

      // TODO: Replace with actual DB insert using drizzle
      // Example:
      // await db.insert(rolePermissions).values({
      //   roleId: input.roleId,
      //   permissionId: input.permissionId,
      //   conditions: input.conditions,
      //   grantedBy: currentUserId,
      //   notes: input.notes,
      // });

      return { success: true };
    }),

  // Revoke permission from role
  revokeRolePermission: protectedProcedure
    .use(requirePermission('roles.manage-permissions'))
    .input(z.object({
      roleId: z.number(),
      permissionId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // @ts-expect-error - ctx type will be extended by app
      const db = ctx.db;

      // TODO: Replace with actual DB delete using drizzle
      // Example:
      // await db.delete(rolePermissions)
      //   .where(and(
      //     eq(rolePermissions.roleId, input.roleId),
      //     eq(rolePermissions.permissionId, input.permissionId)
      //   ));

      return { success: true };
    }),

  // Get role's permissions
  getRolePermissions: protectedProcedure
    .use(requirePermission('roles.read'))
    .input(z.object({ roleId: z.number() }))
    .query(async ({ ctx, input }) => {
      // @ts-expect-error - ctx type will be extended by app
      const db = ctx.db;

      // TODO: Replace with actual DB query using drizzle
      // Example:
      // return db.query.rolePermissions.findMany({
      //   where: eq(rolePermissions.roleId, input.roleId),
      //   with: {
      //     permission: true,
      //   },
      // });

      return [];
    }),
});
