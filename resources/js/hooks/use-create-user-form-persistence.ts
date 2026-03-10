import { useEffect, useCallback } from 'react';
import type { CreateUserFormData } from '@/types';

const STORAGE_KEY = 'create_user_form_data';

interface UseCreateUserFormPersistenceOptions {
    /**
     * Enable auto-save
     * @default true
     */
    enabled?: boolean;

    /**
     * Auto-save interval in ms
     * @default 1000 (1 second)
     */
    saveInterval?: number;

    /**
     * Clear form data after successful submit
     */
    clearOnSubmit?: boolean;
}

/**
 * Hook for persisting create user form data to localStorage
 * Automatically saves form data and restores on page reload
 */
export function useCreateUserFormPersistence(
    formData: CreateUserFormData,
    setFormData: (data: CreateUserFormData) => void,
    options: UseCreateUserFormPersistenceOptions = {}
) {
    const {
        enabled = true,
        saveInterval = 1000,
        clearOnSubmit = true,
    } = options;

    // Restore form data from localStorage on mount
    useEffect(() => {
        if (!enabled) return;

        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData) as CreateUserFormData;
                // Only restore if form is empty (fresh page load)
                if (
                    !formData.name &&
                    !formData.email &&
                    !formData.password
                ) {
                    setFormData(parsed);
                }
            }
        } catch (error) {
            console.error('Failed to restore create user form data:', error);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-save form data to localStorage
    useEffect(() => {
        if (!enabled) return;

        const timer = setTimeout(() => {
            try {
                // Only save if form has data
                if (formData.name || formData.email || formData.password) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
                }
            } catch (error) {
                console.error('Failed to save create user form data:', error);
            }
        }, saveInterval);

        return () => clearTimeout(timer);
    }, [formData, enabled, saveInterval]);

    // Clear form data from localStorage
    const clearFormData = useCallback(() => {
        if (clearOnSubmit) {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.error('Failed to clear create user form data:', error);
            }
        }
    }, [clearOnSubmit]);

    // Check if there's saved data
    const hasSavedData = useCallback(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            return !!savedData;
        } catch {
            return false;
        }
    }, []);

    // Manually clear saved data
    const discardSavedData = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to discard create user form data:', error);
        }
    }, []);

    return {
        clearFormData,
        hasSavedData,
        discardSavedData,
    };
}
