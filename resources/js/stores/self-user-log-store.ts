import { create } from 'zustand';
import type { SelfUserLogFilters } from '@/types';

interface SelfUserLogState {
    filters: SelfUserLogFilters;
    isLoading: boolean;
    initialize: (filters: SelfUserLogFilters) => void;
    setFilters: (filters: Partial<SelfUserLogFilters>) => void;
    setIsLoading: (isLoading: boolean) => void;
    reset: () => void;
    getFilterParams: () => Record<string, string>;
}

const defaultFilters: SelfUserLogFilters = {
    event_type: '',
    date_from: '',
    date_to: '',
    per_page: 10,
};

export const useSelfUserLogStore = create<SelfUserLogState>()((set, get) => ({
    filters: { ...defaultFilters },
    isLoading: false,

    initialize: (filters) => {
        set({
            filters: { ...defaultFilters, ...filters },
            isLoading: false,
        });
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }));
    },

    setIsLoading: (isLoading) => {
        set({ isLoading });
    },

    reset: () => {
        set({
            filters: { ...defaultFilters },
            isLoading: false,
        });
    },

    getFilterParams: () => {
        const { filters } = get();
        const params: Record<string, string> = {};

        if (filters.event_type.trim() !== '') {
            params.event_type = filters.event_type.trim();
        }

        if (filters.date_from.trim() !== '') {
            params.date_from = filters.date_from.trim();
        }

        if (filters.date_to.trim() !== '') {
            params.date_to = filters.date_to.trim();
        }

        if (filters.per_page !== 10) {
            params.per_page = String(filters.per_page);
        }

        return params;
    },
}));

export const selectSelfUserLogFilters = (state: SelfUserLogState) =>
    state.filters;
export const selectSelfUserLogLoading = (state: SelfUserLogState) =>
    state.isLoading;
