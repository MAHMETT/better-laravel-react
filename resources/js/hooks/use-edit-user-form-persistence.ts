import { useEffect, useCallback } from 'react';
import type { EditUserFormData } from '@/types';

const getStorageKey = (userId: number) => `edit_user_${userId}_form_data`;

interface UseEditUserFormPersistenceOptions {
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
 * Hook for persisting edit user form data to localStorage
 * Automatically saves form data and restores on page reload
 */
export function useEditUserFormPersistence(
    userId: number,
    formData: EditUserFormData,
    setFormData: (data: EditUserFormData) => void,
    originalData: EditUserFormData,
    options: UseEditUserFormPersistenceOptions = {}
) {
    const {
        enabled = true,
        saveInterval = 1000,
        clearOnSubmit = true,
    } = options;

    const storageKey = getStorageKey(userId);

    // Restore form data from localStorage on mount or user change
    useEffect(() => {
        if (!enabled) return;

        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const parsed = JSON.parse(savedData) as EditUserFormData;
                // Only restore if form matches original data (fresh page load)
                const isUnmodified =
                    formData.name === originalData.name &&
                    formData.email === originalData.email &&
                    formData.role === originalData.role &&
                    formData.status === originalData.status &&
                    !formData.password;

                if (isUnmodified) {
                    setFormData(parsed);
                }
            }
        } catch (error) {
            console.error('Failed to restore edit user form data:', error);
            localStorage.removeItem(storageKey);
        }
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-save form data to localStorage
    useEffect(() => {
        if (!enabled) return;

        const timer = setTimeout(() => {
            try {
                // Only save if form has changes from original
                const hasChanges =
                    formData.name !== originalData.name ||
                    formData.email !== originalData.email ||
                    formData.role !== originalData.role ||
                    formData.status !== originalData.status ||
                    formData.password ||
                    formData.password_confirmation;

                if (hasChanges) {
                    localStorage.setItem(storageKey, JSON.stringify(formData));
                } else {
                    // Clear if no changes
                    localStorage.removeItem(storageKey);
                }
            } catch (error) {
                console.error('Failed to save edit user form data:', error);
            }
        }, saveInterval);

        return () => clearTimeout(timer);
    }, [formData, originalData, storageKey, enabled, saveInterval]);

    // Clear form data from localStorage
    const clearFormData = useCallback(() => {
        if (clearOnSubmit) {
            try {
                localStorage.removeItem(storageKey);
            } catch (error) {
                console.error('Failed to clear edit user form data:', error);
            }
        }
    }, [storageKey, clearOnSubmit]);

    // Check if there's saved data
    const hasSavedData = useCallback(() => {
        try {
            const savedData = localStorage.getItem(storageKey);
            return !!savedData;
        } catch {
            return false;
        }
    }, [storageKey]);

    // Manually clear saved data
    const discardSavedData = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error('Failed to discard edit user form data:', error);
        }
    }, [storageKey]);

    return {
        clearFormData,
        hasSavedData,
        discardSavedData,
    };
}
