import { AbilityBuilder, PureAbility } from '@casl/ability';
import { getUserPermissions, type ResolvedPermission } from '@/packages/trpc-api/utils/permissions/resolver';

export type AppAbility = PureAbility<[string, string]>;

/**
 * Define abilities from resolved permissions
 */
export async function defineAbilitiesForUser(userId: number, db: any): Promise<AppAbility> {
  const permissions = await getUserPermissions(userId, db);
  return buildAbilityFromPermissions(permissions);
}

/**
 * Build CASL ability from permission list
 */
export function buildAbilityFromPermissions(
  permissions: ResolvedPermission[]
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

  permissions.forEach(permission => {
    const { resource, action, conditions } = permission;

    if (resource === 'all' && action === 'manage') {
      // Super admin
      can('manage', 'all');
    } else if (action === 'manage') {
      // Manage all actions on specific resource
      can('manage', resource, conditions);
    } else {
      // Specific action on resource
      can(action, resource, conditions);
    }
  });

  return build();
}
