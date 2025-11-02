import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { ipcLink } from 'trpc-electron/renderer';
import { splitLink } from '@trpc/client';
import type { CreateTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import { getServerPublicConfig, getClientPublicConfig } from '@krag/config/public';

// Import router types from both backends
import type { AppRouter as ElectronRouter } from '@krag/electron-desktop/trpc';
import type { AppRouter as AstroRouter } from '@krag/astro-web/trpc';

// Unified router type that includes both Electron and Astro routers
// This allows the tRPC client to work with both backends
export type AppRouter = ElectronRouter & AstroRouter;

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

export type PlatformFromProps = 'astro' | 'electron' | undefined;

// Store platform from AppProps for platform detection
let _platformFromProps: PlatformFromProps;

/**
 * Set platform from App component props
 * This is called when the App component initializes
 */
export const setPlatform = (platform: PlatformFromProps): void => {
  _platformFromProps = platform;
};

/**
 * Detect if running in Electron environment
 * 1. First checks if platform was explicitly set via AppProps
 * 2. Falls back to environment detection (checking for electronAPI/electron globals)
 */
export const isElectron = (): boolean => {
  // 1. Check if platform was explicitly set from AppProps
  if (_platformFromProps !== undefined) {
    return _platformFromProps === 'electron';
  }
  
  // 2. Fall back to environment detection
  if (typeof window === 'undefined') return false;
  
  const win = window as { electronAPI?: unknown; electron?: unknown };
  return !!win.electronAPI || !!win.electron;
};

/**
 * Get API URL for HTTP requests
 */
const getAPIUrl = (): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    // Use @krag/config for consistent configuration
    if (isElectron()) {
      // In Electron: use client config (has API_URL and ASTRO_BASE_URL)
      const config = getClientPublicConfig();
      return config.API_URL || config.ASTRO_BASE_URL || '';
    } else {
      // In Web: use server config (has API_ENDPOINT and BASE_URL)
      const config = getServerPublicConfig();
      return config.API_ENDPOINT || config.BASE_URL || '';
    }
  } catch {
    // Fallback if config not available (shouldn't happen in production)
    console.warn('⚠️ Config not available, using fallback API URL');
    return 'http://localhost:4321';
  }
};

/**
 * Create unified tRPC client that routes to correct backend
 * - Electron routes (electron.*, store.*, system.*) -> IPC
 * - Shared routes (user.*, post.*) -> HTTP (Astro) or IPC (Electron)
 * - Web routes (web.*, auth.*, analytics.*) -> HTTP only
 */
export function createUnifiedTRPCClient() {
  const inElectron = isElectron();

  return trpc.createClient({
    links: [
      splitLink({
        // Condition: Use IPC for Electron-specific routes when in Electron
        condition: (op) => {
          // Routes that should ALWAYS use IPC when in Electron
          const electronOnlyRoutes = [
            'electron',  // All electron.* routes
            'store',     // All store.* routes  
            'system',    // All system.* routes
            'db',        // All db.* routes (local SQLite)
          ];
          
          // Check if we're in Electron AND route is electron-specific
          const isElectronRoute = electronOnlyRoutes.some(route => 
            op.path.startsWith(route)
          );

          // In Electron: use IPC for electron-specific routes
          // In Web: these routes won't be called (conditional rendering)
          return inElectron && isElectronRoute;
        },
        
        // True branch: Use IPC link for Electron
        true: ipcLink(),
        
        // False branch: Use HTTP link for Web/Astro backend
        false: httpBatchLink({
          url: `${getAPIUrl()}/api/trpc`,
          transformer: superjson,
          
          // Add authentication headers
          headers() {
            // Try to get token from storage
            const token = inElectron 
              ? localStorage.getItem('electron-session')
              : localStorage.getItem('web-session');
            
            return token ? { authorization: `Bearer ${token}` } : {};
          },
          
          // Handle fetch errors
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include', // Include cookies
            });
          },
        }),
      }),
    ],
  });
}

/**
 * Get platform name
 */
export const getPlatform = (): 'electron' | 'web' => {
  return isElectron() ? 'electron' : 'web';
};

/**
 * Check if feature is available on current platform
 */
export const isFeatureAvailable = (feature: 'store' | 'system' | 'analytics' | 'oauth'): boolean => {
  const platform = getPlatform();
  
  const featureMap = {
    store: ['electron'],       // electron-store only in Electron
    system: ['electron'],      // System APIs only in Electron
    analytics: ['web'],        // Analytics only on web
    oauth: ['web', 'electron'], // OAuth on both (different flows)
  };
  
  return featureMap[feature]?.includes(platform) ?? false;
};
