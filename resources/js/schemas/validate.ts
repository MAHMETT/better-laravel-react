import type { Type } from 'arktype';

/**
 * Validation result structure
 */
export interface ValidationResult {
    success: boolean;
    data?: Record<string, unknown>;
    errors: Record<string, string>;
}

/**
 * Custom validation rules for form fields
 */
interface ValidationRules {
    name?: { min?: number; max?: number };
    password?: { min?: number; max?: number };
    code?: { length: number };
    email?: boolean;
}

/**
 * Validate form data against an ArkType schema
 * Returns structured errors compatible with Inertia forms
 */
export function validateForm(
    schema: Type,
    data: Record<string, unknown>,
    customRules?: ValidationRules,
): ValidationResult {
    const result = schema(data) as { success: boolean; data?: Record<string, unknown>; summary?: { errors: Array<{ path?: string[]; message: string }> } };

    if (result.success) {
        // Apply custom validation rules if provided
        const customErrors = applyCustomRules(data, customRules);
        if (Object.keys(customErrors).length > 0) {
            return {
                success: false,
                errors: customErrors,
            };
        }

        return {
            success: true,
            data: result.data,
            errors: {},
        };
    }

    // Convert ArkType errors to field-based error object
    const errors: Record<string, string> = {};

    if (result.summary?.errors) {
        result.summary.errors.forEach((error: { path?: string[]; message: string }) => {
            const field = error.path?.[0];
            if (field && typeof field === 'string') {
                // If field already has an error, append the new one
                if (errors[field]) {
                    errors[field] += ` ${error.message}`;
                } else {
                    errors[field] = error.message;
                }
            }
        });
    }

    return {
        success: false,
        errors,
    };
}

/**
 * Apply custom validation rules
 */
function applyCustomRules(
    data: Record<string, unknown>,
    rules?: ValidationRules,
): Record<string, string> {
    const errors: Record<string, string> = {};

    if (rules?.name) {
        const name = data.name as string;
        if (name && typeof name === 'string') {
            if (rules.name.min && name.length < rules.name.min) {
                errors.name = `Name must be at least ${rules.name.min} characters`;
            }
            if (rules.name.max && name.length > rules.name.max) {
                errors.name = `Name must be no more than ${rules.name.max} characters`;
            }
        }
    }

    if (rules?.password) {
        const password = data.password as string;
        const passwordConfirmation = data.password_confirmation as string;

        // Only validate password if it's provided and not empty
        if (password && password.length > 0 && typeof password === 'string') {
            if (rules.password.min && password.length < rules.password.min) {
                errors.password = `Password must be at least ${rules.password.min} characters`;
            }
            if (rules.password.max && password.length > rules.password.max) {
                errors.password = `Password must be no more than ${rules.password.max} characters`;
            }
            // Check for uppercase, lowercase, and number
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
                errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
            }

            // Only check confirmation if password is provided
            if (passwordConfirmation && password !== passwordConfirmation) {
                errors.password_confirmation = 'Passwords must match';
            }
        }
    }

    if (rules?.code) {
        const code = data.code as string;
        if (code && code.length !== rules.code.length) {
            errors.code = `Code must be exactly ${rules.code.length} digits`;
        }
    }

    if (rules?.email) {
        const email = data.email as string;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }
    }

    return errors;
}

/**
 * Get a single error message for a specific field
 */
export function getFieldError(
    result: ValidationResult,
    field: string,
): string | undefined {
    return result.errors[field];
}

/**
 * Check if a specific field has errors
 */
export function hasFieldError(
    result: ValidationResult,
    field: string,
): boolean {
    return field in result.errors;
}

/**
 * Clear errors for specific fields
 */
export function clearFieldErrors(
    result: ValidationResult,
    fields: string[],
): ValidationResult {
    const clearedErrors = { ...result.errors };
    fields.forEach((field) => {
        delete clearedErrors[field];
    });

    return {
        ...result,
        errors: clearedErrors,
        success: Object.keys(clearedErrors).length === 0,
    };
}
