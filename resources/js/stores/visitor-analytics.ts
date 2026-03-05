import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';
import type {
    VisitorAnalyticsFilters,
    AnalyticsPreset,
    ChartGranularity,
    VisitorSummary,
    DeviceDistribution,
    UserTypeDistribution,
    ChartDataPoint,
    TopRoute,
    TopReferrer,
} from '@/types';

const defaultFilters: VisitorAnalyticsFilters = {
    date_from: new Date().toISOString().split('T')[0]!,
    date_to: new Date().toISOString().split('T')[0]!,
    time_from: '0',
    time_to: '23',
    preset: 'today',
    granularity: 'daily',
    per_page: 10,
};

interface VisitorAnalyticsState {
    // Filters
    filters: VisitorAnalyticsFilters;

    // Summary data
    summary: VisitorSummary | null;
    deviceDistribution: DeviceDistribution | null;
    userTypeDistribution: UserTypeDistribution | null;

    // Chart data
    chartData: ChartDataPoint[];
    chartGranularity: ChartGranularity;

    // Top routes and referrers
    topRoutes: TopRoute[];
    topReferrers: TopReferrer[];

    // Loading states
    isLoading: boolean;
    isSummaryLoading: boolean;
    isChartLoading: boolean;

    // Actions
    setFilters: (filters: Partial<VisitorAnalyticsFilters>) => void;
    resetFilters: () => void;
    setPreset: (preset: AnalyticsPreset) => void;
    setGranularity: (granularity: ChartGranularity) => void;
    setDateRange: (from: string, to: string) => void;
    setTimeRange: (from: string, to: string) => void;
    setSummary: (summary: VisitorSummary) => void;
    setDeviceDistribution: (distribution: DeviceDistribution) => void;
    setUserTypeDistribution: (distribution: UserTypeDistribution) => void;
    setChartData: (data: ChartDataPoint[], granularity: ChartGranularity) => void;
    setTopRoutes: (routes: TopRoute[]) => void;
    setTopReferrers: (referrers: TopReferrer[]) => void;
    setLoading: (loading: boolean) => void;
    setSummaryLoading: (loading: boolean) => void;
    setChartLoading: (loading: boolean) => void;
    getFilterParams: () => Record<string, string>;
}

const useVisitorAnalyticsStoreBase = create<VisitorAnalyticsState>()((set, get) => ({
    // Initial state
    filters: { ...defaultFilters },
    summary: null,
    deviceDistribution: null,
    userTypeDistribution: null,
    chartData: [],
    chartGranularity: 'daily',
    topRoutes: [],
    topReferrers: [],
    isLoading: false,
    isSummaryLoading: false,
    isChartLoading: false,

    // Set multiple filters at once
    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),

    // Reset to default filters
    resetFilters: () => set({ filters: { ...defaultFilters } }),

    // Set preset and update date range accordingly
    setPreset: (preset: AnalyticsPreset) =>
        set((state) => {
            const dateRange = getDateRangeFromPreset(preset);
            return {
                filters: {
                    ...state.filters,
                    preset,
                    date_from: dateRange.from,
                    date_to: dateRange.to,
                },
            };
        }),

    // Set chart granularity
    setGranularity: (granularity: ChartGranularity) =>
        set((state) => ({
            filters: { ...state.filters, granularity },
            chartGranularity: granularity,
        })),

    // Set custom date range
    setDateRange: (from: string, to: string) =>
        set((state) => ({
            filters: {
                ...state.filters,
                date_from: from,
                date_to: to,
                preset: 'custom',
            },
        })),

    // Set time range
    setTimeRange: (from: string, to: string) =>
        set((state) => ({
            filters: {
                ...state.filters,
                time_from: from,
                time_to: to,
            },
        })),

    // Set summary data
    setSummary: (summary: VisitorSummary) => set({ summary }),

    // Set device distribution
    setDeviceDistribution: (distribution: DeviceDistribution) =>
        set({ deviceDistribution: distribution }),

    // Set user type distribution
    setUserTypeDistribution: (distribution: UserTypeDistribution) =>
        set({ userTypeDistribution: distribution }),

    // Set chart data
    setChartData: (data: ChartDataPoint[], granularity: ChartGranularity) =>
        set({ chartData: data, chartGranularity: granularity }),

    // Set top routes
    setTopRoutes: (routes: TopRoute[]) => set({ topRoutes: routes }),

    // Set top referrers
    setTopReferrers: (referrers: TopReferrer[]) => set({ topReferrers: referrers }),

    // Set loading state
    setLoading: (loading: boolean) => set({ isLoading: loading }),

    // Set summary loading state
    setSummaryLoading: (loading: boolean) => set({ isSummaryLoading: loading }),

    // Set chart loading state
    setChartLoading: (loading: boolean) => set({ isChartLoading: loading }),

    // Get filter params for API requests
    getFilterParams: () => {
        const { filters } = get();
        const params: Record<string, string> = {};

        if (filters.date_from) {
            params.date_from = filters.date_from;
        }
        if (filters.date_to) {
            params.date_to = filters.date_to;
        }
        if (filters.time_from && filters.time_from !== '0') {
            params.time_from = filters.time_from;
        }
        if (filters.time_to && filters.time_to !== '23') {
            params.time_to = filters.time_to;
        }
        if (filters.preset) {
            params.preset = filters.preset;
        }
        if (filters.granularity) {
            params.granularity = filters.granularity;
        }
        if (filters.per_page && filters.per_page !== 10) {
            params.per_page = String(filters.per_page);
        }

        return params;
    },
}));

export const useVisitorAnalyticsStore = createSelectors(
    useVisitorAnalyticsStoreBase,
);

/**
 * Get date range from preset filter.
 */
function getDateRangeFromPreset(preset: AnalyticsPreset): {
    from: string;
    to: string;
} {
    const today = new Date();
    const from = new Date();
    const to = new Date();

    switch (preset) {
        case 'today':
            return {
                from: today.toISOString().split('T')[0]!,
                to: today.toISOString().split('T')[0]!,
            };
        case 'yesterday':
            from.setDate(today.getDate() - 1);
            return {
                from: from.toISOString().split('T')[0]!,
                to: from.toISOString().split('T')[0]!,
            };
        case 'this_week':
            from.setDate(today.getDate() - today.getDay());
            return {
                from: from.toISOString().split('T')[0]!,
                to: today.toISOString().split('T')[0]!,
            };
        case 'last_week':
            from.setDate(today.getDate() - today.getDay() - 7);
            to.setDate(today.getDate() - today.getDay() - 1);
            return {
                from: from.toISOString().split('T')[0]!,
                to: to.toISOString().split('T')[0]!,
            };
        case 'this_month':
            from.setDate(1);
            return {
                from: from.toISOString().split('T')[0]!,
                to: today.toISOString().split('T')[0]!,
            };
        case 'last_month':
            from.setMonth(today.getMonth() - 1);
            from.setDate(1);
            to.setMonth(today.getMonth());
            to.setDate(0);
            return {
                from: from.toISOString().split('T')[0]!,
                to: to.toISOString().split('T')[0]!,
            };
        case 'this_year':
            from.setMonth(0, 1);
            return {
                from: from.toISOString().split('T')[0]!,
                to: today.toISOString().split('T')[0]!,
            };
        case 'custom':
        default:
            from.setDate(today.getDate() - 30);
            return {
                from: from.toISOString().split('T')[0]!,
                to: today.toISOString().split('T')[0]!,
            };
    }
}
