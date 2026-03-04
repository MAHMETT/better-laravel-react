import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface UserFilters {
    search: string;
    status: string;
    role: string;
    per_page: number;
}

export interface UserFiltersState {
    filters: UserFilters;
    setSearch: (search: string) => void;
    setStatus: (status: string) => void;
    setRole: (role: string) => void;
    setPerPage: (per_page: number) => void;
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

export const useUserFiltersStore = create<UserFiltersState>()(
    subscribeWithSelector((set, get) => ({
        filters: { ...defaultFilters },

        setSearch: (search: string) =>
            set((state) => ({ filters: { ...state.filters, search } })),

        setStatus: (status: string) =>
            set((state) => ({ filters: { ...state.filters, status } })),

        setRole: (role: string) =>
            set((state) => ({ filters: { ...state.filters, role } })),

        setPerPage: (per_page: number) =>
            set((state) => ({ filters: { ...state.filters, per_page } })),

        setFilters: (newFilters: Partial<UserFilters>) =>
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
    })),
);

export const selectSearch = (state: UserFiltersState) => state.filters.search;
export const selectStatus = (state: UserFiltersState) => state.filters.status;
export const selectRole = (state: UserFiltersState) => state.filters.role;
export const selectPerPage = (state: UserFiltersState) =>
    state.filters.per_page;
export const selectFilterParams = (state: UserFiltersState) =>
    state.getFilterParams();
