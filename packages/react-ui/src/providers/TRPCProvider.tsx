import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { trpc, createUnifiedTRPCClient, isElectron } from '../lib/trpc';
import { getServerPublicConfig, getClientPublicConfig } from '@krag/config/public';

interface TRPCProviderProps {
  children: React.ReactNode;
}

/**
 * Unified tRPC Provider that works for both Electron and Web
 * - In Electron: Routes to IPC for electron-specific routes
 * - In Web: Routes to HTTP for all routes
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache for 5 minutes
            staleTime: 1000 * 60 * 5,
            
            // Retry once on failure
            retry: 1,
            
            // Don't refetch on window focus in Electron
            refetchOnWindowFocus: !isElectron(),
            
            // Keep data in cache for 10 minutes
            gcTime: 1000 * 60 * 10,
          },
          mutations: {
            // Retry mutations once on network error
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors
              if (error && typeof error === 'object' && 'data' in error) {
                const errorData = error.data as { httpStatus?: number };
                if (errorData?.httpStatus && errorData.httpStatus >= 400 && errorData.httpStatus < 500) {
                  return false;
                }
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  const [trpcClient] = useState(() => createUnifiedTRPCClient());

  // Get IS_DEV from config instead of import.meta.env
  const isDev = (() => {
    try {
      // Try Electron config first, then fall back to server config for web
      const config = isElectron() ? getClientPublicConfig() : getServerPublicConfig();
      return config.IS_DEV;
    } catch {
      // Fallback for build environments where config might not be set yet
      return false;
    }
  })();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Show React Query devtools in development */}
        {isDev && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
