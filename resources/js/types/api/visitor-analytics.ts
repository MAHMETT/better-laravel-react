export interface VisitorAnalyticsFilters {
    date_from: string;
    date_to: string;
    time_from: string;
    time_to: string;
    preset: AnalyticsPreset;
    granularity: ChartGranularity;
    per_page: number;
}

export type AnalyticsPreset =
    | 'today'
    | 'yesterday'
    | 'this_week'
    | 'last_week'
    | 'this_month'
    | 'last_month'
    | 'this_year'
    | 'custom';

export type ChartGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface VisitorSummary {
    total_visitors: number;
    new_visitors: number;
    loyal_visitors: number;
    other_visitors: number;
}

export interface DeviceDistribution {
    desktop: number;
    mobile: number;
    tablet: number;
    unknown: number;
}

export interface UserTypeDistribution {
    users: number;
    guests: number;
}

export interface AnalyticsSummaryResponse {
    summary: VisitorSummary;
    device_distribution: DeviceDistribution;
    user_type: UserTypeDistribution;
    date_range: {
        from: string;
        to: string;
    };
}

export interface ChartDataPoint {
    period: string;
    visits: number;
    unique_visitors: number;
}

export interface ChartDataResponse {
    chart_data: ChartDataPoint[];
    granularity: ChartGranularity;
    date_range: {
        from: string;
        to: string;
    };
}

export interface TopRoute {
    route_path: string;
    route_name: string | null;
    visits: number;
}

export interface TopRoutesResponse {
    top_routes: TopRoute[];
}

export interface TopReferrer {
    referrer: string;
    visits: number;
}

export interface TopReferrersResponse {
    top_referrers: TopReferrer[];
}
