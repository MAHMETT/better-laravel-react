export interface VisitorAnalyticsFilters {
    search: string;
    location: string;
    site: string;
    status: string;
    purpose: string;
    date_from: string;
    date_to: string;
    time_range: TimeRangeOption;
    chart_mode: ChartMode;
}

export type TimeRangeOption = 'today' | 'this_week' | 'this_month' | 'custom';

export type ChartMode = 'monthly' | 'yearly';

export interface KpiStats {
    todays_visitors: number;
    checked_in: number;
    checked_out: number;
    yet_to_check_out: number;
    returning_visitors: number;
    percentage_change: number;
}

export interface KpiStatsResponse {
    kpi_stats: KpiStats;
}

export interface DailyVisitData {
    label: string;
    visits?: number;
    this_week?: number;
    last_week?: number;
}

export interface DailyVisitsResponse {
    daily_visits: DailyVisitData[];
    mode: ChartMode;
}

export interface PeakHourData {
    hour: string;
    visits: number;
}

export interface PeakHourResponse {
    peak_hour_data: PeakHourData[];
    peak_hour: string;
    peak_visits: number;
}

export interface ReturningVisitorsData {
    recurring: {
        count: number;
        percentage: number;
    };
    one_time: {
        count: number;
        percentage: number;
    };
}

export interface ReturningVisitorsResponse {
    returning_visitors: ReturningVisitorsData;
}

export interface PurposeData {
    purpose: string;
    visits: number;
}

export interface PurposeOfVisitResponse {
    purpose_of_visit: PurposeData[];
}

export interface RegionData {
    region: string;
    country_code: string;
    visits: number;
}

export interface RegionDistributionResponse {
    region_distribution: RegionData[];
}

export interface LiveFeedItem {
    id: number;
    visitor_id: string;
    full_name: string;
    status: 'checked_in' | 'checked_out';
    time_ago: string;
    action: 'IN' | 'OUT';
}

export interface LiveFeedResponse {
    live_feed: LiveFeedItem[];
}

export interface ExportResponse {
    success: boolean;
    message: string;
}
