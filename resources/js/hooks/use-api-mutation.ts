import type {
    UseMutationOptions,
    UseMutationResult,
} from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

/**
 * Enhanced mutation hook with automatic query invalidation
 */
export function useApiMutation<
    TData = unknown,
    TError = AxiosError,
    TVariables = void,
    TContext = unknown,
>(
    mutationKey: string[],
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: Omit<
        UseMutationOptions<TData, TError, TVariables, TContext>,
        'mutationFn' | 'mutationKey'
    >,
): UseMutationResult<TData, TError, TVariables, TContext> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey,
        mutationFn,
        ...options,
        // Automatically invalidate queries on success
        onSuccess: (data, variables, context) => {
            // Invalidate all queries that start with the same prefix
            const prefix = mutationKey.slice(0, -1).join('/');
            queryClient.invalidateQueries({ queryKey: [prefix] });

            // Call custom onSuccess if provided
            const customOnSuccess = options?.onSuccess;
            if (customOnSuccess) {
                Reflect.apply(customOnSuccess, null, [
                    data,
                    variables,
                    context,
                ]);
            }
        },
    });
}

/**
 * Hook to invalidate specific queries
 */
export function useInvalidateQueries() {
    const queryClient = useQueryClient();

    return {
        invalidate: (queryKey: string[]) => {
            return queryClient.invalidateQueries({ queryKey });
        },
        invalidatePrefix: (prefix: string) => {
            return queryClient.invalidateQueries({
                queryKey: [prefix],
            });
        },
        remove: (queryKey: string[]) => {
            queryClient.removeQueries({ queryKey });
        },
        reset: (queryKey: string[]) => {
            return queryClient.resetQueries({ queryKey });
        },
    };
}
