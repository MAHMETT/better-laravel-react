# ArkType Validation System Documentation

## 🎯 Overview

This project uses **ArkType** as the default client-side validation system. ArkType provides type-safe validation with excellent error messages and TypeScript integration.

**Version:** ArkType 2.1.29 (latest stable)

## 📦 Installation

ArkType is already installed. If you need to reinstall:

```bash
bun add arktype
```

## 📁 Folder Structure

```
resources/js/
├── schemas/                    # Validation schemas directory
│   ├── auth.ts                # Authentication-related schemas
│   ├── validate.ts            # Validation utilities
│   └── index.ts               # Barrel exports
└── pages/
    ├── auth/                  # Authentication pages
    └── settings/              # Settings pages
```

## 📝 Available Schemas

### Authentication Schemas (`schemas/auth.ts`)

#### Email Validation
```typescript
import { emailSchema } from '@/schemas';

// Validates RFC 5322 compliant email addresses
const result = emailSchema('user@example.com');
```

#### Password Validation
```typescript
import { passwordSchema } from '@/schemas';

// Requirements:
// - Minimum 8 characters
// - Maximum 255 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
const result = passwordSchema('SecurePass123');
```

#### Name Validation
```typescript
import { nameSchema } from '@/schemas';

// Requirements:
// - Minimum 2 characters
// - Maximum 255 characters
// - Automatically trims whitespace
const result = nameSchema('John Doe');
```

#### Login Form
```typescript
import { loginSchema, type LoginData } from '@/schemas';

const data: LoginData = {
    email: 'user@example.com',
    password: 'SecurePass123',
    remember: true,
};

const result = loginSchema(data);
```

#### Registration Form
```typescript
import { registerSchema, type RegisterData } from '@/schemas';

const data: RegisterData = {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'SecurePass123',
    password_confirmation: 'SecurePass123',
};

const result = registerSchema(data);
// Automatically validates passwords match
```

#### Password Update
```typescript
import { passwordUpdateSchema, type PasswordUpdateData } from '@/schemas';

const data: PasswordUpdateData = {
    current_password: 'OldPass123',
    password: 'NewSecurePass456',
    password_confirmation: 'NewSecurePass456',
};

const result = passwordUpdateSchema(data);
```

#### Two-Factor Authentication Code
```typescript
import { twoFactorCodeSchema } from '@/schemas';

// Exactly 6 digits
const result = twoFactorCodeSchema('123456');
```

#### Two-Factor Recovery Code
```typescript
import { recoveryCodeSchema } from '@/schemas';

// Format: XXXXXXXX-XXXXXXXX (8 chars, dash, 8 chars)
const result = recoveryCodeSchema('ABCD1234-EFGH5678');
```

#### Two-Factor Challenge
```typescript
import { twoFactorChallengeSchema, type TwoFactorChallengeData } from '@/schemas';

// Supports both code and recovery code
const data: TwoFactorChallengeData = {
    code: '123456',
    // OR
    recovery_code: 'ABCD1234-EFGH5678',
};

const result = twoFactorChallengeSchema(data);
```

## 🔧 Validation Utilities (`schemas/validate.ts`)

### validateForm

Main validation function that returns structured results:

```typescript
import { validateForm } from '@/schemas/validate';
import { loginSchema } from '@/schemas';

const result = validateForm(loginSchema, {
    email: 'invalid-email',
    password: '123',
});

if (!result.success) {
    console.log(result.errors);
    // {
    //   email: "must be a valid email",
    //   password: "must be at least 8 characters"
    // }
}
```

### Helper Functions

```typescript
import { getFieldError, hasFieldError, clearFieldErrors } from '@/schemas/validate';

// Get error for specific field
const emailError = getFieldError(result, 'email');

// Check if field has errors
if (hasFieldError(result, 'password')) {
    // Handle password error
}

// Clear specific field errors
const cleared = clearFieldErrors(result, ['remember']);
```

## 🎨 Integration with Forms

### Basic Pattern

```tsx
import { Form } from '@inertiajs/react';
import { loginSchema, type LoginData } from '@/schemas';
import { validateForm } from '@/schemas/validate';
import { useState } from 'react';

export default function LoginForm() {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleSubmit = (formData: FormData) => {
        const data: LoginData = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        };

        const result = validateForm(loginSchema, data);

        if (!result.success) {
            setValidationErrors(result.errors);
            throw new Error('Validation failed');
        }

        setValidationErrors({});
        return data;
    };

    return (
        <Form
            {...store.form()}
            onSubmit={(e) => {
                const formData = new FormData(e.currentTarget);
                const data = handleSubmit(formData);
                Object.entries(data).forEach(([key, value]) => {
                    formData.set(key, value.toString());
                });
                return formData;
            }}
        >
            {({ errors }) => (
                <>
                    <Input name="email" />
                    <InputError message={validationErrors.email || errors.email} />
                </>
            )}
        </Form>
    );
}
```

### Error Handling

The system provides two layers of validation:

1. **Client-side (ArkType)** - Immediate feedback
2. **Server-side (Laravel)** - Backend validation

Both error sources are merged and displayed:

```tsx
<InputError message={validationErrors.email || errors.email} />
```

## 📋 Implemented Forms

### ✅ Login (`pages/auth/login.tsx`)
- Email validation
- Password required
- Remember me checkbox

### ✅ Register (`pages/auth/register.tsx`)
- Name validation (2-255 chars, trimmed)
- Email validation
- Password strength validation
- Password confirmation matching

