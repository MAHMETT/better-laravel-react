'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // 5-minute stale time as per architecture
            staleTime: 5 * 60 * 1000,
            // Cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry on failure 3 times
            retry: 3,
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Don't refetch on reconnect by default
            refetchOnReconnect: false,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

export function TanStackQueryProvider({ children }: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
