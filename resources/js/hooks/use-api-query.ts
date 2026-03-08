import type {
    UseQueryOptions,
    UseQueryResult} from '@tanstack/react-query';
import {
    useQuery
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

/**
 * Enhanced query hook with default options
 */
export function useApiQuery<TData = unknown, TError = AxiosError>(
    queryKey: string[],
    queryFn: () => Promise<TData>,
    options?: Omit<
        UseQueryOptions<TData, TError, TData, string[]>,
        'queryKey' | 'queryFn'
    >,
): UseQueryResult<TData, TError> {
    return useQuery({
        queryKey,
        queryFn,
        // Default options
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        refetchOnWindowFocus: true,
        ...options,
    });
}

/**
 * Hook for paginated queries
 */
export interface PaginatedQueryParams {
    page?: number;
    perPage?: number;
    search?: string;
    [key: string]: string | number | undefined;
}

export function usePaginatedQuery<TData = unknown, TError = AxiosError>(
    queryKeyPrefix: string,
    params: PaginatedQueryParams,
    queryFn: (params: PaginatedQueryParams) => Promise<TData>,
    options?: Omit<
        UseQueryOptions<TData, TError, TData, (string | PaginatedQueryParams)[]>,
        'queryKey' | 'queryFn'
    >,
): UseQueryResult<TData, TError> {
    return useQuery({
        queryKey: [queryKeyPrefix, params],
        queryFn: () => queryFn(params),
        staleTime: 2 * 60 * 1000, // 2 minutes for paginated data
        gcTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}
