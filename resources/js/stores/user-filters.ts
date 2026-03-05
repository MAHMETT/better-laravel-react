import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';

export interface UserFilters {
    search: string;
    status: string;
    role: string;
    per_page: number;
}

interface UserFiltersState {
    filters: UserFilters;
    setFilters: (filters: Partial<UserFilters>) => void;
    resetFilters: () => void;
    getFilterParams: () => Record<string, string>;
}

const defaultFilters: UserFilters = {
    search: '',
    status: '',
    role: '',
    per_page: 10,
};

const useUserFiltersStoreBase = create<UserFiltersState>()((set, get) => ({
    filters: { ...defaultFilters },

    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),

    resetFilters: () => set({ filters: { ...defaultFilters } }),

    getFilterParams: () => {
        const { filters } = get();
        const params: Record<string, string> = {};

        if (filters.search && filters.search !== '') {
            params.search = filters.search;
        }
        if (
            filters.status &&
            filters.status !== '' &&
            filters.status !== 'all'
        ) {
            params.status = filters.status;
        }
        if (filters.role && filters.role !== '' && filters.role !== 'all') {
            params.role = filters.role;
        }
        if (filters.per_page && filters.per_page !== 10) {
            params.per_page = String(filters.per_page);
        }

        return params;
    },
}));

export const useUserFiltersStore = createSelectors(useUserFiltersStoreBase);
