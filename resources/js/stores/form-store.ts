import { create } from 'zustand';

interface FormState<T extends Record<string, unknown>> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    isSubmitting: boolean;
    touched: Partial<Record<keyof T, boolean>>;
}

interface FormActions<T extends Record<string, unknown>> {
    setValues: (values: T) => void;
    setErrors: (errors: Partial<Record<keyof T, string>>) => void;
    setIsSubmitting: (submitting: boolean) => void;
    setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
    setFieldValue: (name: keyof T, value: unknown) => void;
    reset: (initialValues: T) => void;
}

type FormStore<T extends Record<string, unknown>> = FormState<T> & FormActions<T>;

export function createFormStore<T extends Record<string, unknown>>(initialValues: T) {
    return create<FormStore<T>>((set) => ({
        values: initialValues,
        errors: {},
        isSubmitting: false,
        touched: {},
        
        setValues: (values) => set({ values }),
        setErrors: (errors) => set({ errors }),
        setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
        setTouched: (touched) => set({ touched }),
        setFieldValue: (name, value) =>
            set((state) => ({
                values: {
                    ...state.values,
                    [name]: value,
                },
            })),
        reset: (initialValues) =>
            set({
                values: initialValues,
                errors: {},
                isSubmitting: false,
                touched: {},
            }),
    }));
}
