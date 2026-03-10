import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { router, usePage } from '@inertiajs/react';

interface UseErrorHandlerOptions {
    /**
     * Enable automatic page refresh on 419 errors
     * @default false
     */
    autoRefresh?: boolean;

    /**
     * Delay before automatic refresh (in ms)
     * @default 3000
     */
    refreshDelay?: number;

    /**
     * Custom error messages for specific status codes
     */
    customMessages?: Record<number, string>;
}

interface ErrorResponse {
    status?: number;
    message?: string;
    errors?: Record<string, string>;
}

/**
 * Global error handler hook for Inertia.js applications
 * Handles CSRF token expiry (419), session timeout, and other common errors
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
    const {
        autoRefresh = false,
        refreshDelay = 3000,
        customMessages = {},
    } = options;

    const page = usePage();

    const getErrorMessage = useCallback((status: number): string => {
        const defaultMessages: Record<number, string> = {
            401: 'Your session has expired. Please log in again.',
            403: 'You do not have permission to perform this action.',
            419: 'Your session has expired. Please refresh the page and try again.',
            422: 'Validation error. Please check your input.',
            429: 'Too many requests. Please wait a moment.',
            500: 'An unexpected error occurred. Please try again.',
            503: 'Service temporarily unavailable. Please try again later.',
        };

        return customMessages[status] || defaultMessages[status] || 'An unexpected error occurred.';
    }, [customMessages]);

    const handleError = useCallback((error: unknown) => {
        const errorResponse = error as ErrorResponse;
        const status = errorResponse.status;

        // Handle 419 CSRF errors specially
        if (status === 419) {
            toast.error('Session Expired', {
                description: getErrorMessage(419),
                duration: 10000,
                action: {
                    label: 'Refresh Page',
                    onClick: () => {
                        window.location.reload();
                    },
                },
                onDismiss: () => {
                    if (autoRefresh) {
                        setTimeout(() => {
                            window.location.reload();
                        }, refreshDelay);
                    }
                },
            });

            // Auto-refresh if enabled
            if (autoRefresh) {
                setTimeout(() => {
                    window.location.reload();
                }, refreshDelay);
            }

            return;
        }

        // Handle 401 Unauthorized
        if (status === 401) {
            toast.error('Authentication Required', {
                description: getErrorMessage(401),
                duration: 8000,
                action: {
                    label: 'Go to Login',
                    onClick: () => {
                        router.visit('/login');
                    },
                },
            });
            return;
        }

        // Handle 403 Forbidden
        if (status === 403) {
            toast.error('Access Denied', {
                description: getErrorMessage(403),
                duration: 6000,
            });
            return;
        }

        // Handle 422 Validation errors
        if (status === 422 && errorResponse.errors) {
            const errorMessages = Object.values(errorResponse.errors);
            errorMessages.forEach((msg) => {
                toast.error('Validation Error', {
                    description: msg as string,
                    duration: 5000,
                });
            });
            return;
        }

        // Handle 429 Too Many Requests
        if (status === 429) {
            toast.error('Too Many Requests', {
                description: getErrorMessage(429),
                duration: 8000,
                action: {
                    label: 'Retry',
                    onClick: () => {
                        window.location.reload();
                    },
                },
            });
            return;
        }

        // Handle 500 Server errors
        if (status === 500 || status === 503) {
            toast.error('Server Error', {
                description: getErrorMessage(status || 500),
                duration: 8000,
                action: {
                    label: 'Retry',
                    onClick: () => {
                        window.location.reload();
                    },
                },
            });
            return;
        }

        // Handle generic errors
        if (errorResponse.message) {
            toast.error('Error', {
                description: errorResponse.message,
                duration: 6000,
            });
        }
    }, [getErrorMessage, autoRefresh, refreshDelay]);

    // Listen for Inertia errors globally
    useEffect(() => {
        const handleErrorEvent = (event: CustomEvent<ErrorResponse>) => {
            handleError(event.detail);
        };

        window.addEventListener('inertia:error', handleErrorEvent as EventListener);

        return () => {
            window.removeEventListener('inertia:error', handleErrorEvent as EventListener);
        };
    }, [handleError]);

    // Check for errors in page props (from server-side validation)
    useEffect(() => {
        const errors = page.props.errors as Record<string, string> | undefined;
        if (errors && Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error) => {
                toast.error('Validation Error', {
                    description: error as string,
                    duration: 5000,
                });
            });
        }
    }, [page.props.errors]);

    return {
        handleError,
        getErrorMessage,
    };
}