### ✅ Password Update (`pages/settings/password.tsx`)
- Current password required
- New password strength validation
- Password confirmation matching

### ✅ Two-Factor Challenge (`pages/auth/two-factor-challenge.tsx`)
- 6-digit code validation
- Recovery code format validation (XXXXXXXX-XXXXXXXX)
- Mode switching (code ↔ recovery code)

### ✅ Confirm Password (`pages/auth/confirm-password.tsx`)
- Password required
- Uses backend validation only

## 🎯 Error Messages

ArkType provides clear, specific error messages:

| Validation | Error Message |
|------------|---------------|
| Invalid email | "must be a valid email" |
| Password too short | "must be at least 8 characters" |
| Password missing uppercase | "must match the pattern" |
| Passwords don't match | "Passwords must match" |
| Invalid 2FA code | "must match the pattern" (6 digits) |
| Invalid recovery code | "must match the pattern" (XXXXXXXX-XXXXXXXX) |

### User-Friendly Display

For better UX, you can add helper text:

```tsx
<InputError message={validationErrors.password || errors.password} />
{errors.password && !validationErrors.password && (
    <p className="text-xs text-muted-foreground">
        Must be at least 8 characters with uppercase, lowercase, and number
    </p>
)}
```

## 🏗️ Architecture

### Separation of Concerns

```
schemas/
├── auth.ts          # Schema definitions
└── validate.ts      # Validation logic

pages/
└── auth/
    └── login.tsx    # UI components
```

**Benefits:**
- ✅ Reusable schemas
- ✅ Type-safe validation
- ✅ Clear error messages
- ✅ Easy to test
- ✅ Maintainable

### Type Safety

All schemas export TypeScript types:

```typescript
import { loginSchema, type LoginData } from '@/schemas';

// LoginData is automatically inferred from loginSchema
type LoginData = typeof loginSchema.infer;
```

## 🚀 Best Practices

### 1. Always Validate on Submit

```tsx
const handleSubmit = (formData: FormData) => {
    const data = { /* extract fields */ };
    const result = validateForm(schema, data);

    if (!result.success) {
        setValidationErrors(result.errors);
        throw new Error('Validation failed');
    }

    return data;
};
```

### 2. Clear Validation Errors on Success

```tsx
if (!result.success) {
    setValidationErrors(result.errors);
    throw new Error('Validation failed');
}

setValidationErrors({}); // Clear on success
```

### 3. Merge Client and Server Errors

```tsx
<InputError message={validationErrors.email || errors.email} />
```

### 4. Provide Helpful Hints

```tsx
<InputError message={errors.password} />
{errors.password && (
    <p className="text-xs text-muted-foreground">
        Must be at least 8 characters with uppercase, lowercase, and number
    </p>
)}
```

### 5. Focus on Error Fields

```tsx
onError={(errors) => {
    if (errors.password) {
        passwordInput.current?.focus();
    }
}}
```

## 🔄 Extending the System

### Adding New Schemas

1. **Define schema in `schemas/auth.ts`:**

```typescript
export const profileSchema = type({
    name: nameSchema,
    email: emailSchema,
    bio: 'string.max(500).optional',
});

export type ProfileData = typeof profileSchema.infer;
```

2. **Use in component:**

```tsx
import { profileSchema, type ProfileData } from '@/schemas';
import { validateForm } from '@/schemas/validate';

const handleSubmit = (formData: FormData) => {
    const data: ProfileData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        bio: formData.get('bio') as string,
    };

    const result = validateForm(profileSchema, data);
    // ... handle validation
};
```

### Custom Validation Rules

```typescript
import { type } from 'arktype';

// Custom phone number validation
export const phoneSchema = type('string.regex(/^\\+?\\d{10,15}$/)');

// Custom username validation
export const usernameSchema = type('string.min(3).max(20).regex(/^[a-zA-Z0-9_]+$/)');
```

## 📊 Comparison: Before vs After

### Before (Manual Validation)

```tsx
// Scattered validation logic
if (!email.includes('@')) {
    errors.email = 'Invalid email';
}

if (password.length < 8) {
    errors.password = 'Too short';
}

// No type safety
// Inconsistent error messages
// Hard to maintain
```

### After (ArkType)

```tsx
// Centralized schemas
import { loginSchema } from '@/schemas';

const result = validateForm(loginSchema, data);

// Type-safe
// Consistent error messages
// Easy to maintain
```

## 🎯 Key Benefits

| Feature | Benefit |
|---------|---------|
| **Type Safety** | Automatic TypeScript types from schemas |
| **Clear Errors** | Specific, user-friendly messages |
| **Reusability** | Share schemas across forms |
| **Maintainability** | Centralized validation logic |
| **Testability** | Easy to test schemas independently |
| **Performance** | Fast validation with minimal overhead |

## 📚 Resources

- [ArkType Documentation](https://arktype.io/)
- [ArkType GitHub](https://github.com/arktypeio/arktype)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## ✅ Checklist for New Forms

- [ ] Create schema in `schemas/auth.ts`
- [ ] Export TypeScript type
- [ ] Import in form component
- [ ] Add `useState` for validation errors
- [ ] Create `handleSubmit` function
- [ ] Call `validateForm` in submit handler
- [ ] Display errors with `InputError`
- [ ] Clear errors on success
- [ ] Add helpful hints for complex validations
- [ ] Test with invalid data
- [ ] Test with valid data

---

**Last Updated:** 2026-02-24  
**ArkType Version:** 2.1.29  
**Status:** ✅ Production Ready
