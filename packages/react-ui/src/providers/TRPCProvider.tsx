import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { trpc, createUnifiedTRPCClient, isElectron } from '../lib/trpc';

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
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  const [trpcClient] = useState(() => createUnifiedTRPCClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Show React Query devtools in development */}
        {import.meta.env?.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
