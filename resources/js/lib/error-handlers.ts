import type { AxiosError } from 'axios';

/**
 * Inertia error type
 */
interface InertiaErrorResponse {
    status?: number;
    errors?: Record<string, string>;
    message?: string;
}

/**
 * Check if error is a CSRF/Session error (419)
 */
export function isCsrfError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
        const axiosError = error as AxiosError & { response?: { status?: number } };
        const inertiaError = error as InertiaErrorResponse;
        
        return (
            axiosError.response?.status === 419 ||
            inertiaError.status === 419 ||
            (error as { status?: number }).status === 419
        );
    }
    return false;
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
        const axiosError = error as AxiosError & { response?: { status?: number } };
        const inertiaError = error as InertiaErrorResponse;
        
        return (
            axiosError.response?.status === 401 ||
            inertiaError.status === 401 ||
            (error as { status?: number }).status === 401
        );
    }
    return false;
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
        const axiosError = error as AxiosError & { response?: { status?: number } };
        const inertiaError = error as InertiaErrorResponse;
        
        return (
            axiosError.response?.status === 422 ||
            inertiaError.status === 422 ||
            (error as { status?: number }).status === 422
        );
    }
    return false;
}

/**
 * Get error status code from various error types
 */
export function getErrorStatus(error: unknown): number | undefined {
    if (typeof error === 'object' && error !== null) {
        const axiosError = error as AxiosError & { response?: { status?: number } };
        const inertiaError = error as InertiaErrorResponse;
        
        return (
            axiosError.response?.status ||
            inertiaError.status ||
            (error as { status?: number }).status
        );
    }
    return undefined;
}

/**
 * Get error messages from validation errors
 */
export function getErrorMessages(error: unknown): string[] {
    if (typeof error === 'object' && error !== null) {
        const axiosError = error as AxiosError & { 
            response?: { 
                data?: { 
                    errors?: Record<string, string>;
                    message?: string;
                };
            };
        };
        const inertiaError = error as InertiaErrorResponse;

        const errors = axiosError.response?.data?.errors || inertiaError.errors;
        
        if (errors && typeof errors === 'object') {
            return Object.values(errors) as string[];
        }

        const message = axiosError.response?.data?.message || inertiaError.message;
        if (message) {
            return [message as string];
        }
    }
    return [];
}

/**
 * Get user-friendly error message based on status code
 */
export function getErrorMessage(status?: number): string {
    const messages: Record<number, string> = {
        400: 'Bad request. Please check your input and try again.',
        401: 'Your session has expired. Please log in again.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        419: 'Your session has expired. Please refresh the page and try again.',
        422: 'Validation error. Please check your input.',
        429: 'Too many requests. Please wait a moment and try again.',
        500: 'An unexpected error occurred. Please try again.',
        502: 'Server is temporarily unavailable. Please try again later.',
        503: 'Service temporarily unavailable. Please try again later.',
        504: 'Server timeout. Please try again.',
    };

    return messages[status || 500] || 'An unexpected error occurred. Please try again.';
}

/**
 * Format error for display
 */
export function formatError(error: unknown): {
    status: number | undefined;
    message: string;
    errors: string[];
    isCsrf: boolean;
    isAuth: boolean;
    isValidation: boolean;
} {
    const status = getErrorStatus(error);
    const messages = getErrorMessages(error);
    
    return {
        status,
        message: messages[0] || getErrorMessage(status),
        errors: messages,
        isCsrf: isCsrfError(error),
        isAuth: isAuthError(error),
        isValidation: isValidationError(error),
    };
}
