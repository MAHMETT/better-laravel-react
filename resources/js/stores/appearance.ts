import { create } from 'zustand';
import type { Appearance, ResolvedAppearance } from '@/hooks/use-appearance';

interface AppearanceState {
    appearance: Appearance;
    resolvedAppearance: ResolvedAppearance;
    isOpen: boolean;
    setAppearance: (appearance: Appearance) => void;
    setResolvedAppearance: (resolved: ResolvedAppearance) => void;
    setIsOpen: (isOpen: boolean) => void;
    toggle: () => void;
    reset: () => void;
}

const getDefaultAppearance = (): Appearance => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('appearance') as Appearance) || 'system';
};

const getResolvedAppearance = (appearance: Appearance): ResolvedAppearance => {
    if (appearance === 'system') {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return appearance;
};

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
    appearance: getDefaultAppearance(),
    resolvedAppearance: getResolvedAppearance(getDefaultAppearance()),
    isOpen: false,
    setAppearance: (appearance) => {
        localStorage.setItem('appearance', appearance);
        document.cookie = `appearance=${appearance};path=/;max-age=31536000;SameSite=Lax`;
        
        const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
        
        set({ 
            appearance,
            resolvedAppearance: getResolvedAppearance(appearance),
        });
    },
    setResolvedAppearance: (resolvedAppearance) => {
        set({ resolvedAppearance });
    },
    setIsOpen: (isOpen) => {
        set({ isOpen });
    },
    toggle: () => {
        const current = get().appearance;
        const next: Appearance = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
        get().setAppearance(next);
    },
    reset: () => {
        const appearance = getDefaultAppearance();
        set({
            appearance,
            resolvedAppearance: getResolvedAppearance(appearance),
            isOpen: false,
        });
    },
}));

// Subscribe to system theme changes
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const state = useAppearanceStore.getState();
        if (state.appearance === 'system') {
            state.setAppearance('system');
        }
    });
}
