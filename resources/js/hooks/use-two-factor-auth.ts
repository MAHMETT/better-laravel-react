import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { qrCode, recoveryCodes, secretKey } from '@/routes/two-factor';
import type { TwoFactorSecretKey, TwoFactorSetupData } from '@/types';

export interface UseTwoFactorAuthReturn {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    recoveryCodesList: string[];
    hasSetupData: boolean;
    errors: string[];
    clearErrors: () => void;
    clearSetupData: () => void;
    fetchQrCode: () => Promise<void>;
    fetchSetupKey: () => Promise<void>;
    fetchSetupData: () => Promise<void>;
    fetchRecoveryCodes: () => Promise<void>;
}

export const OTP_MAX_LENGTH = 6;

interface TwoFactorAuthState {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    recoveryCodesList: string[];
    errors: string[];
}

interface TwoFactorAuthActions {
    setQrCodeSvg: (qrCodeSvg: string | null) => void;
    setManualSetupKey: (manualSetupKey: string | null) => void;
    setRecoveryCodesList: (recoveryCodesList: string[]) => void;
    setErrors: (errors: string[]) => void;
    appendError: (error: string) => void;
    clearErrors: () => void;
    clearSetupData: () => void;
}

type TwoFactorAuthStore = TwoFactorAuthState & TwoFactorAuthActions;

const fetchJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
    }

    return response.json();
};

const createTwoFactorAuthStore = () =>
    createStore<TwoFactorAuthStore>((set) => ({
        qrCodeSvg: null,
        manualSetupKey: null,
        recoveryCodesList: [],
        errors: [],
        setQrCodeSvg: (qrCodeSvg) => {
            set({ qrCodeSvg });
        },
        setManualSetupKey: (manualSetupKey) => {
            set({ manualSetupKey });
        },
        setRecoveryCodesList: (recoveryCodesList) => {
            set({ recoveryCodesList });
        },
        setErrors: (errors) => {
            set({ errors });
        },
        appendError: (error) => {
            set((state) => ({
                errors: [...state.errors, error],
            }));
        },
        clearErrors: () => {
            set({ errors: [] });
        },
        clearSetupData: () => {
            set({
                manualSetupKey: null,
                qrCodeSvg: null,
                errors: [],
            });
        },
    }));

export const useTwoFactorAuth = (): UseTwoFactorAuthReturn => {
    const store = useMemo(() => createTwoFactorAuthStore(), []);

    const qrCodeSvg = useStore(store, (state) => state.qrCodeSvg);
    const manualSetupKey = useStore(store, (state) => state.manualSetupKey);
    const recoveryCodesList = useStore(
        store,
        (state) => state.recoveryCodesList,
    );
    const errors = useStore(store, (state) => state.errors);

    const setQrCodeSvg = useStore(store, (state) => state.setQrCodeSvg);
    const setManualSetupKey = useStore(
        store,
        (state) => state.setManualSetupKey,
    );
    const setRecoveryCodesList = useStore(
        store,
        (state) => state.setRecoveryCodesList,
    );
    const appendError = useStore(store, (state) => state.appendError);
    const clearErrors = useStore(store, (state) => state.clearErrors);
    const clearSetupData = useStore(store, (state) => state.clearSetupData);

    const hasSetupData = useMemo<boolean>(
        () => qrCodeSvg !== null && manualSetupKey !== null,
        [qrCodeSvg, manualSetupKey],
    );

    const fetchQrCode = useCallback(async (): Promise<void> => {
        try {
            const { svg } = await fetchJson<TwoFactorSetupData>(qrCode.url());
            setQrCodeSvg(svg);
        } catch {
            appendError('Failed to fetch QR code');
            setQrCodeSvg(null);
        }
    }, [appendError, setQrCodeSvg]);

    const fetchSetupKey = useCallback(async (): Promise<void> => {
        try {
            const { secretKey: key } = await fetchJson<TwoFactorSecretKey>(
                secretKey.url(),
            );
            setManualSetupKey(key);
        } catch {
            appendError('Failed to fetch a setup key');
            setManualSetupKey(null);
        }
    }, [appendError, setManualSetupKey]);

    const fetchRecoveryCodes = useCallback(async (): Promise<void> => {
        try {
            clearErrors();
            const codes = await fetchJson<string[]>(recoveryCodes.url());
            setRecoveryCodesList(codes);
        } catch {
            appendError('Failed to fetch recovery codes');
            setRecoveryCodesList([]);
        }
    }, [appendError, clearErrors, setRecoveryCodesList]);

    const fetchSetupData = useCallback(async (): Promise<void> => {
        clearErrors();
        await Promise.all([fetchQrCode(), fetchSetupKey()]);
    }, [clearErrors, fetchQrCode, fetchSetupKey]);

    return {
        qrCodeSvg,
        manualSetupKey,
        recoveryCodesList,
        hasSetupData,
        errors,
        clearErrors,
        clearSetupData,
        fetchQrCode,
        fetchSetupKey,
        fetchSetupData,
        fetchRecoveryCodes,
    };
};
