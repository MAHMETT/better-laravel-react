import { Head } from '@inertiajs/react';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    AnalyticsFilters,
    SummaryCards,
    DistributionCards,
    TrafficChart,
    TopRoutes,
    TopReferrers,
} from '@/components/analytics';
import { useVisitorAnalyticsStore } from '@/stores/visitor-analytics';
import type {
    AnalyticsSummaryResponse,
    ChartDataResponse,
    TopRoutesResponse,
    TopReferrersResponse,
    VisitorAnalyticsFilters,
} from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
    filters: VisitorAnalyticsFilters;
}

const breadcrumbs = [
    {
        title: 'Analytics',
        href: '/admin/analytics',
    },
];

export default function AnalyticsIndex({ filters: initialFilters }: Props) {
    const store = useVisitorAnalyticsStore;

    const summary = store.use.summary();
    const deviceDistribution = store.use.deviceDistribution();
    const userTypeDistribution = store.use.userTypeDistribution();
    const chartData = store.use.chartData();
    const chartGranularity = store.use.chartGranularity();
    const topRoutes = store.use.topRoutes();
    const topReferrers = store.use.topReferrers();
    const isLoading = store.use.isLoading();
    const isChartLoading = store.use.isChartLoading();
    const isSummaryLoading = store.use.isSummaryLoading();
    const [hasError, setHasError] = React.useState(false);

    const setFilters = store.use.setFilters();
    const getFilterParams = store.use.getFilterParams();
    const setSummary = store.use.setSummary();
    const setDeviceDistribution = store.use.setDeviceDistribution();
    const setUserTypeDistribution = store.use.setUserTypeDistribution();
    const setChartData = store.use.setChartData();
    const setTopRoutes = store.use.setTopRoutes();
    const setTopReferrers = store.use.setTopReferrers();
    const setLoading = store.use.setLoading();
    const setSummaryLoading = store.use.setSummaryLoading();
    const setChartLoading = store.use.setChartLoading();

    // Fetch analytics data
    const fetchAnalyticsData = useCallback(
        async (showLoading = true, customFilters?: VisitorAnalyticsFilters) => {
            const filtersToUse = customFilters || getFilterParams();
            const queryString = new URLSearchParams(filtersToUse).toString();

            if (showLoading) {
                setLoading(true);
                setSummaryLoading(true);
                setChartLoading(true);
            }

            try {
                setHasError(false);
                // Fetch all data in parallel
                const [summaryRes, chartRes, routesRes, referrersRes] = await Promise.all([
                    fetch(`/admin/analytics/summary?${queryString}`)
                        .then((res) => res.json() as Promise<AnalyticsSummaryResponse>),
                    fetch(`/admin/analytics/chart-data?${queryString}`)
                        .then((res) => res.json() as Promise<ChartDataResponse>),
                    fetch(`/admin/analytics/top-routes?${queryString}`)
                        .then((res) => res.json() as Promise<TopRoutesResponse>),
                    fetch(`/admin/analytics/top-referrers?${queryString}`)
                        .then((res) => res.json() as Promise<TopReferrersResponse>),
                ]);

                // Set summary data
                if (summaryRes.summary) {
                    setSummary(summaryRes.summary);
                    setDeviceDistribution(summaryRes.device_distribution);
                    setUserTypeDistribution(summaryRes.user_type);
                }

                // Set chart data
                if (chartRes.chart_data) {
                    setChartData(chartRes.chart_data, chartRes.granularity);
                }

                // Set top routes
                if (routesRes.top_routes) {
                    setTopRoutes(routesRes.top_routes);
                }

                // Set top referrers
                if (referrersRes.top_referrers) {
                    setTopReferrers(referrersRes.top_referrers);
                }
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                setHasError(true);
            } finally {
                setLoading(false);
                setSummaryLoading(false);
                setChartLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getFilterParams],
    );

    // Initialize filters from server and fetch data
    useEffect(() => {
        setFilters(initialFilters);
        // Use initialFilters directly for the first fetch to avoid stale closure
        fetchAnalyticsData(true, initialFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplyFilters = () => {
        fetchAnalyticsData(true);
    };

    return (
        <AppLayout>
            <Head title="Visitor Analytics" />

            <div className="flex flex-col gap-6 p-6">
                {/* Breadcrumbs */}
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Visitor Analytics
                        </h1>
                        <p className="text-muted-foreground">
                            Track and analyze website visitor activity
                        </p>
                    </div>
                </div>

                {/* Info Alert */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Visitor tracking is automatic. Data is collected for all
                        routes and updated in real-time. Bots and crawlers are
                        automatically filtered out.
                    </AlertDescription>
                </Alert>

                {/* Filters */}
                <AnalyticsFilters onApplyFilters={handleApplyFilters} />

                {/* Summary Cards */}
                <SummaryCards
                    summary={summary}
                    deviceDistribution={deviceDistribution}
                    userTypeDistribution={userTypeDistribution}
                    isLoading={isSummaryLoading}
                />

                {/* Distribution Cards */}
                <DistributionCards
                    deviceDistribution={deviceDistribution}
                    userTypeDistribution={userTypeDistribution}
                    isLoading={isSummaryLoading}
                />

                {/* Traffic Chart */}
                <TrafficChart
                    data={chartData}
                    granularity={chartGranularity}
                    isLoading={isChartLoading}
                    error={hasError || chartData.length === 0}
                />

                {/* Top Routes and Referrers */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <TopRoutes routes={topRoutes} isLoading={isLoading || isSummaryLoading} />
                    <TopReferrers
                        referrers={topReferrers}
                        isLoading={isLoading || isSummaryLoading}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
