import { trpc, isElectron, isFeatureAvailable } from '../lib/trpc';

/**
 * Hook to manage platform-specific features and capabilities
 * 
 * @example
 * ```tsx
 * const { isElectron, systemInfo, hasStoreAccess } = usePlatformFeatures();
 * 
 * if (hasStoreAccess) {
 *   // Show Electron-specific settings
 * }
 * ```
 */
export function usePlatformFeatures() {
  const inElectron = isElectron();

  // Electron-specific queries (only enabled in Electron)
  const systemQuery = trpc.system.getPlatform.useQuery(undefined, {
    enabled: inElectron,
    staleTime: Infinity, // System info never changes
  });

  const appVersionQuery = trpc.system.getAppVersion.useQuery(undefined, {
    enabled: inElectron,
    staleTime: Infinity, // Version never changes during runtime
  });

  return {
    // Platform detection
    isElectron: inElectron,
    isWeb: !inElectron,
    platform: inElectron ? 'electron' : ('web' as const),

    // Electron-specific data
    systemInfo: systemQuery.data,
    appVersion: appVersionQuery.data,

    // Feature availability checks
    hasStoreAccess: isFeatureAvailable('store'),
    hasSystemAccess: isFeatureAvailable('system'),
    hasAnalytics: isFeatureAvailable('analytics'),
    hasOAuth: isFeatureAvailable('oauth'),

    // Loading states
    isLoadingPlatformInfo: systemQuery.isLoading || appVersionQuery.isLoading,
  };
}

/**
 * Hook to access Electron store (only in Electron)
 * Returns null if not in Electron environment
 */
export function useElectronStore() {
  const inElectron = isElectron();

  const sessionQuery = trpc.store.getSession.useQuery(undefined, {
    enabled: inElectron,
  });

  const settingsQuery = trpc.store.getAll.useQuery(undefined, {
    enabled: inElectron,
  });

  if (!inElectron) {
    return null;
  }

  return {
    session: sessionQuery.data,
    settings: settingsQuery.data,
    isLoading: sessionQuery.isLoading || settingsQuery.isLoading,
  };
}

/**
 * Hook to check user permissions (works on both platforms)
 */
export function usePermissions() {
  const inElectron = isElectron();
  
  // In Electron, get from local store
  const electronSession = trpc.store.getSession.useQuery(undefined, {
    enabled: inElectron,
  });

  // In Web, get from HTTP session (TODO: implement in Astro)
  // const webSession = trpc.auth.getSession.useQuery(undefined, {
  //   enabled: !inElectron,
  // });

  const session = inElectron ? electronSession.data : null;

  const hasPermission = (permission: string): boolean => {
    return session?.permissions?.includes(permission) ?? false;
  };

  const hasRole = (role: string): boolean => {
    return session?.roles?.includes(role) ?? false;
  };

  const hasAnyPermission = (...permissions: string[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (...permissions: string[]): boolean => {
    return permissions.every(hasPermission);
  };

  return {
    permissions: session?.permissions ?? [],
    roles: session?.roles ?? [],
    user: session?.user,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: electronSession.isLoading,
  };
}
