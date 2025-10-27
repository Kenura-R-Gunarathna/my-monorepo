import { TRPCError } from '@trpc/server';
import { t } from '@/packages/trpc-api/trpc';
import { defineAbilitiesForUser } from '@/packages/trpc-api/utils/permissions/abilities';
import { getUserPermissions } from '@/packages/trpc-api/utils/permissions/resolver';

/**
 * Middleware to attach user permissions to context
 */
export const withPermissions = t.middleware(async ({ ctx, next }) => {
  // @ts-expect-error - ctx type will be extended by app
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // @ts-expect-error - ctx type will be extended by app
  const ability = await defineAbilitiesForUser(ctx.userId, ctx.db);
  // @ts-expect-error - ctx type will be extended by app
  const permissions = await getUserPermissions(ctx.userId, ctx.db);

  return next({
    ctx: {
      ...ctx,
      ability,
      permissions,
    },
  });
});

/**
 * Require specific permission
 */
export const requirePermission = (permissionName: string) => {
  return t.middleware(async ({ ctx, next }) => {
    // @ts-expect-error - ctx type will be extended by app
    if (!ctx.permissions) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // @ts-expect-error - ctx type will be extended by app
    const hasPermission = ctx.permissions.some(
      (p: any) => p.name === permissionName && p.isActive
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permission: ${permissionName}`,
      });
    }

    return next({ ctx });
  });
};

/**
 * Require ability to perform action
 */
export const requireAbility = (action: string, subject: string) => {
  return t.middleware(async ({ ctx, next }) => {
    // @ts-expect-error - ctx type will be extended by app
    if (!ctx.ability) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // @ts-expect-error - ctx type will be extended by app
    if (!ctx.ability.can(action, subject)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot ${action} ${subject}`,
      });
    }

    return next({ ctx });
  });
};

/**
 * Protected procedure with permissions
 */
export const protectedProcedure = t.procedure.use(withPermissions);
