import type { ChangeEvent, SyntheticEvent } from 'react';
import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
    initialValues: T;
    onSubmit?: (values: T) => Promise<void> | void;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export function useFormHandler<T extends Record<string, unknown>>({
    initialValues,
    onSubmit,
    validate,
}: UseFormOptions<T>) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>(
        {},
    );

    const handleChange = useCallback(
        (
            e: ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => {
            const { name, value, type } = e.target;

            setValues((prev) => ({
                ...prev,
                [name]:
                    type === 'checkbox'
                        ? (e.target as HTMLInputElement).checked
                        : value,
            }));

            // Clear error when user starts typing
            if (errors[name as keyof T]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: undefined,
                }));
            }
        },
        [errors],
    );

    const handleBlur = useCallback(
        (
            e: ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => {
            const { name } = e.target;
            setTouched((prev) => ({
                ...prev,
                [name]: true,
            }));

            // Validate on blur
            if (validate) {
                const validationErrors = validate(values);
                if (validationErrors[name as keyof T]) {
                    setErrors((prev) => ({
                        ...prev,
                        [name]: validationErrors[name as keyof T],
                    }));
                }
            }
        },
        [validate, values],
    );

    const handleSubmit = useCallback(
        async (e?: SyntheticEvent) => {
            e?.preventDefault();

            // Validate all fields
            if (validate) {
                const validationErrors = validate(values);
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                    return;
                }
            }

            setIsSubmitting(true);
            try {
                await onSubmit?.(values);
            } catch (error) {
                console.error('Form submission error:', error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [validate, values, onSubmit],
    );

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    const setFieldValue = useCallback((name: keyof T, value: unknown) => {
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        setErrors,
    };
}
