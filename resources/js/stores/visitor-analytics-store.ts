import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';
import type {
    VisitorAnalyticsFilters,
    TimeRangeOption,
    ChartMode,
    KpiStats,
    DailyVisitData,
    PeakHourData,
    ReturningVisitorsData,
    PurposeData,
    RegionData,
    LiveFeedItem,
} from '@/types';

const defaultFilters: VisitorAnalyticsFilters = {
    search: '',
    location: '',
    site: '',
    status: '',
    purpose: '',
    date_from: new Date().toISOString().split('T')[0]!,
    date_to: new Date().toISOString().split('T')[0]!,
    time_range: 'today',
    chart_mode: 'monthly',
};

interface VisitorAnalyticsState {
    // Filters
    filters: VisitorAnalyticsFilters;

    // KPI Stats
    kpiStats: KpiStats | null;

    // Chart Data
    dailyVisits: DailyVisitData[];
    peakHourData: PeakHourData[];
    peakHour: string;
    peakVisits: number;
    returningVisitors: ReturningVisitorsData | null;
    purposeOfVisit: PurposeData[];
    regionDistribution: RegionData[];
    liveFeed: LiveFeedItem[];

    // Loading states
    isLoading: boolean;
    isKpiLoading: boolean;
    isChartLoading: boolean;
    isFeedLoading: boolean;

    // Actions
    setFilters: (filters: Partial<VisitorAnalyticsFilters>) => void;
    resetFilters: () => void;
    setTimeRange: (timeRange: TimeRangeOption) => void;
    setChartMode: (chartMode: ChartMode) => void;
    setSearchQuery: (query: string) => void;
    setKpiStats: (stats: KpiStats) => void;
    setDailyVisits: (data: DailyVisitData[], mode: ChartMode) => void;
    setPeakHourData: (data: PeakHourData[], peakHour: string, peakVisits: number) => void;
    setReturningVisitors: (data: ReturningVisitorsData) => void;
    setPurposeOfVisit: (data: PurposeData[]) => void;
    setRegionDistribution: (data: RegionData[]) => void;
    setLiveFeed: (data: LiveFeedItem[]) => void;
    setLoading: (loading: boolean) => void;
    setKpiLoading: (loading: boolean) => void;
    setChartLoading: (loading: boolean) => void;
    setFeedLoading: (loading: boolean) => void;
    getFilterParams: () => Record<string, string>;
}

const useVisitorAnalyticsStoreBase = create<VisitorAnalyticsState>()((set, get) => ({
    // Initial state
    filters: { ...defaultFilters },
    kpiStats: null,
    dailyVisits: [],
    peakHourData: [],
    peakHour: '',
    peakVisits: 0,
    returningVisitors: null,
    purposeOfVisit: [],
    regionDistribution: [],
    liveFeed: [],
    isLoading: false,
    isKpiLoading: false,
    isChartLoading: false,
    isFeedLoading: false,

    // Set multiple filters at once
    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),

    // Reset to default filters
    resetFilters: () => set({ filters: { ...defaultFilters } }),

    // Set time range
    setTimeRange: (timeRange: TimeRangeOption) =>
        set((state) => {
            const dateRange = getDateRangeFromTimeRange(timeRange);
            return {
                filters: {
                    ...state.filters,
                    time_range: timeRange,
                    date_from: dateRange.from,
                    date_to: dateRange.to,
                },
            };
        }),

    // Set chart mode
    setChartMode: (chartMode: ChartMode) =>
        set((state) => ({
            filters: { ...state.filters, chart_mode: chartMode },
        })),

    // Set search query
    setSearchQuery: (query: string) =>
        set((state) => ({
            filters: { ...state.filters, search: query },
        })),

    // Set KPI stats
    setKpiStats: (stats: KpiStats) => set({ kpiStats: stats }),

    // Set daily visits
    setDailyVisits: (data: DailyVisitData[], mode: ChartMode) =>
        set((state) => ({
            dailyVisits: data,
            filters: { ...state.filters, chart_mode: mode },
        })),

    // Set peak hour data
    setPeakHourData: (data: PeakHourData[], peakHour: string, peakVisits: number) =>
        set({ peakHourData: data, peakHour, peakVisits }),

    // Set returning visitors
    setReturningVisitors: (data: ReturningVisitorsData) => set({ returningVisitors: data }),

    // Set purpose of visit
    setPurposeOfVisit: (data: PurposeData[]) => set({ purposeOfVisit: data }),

    // Set region distribution
    setRegionDistribution: (data: RegionData[]) => set({ regionDistribution: data }),

    // Set live feed
    setLiveFeed: (data: LiveFeedItem[]) => set({ liveFeed: data }),

    // Set loading state
    setLoading: (loading: boolean) => set({ isLoading: loading }),

    // Set KPI loading state
    setKpiLoading: (loading: boolean) => set({ isKpiLoading: loading }),

    // Set chart loading state
    setChartLoading: (loading: boolean) => set({ isChartLoading: loading }),

    // Set feed loading state
    setFeedLoading: (loading: boolean) => set({ isFeedLoading: loading }),

    // Get filter params for API requests
    getFilterParams: () => {
        const { filters } = get();
        const params: Record<string, string> = {};

        if (filters.search) {
            params.search = filters.search;
        }
        if (filters.location) {
            params.location = filters.location;
        }
        if (filters.site) {
            params.site = filters.site;
        }
        if (filters.status) {
            params.status = filters.status;
        }
        if (filters.purpose) {
            params.purpose = filters.purpose;
        }
        if (filters.date_from) {
            params.date_from = filters.date_from;
        }
        if (filters.date_to) {
            params.date_to = filters.date_to;
        }
        if (filters.time_range) {
            params.time_range = filters.time_range;
        }
        if (filters.chart_mode) {
            params.chart_mode = filters.chart_mode;
        }

        return params;
    },
}));

export const useVisitorAnalyticsStore = createSelectors(
    useVisitorAnalyticsStoreBase,
);

/**
 * Get date range from time range preset.
 */
function getDateRangeFromTimeRange(timeRange: TimeRangeOption): { from: string; to: string } {
    const today = new Date();
    const from = new Date();
    const to = new Date();

    switch (timeRange) {
        case 'today':
            return {
                from: today.toISOString().split('T')[0]!,
                to: today.toISOString().split('T')[0]!,
            };
        case 'this_week':
            from.setDate(today.getDate() - today.getDay());
            return {
                from: from.toISOString().split('T')[0]!,
                to: today.toISOString().split('T')[0]!,
            };
        case 'this_month':
            from.setDate(1);
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
