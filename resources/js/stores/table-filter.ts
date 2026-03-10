import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';

interface TableFilterState {
    search: string;
    debouncedSearch: string;
    page: number;
    perPage: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    filters: Record<string, string>;
    setSearch: (search: string) => void;
    setDebouncedSearch: (search: string) => void;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    setSortBy: (sortBy: string) => void;
    setSortDirection: (direction: 'asc' | 'desc') => void;
    setFilter: (key: string, value: string) => void;
    reset: () => void;
}

const initialState: Omit<
    TableFilterState,
    | 'setSearch'
    | 'setDebouncedSearch'
    | 'setPage'
    | 'setPerPage'
    | 'setSortBy'
    | 'setSortDirection'
    | 'setFilter'
    | 'reset'
> = {
    search: '',
    debouncedSearch: '',
    page: 1,
    perPage: 10,
    sortBy: 'created_at',
    sortDirection: 'desc',
    filters: {},
};

const useTableFilterStoreBase = create<TableFilterState>()((set) => ({
    ...initialState,

    setSearch: (search) => {
        set({ search });
    },

    setDebouncedSearch: (debouncedSearch) => {
        set({ debouncedSearch });
    },

    setPage: (page) => {
        set({ page });
    },

    setPerPage: (perPage) => {
        set({ perPage });
    },

    setSortBy: (sortBy) => {
        set({ sortBy });
    },

    setSortDirection: (sortDirection) => {
        set({ sortDirection });
    },

    setFilter: (key, value) => {
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        }));
    },

    reset: () => {
        set(initialState);
    },
}));

export const useTableFilterStore = createSelectors(useTableFilterStoreBase);
