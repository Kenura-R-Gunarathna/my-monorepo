import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { ipcLink } from 'trpc-electron/renderer';
import { splitLink } from '@trpc/client';

// Import router types from both backends
import type { AppRouter as ElectronRouter } from '../../../apps/electron-desktop/src/main/trpc';
// TODO: Add Astro router type when created
// import type { AppRouter as AstroRouter } from '../../../apps/astro-web/src/server/trpc';

// For now, use Electron router as base
export type AppRouter = ElectronRouter;

export const trpc = createTRPCReact<AppRouter>();

/**
 * Detect if running in Electron environment
 */
export const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).electronAPI || !!((window as any).electron);
};

/**
 * Get API URL for HTTP requests
 */
const getAPIUrl = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Check for environment variable
  const envUrl = import.meta.env?.VITE_API_URL || 
                 import.meta.env?.PUBLIC_API_URL ||
                 import.meta.env?.ASTRO_API_URL;
  
  if (envUrl) return envUrl;
  
  // Default to localhost in development
  return 'http://localhost:4321';
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
