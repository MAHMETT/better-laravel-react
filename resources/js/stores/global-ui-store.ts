import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';

interface GlobalUIState {
    // Sidebar state
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Modal states
    modals: Record<string, boolean>;

    // Theme state
    theme: 'light' | 'dark' | 'system';

    // Actions
    setSidebarOpen: (open: boolean) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
    setModal: (modalName: string, isOpen: boolean) => void;
    openModal: (modalName: string) => void;
    closeModal: (modalName: string) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    reset: () => void;
}

const useGlobalUIStoreBase = create<GlobalUIState>((set) => ({
    // Initial state
    sidebarOpen: true,
    sidebarCollapsed: false,
    modals: {},
    theme: 'system',

    // Sidebar actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    // Modal actions
    setModal: (modalName, isOpen) =>
        set((state) => ({
            modals: { ...state.modals, [modalName]: isOpen },
        })),
    openModal: (modalName) =>
        set((state) => ({
            modals: { ...state.modals, [modalName]: true },
        })),
    closeModal: (modalName) =>
        set((state) => ({
            modals: { ...state.modals, [modalName]: false },
        })),

    // Theme actions
    setTheme: (theme) => set({ theme }),

    // Reset state
    reset: () =>
        set({
            sidebarOpen: true,
            sidebarCollapsed: false,
            modals: {},
            theme: 'system',
        }),
}));

export const useGlobalUIStore = createSelectors(useGlobalUIStoreBase);
