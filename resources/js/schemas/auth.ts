import { type } from 'arktype';

/**
 * Email validation schema
 * Validates RFC 5322 compliant email addresses
 */
export const emailSchema = type('string');

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - Maximum 255 characters
 */
export const passwordSchema = type('string');

/**
 * Name validation schema
 * Requirements:
 * - Minimum 2 characters
 * - Maximum 255 characters
 */
export const nameSchema = type('string');

/**
 * Login form schema
 */
export const loginSchema = type({
    email: 'string.email',
    password: 'string',
    remember: 'boolean | undefined',
});

/**
 * Registration form schema
 */
export const registerSchema = type({
    name: 'string',
    email: 'string.email',
    password: 'string',
    password_confirmation: 'string',
});

/**
 * Password update schema
 */
export const passwordUpdateSchema = type({
    current_password: 'string',
    password: 'string',
    password_confirmation: 'string',
});

/**
 * Two-factor authentication code schema
 * Exactly 6 digits
 */
export const twoFactorCodeSchema = type('string');

/**
 * Two-factor recovery code schema
 * Format: XXXXXXXX-XXXXXXXX (8 chars, dash, 8 chars)
 */
export const recoveryCodeSchema = type('string');

/**
 * Two-factor challenge schema
 * Supports both code and recovery code
 */
export const twoFactorChallengeSchema = type({
    code: 'string | undefined',
    recovery_code: 'string | undefined',
});

/**
 * Confirm password schema
 */
export const confirmPasswordSchema = type({
    password: 'string',
});

/**
 * Profile update schema
 */
export const profileUpdateSchema = type({
    name: 'string',
    email: 'string.email',
    avatar: 'File | undefined',
});

/**
 * User create/update schema
 */
export const userSchema = type({
    name: 'string',
    email: 'string.email',
    password: 'string | undefined',
    password_confirmation: 'string | undefined',
    role: 'string | undefined',
    status: 'string | undefined',
});

/**
 * Login form type
 */
export type LoginData = typeof loginSchema.infer;

/**
 * Registration form type
 */
export type RegisterData = typeof registerSchema.infer;

/**
 * Password update form type
 */
export type PasswordUpdateData = typeof passwordUpdateSchema.infer;

/**
 * Two-factor challenge form type
 */
export type TwoFactorChallengeData = typeof twoFactorChallengeSchema.infer;

/**
 * Confirm password form type
 */
export type ConfirmPasswordData = typeof confirmPasswordSchema.infer;

/**
 * Profile update form type
 */
export type ProfileUpdateData = typeof profileUpdateSchema.infer;

/**
 * User create/update form type
 */
export type UserData = typeof userSchema.infer;
