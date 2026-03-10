import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { formatError, getErrorMessage } from '@/lib/error-handlers';

/**
 * Setup global Inertia error interceptor
 * This should be called once in your app entry point
 */
export function setupErrorInterceptor() {
    // Intercept all Inertia errors
    router.on('error', (error) => {
        const formatted = formatError(error);

        // Skip handling if it's a form validation error (422 with errors object)
        // These are better handled by the form's onError callback
        if (formatted.isValidation && formatted.errors.length > 0) {
            return; // Let the form handle it
        }

        // Handle CSRF errors specially
        if (formatted.isCsrf) {
            handleCsrfError(error);
            return;
        }

        // Handle other errors
        handleGenericError(error, formatted);
    });
}

/**
 * Handle CSRF/Session expiry errors
 */
function handleCsrfError(error: unknown) {
    const formatted = formatError(error);

    toast.error('Session Expired', {
        description: 'Your session has expired. This can happen if you\'ve been inactive for too long.',
        duration: 15000,
        action: {
            label: 'Refresh Page',
            onClick: () => {
                window.location.reload();
            },
        },
        cancel: {
            label: 'Later',
            onClick: () => {
                // User chose to refresh later
            },
        },
        onAutoClose: () => {
            // Auto-refresh after toast closes if user hasn't acted
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        },
    });

    // Log to console for debugging
    console.warn('[CSRF Error]', formatted);
}

/**
 * Handle generic errors
 */
function handleGenericError(error: unknown, formatted: ReturnType<typeof formatError>) {
    const { status, message, errors } = formatted;

    // Handle validation errors
    if (formatted.isValidation && errors.length > 0) {
        errors.forEach((err) => {
            toast.error('Validation Error', {
                description: err,
                duration: 5000,
            });
        });
        return;
    }

    // Handle authentication errors
    if (formatted.isAuth) {
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

    // Handle server errors
    if (status && status >= 500) {
        toast.error('Server Error', {
            description: getErrorMessage(status),
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

    // Handle rate limiting
    if (status === 429) {
        toast.error('Too Many Requests', {
            description: getErrorMessage(429),
            duration: 8000,
            action: {
                label: 'Retry',
                onClick: () => {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                },
            },
        });
        return;
    }

    // Handle forbidden
    if (status === 403) {
        toast.error('Access Denied', {
            description: getErrorMessage(403),
            duration: 6000,
        });
        return;
    }

    // Handle not found
    if (status === 404) {
        toast.error('Not Found', {
            description: getErrorMessage(404),
            duration: 6000,
        });
        return;
    }

    // Generic error fallback
    toast.error('Error', {
        description: message,
        duration: 6000,
        action: {
            label: 'Retry',
            onClick: () => {
                window.location.reload();
            },
        },
    });
}

/**
 * Create a router visit wrapper with error handling
 */
export function visitWithHandling(
    url: string,
    options?: Parameters<typeof router.visit>[1]
) {
    return router.visit(url, {
        ...options,
        onError: (errors) => {
            if (Object.keys(errors).length > 0) {
                Object.values(errors).forEach((error) => {
                    toast.error('Error', {
                        description: error,
                        duration: 5000,
                    });
                });
            }
            return errors;
        },
    });
}
