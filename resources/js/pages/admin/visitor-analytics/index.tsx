import { Head } from '@inertiajs/react';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    KpiCards,
    GlobalFilterBar,
    DailyVisitsChart,
    PeakHourChart,
    ReturningVisitorsChart,
    PurposeOfVisitChart,
    RegionDistribution,
    LiveFeed,
} from '@/components/visitor-analytics';
import { useVisitorAnalyticsStore } from '@/stores/visitor-analytics-store';
import type {
    KpiStatsResponse,
    DailyVisitsResponse,
    PeakHourResponse,
    ReturningVisitorsResponse,
    PurposeOfVisitResponse,
    RegionDistributionResponse,
    LiveFeedResponse,
    VisitorAnalyticsFilters,
} from '@/types';
import { toast } from 'sonner';

interface Props {
    filters: VisitorAnalyticsFilters;
}

const breadcrumbs = [
    {
        title: 'Visitor Management',
        href: '/admin/visitor-analytics',
    },
];

export default function VisitorAnalyticsIndex({ filters: initialFilters }: Props) {
    const store = useVisitorAnalyticsStore;

    // Selectors
    const filters = store.use.filters();
    const kpiStats = store.use.kpiStats();
    const dailyVisits = store.use.dailyVisits();
    const chartMode = store.use.filters().chart_mode;
    const peakHourData = store.use.peakHourData();
    const peakHour = store.use.peakHour();
    const peakVisits = store.use.peakVisits();
    const returningVisitors = store.use.returningVisitors();
    const purposeOfVisit = store.use.purposeOfVisit();
    const regionDistribution = store.use.regionDistribution();
    const liveFeed = store.use.liveFeed();
    const isKpiLoading = store.use.isKpiLoading();
    const isChartLoading = store.use.isChartLoading();
    const isFeedLoading = store.use.isFeedLoading();

    // Actions
    const getFilterParams = store.use.getFilterParams();
    const setKpiStats = store.use.setKpiStats();
    const setDailyVisits = store.use.setDailyVisits();
    const setPeakHourData = store.use.setPeakHourData();
    const setReturningVisitors = store.use.setReturningVisitors();
    const setPurposeOfVisit = store.use.setPurposeOfVisit();
    const setRegionDistribution = store.use.setRegionDistribution();
    const setLiveFeed = store.use.setLiveFeed();
    const setKpiLoading = store.use.setKpiLoading();
    const setChartLoading = store.use.setChartLoading();
    const setFeedLoading = store.use.setFeedLoading();

    // Fetch KPI stats
    const fetchKpiStats = useCallback(async () => {
        const params = new URLSearchParams(getFilterParams());
        setKpiLoading(true);
        try {
            const response = await fetch(`/admin/visitor-analytics/kpi-stats?${params}`);
            const data = (await response.json()) as KpiStatsResponse;
            if (data.kpi_stats) {
                setKpiStats(data.kpi_stats);
            }
        } catch (error) {
            console.error('Error fetching KPI stats:', error);
        } finally {
            setKpiLoading(false);
        }
    }, [getFilterParams, setKpiLoading, setKpiStats]);

    // Fetch daily visits
    const fetchDailyVisits = useCallback(async () => {
        const params = new URLSearchParams(getFilterParams());
        setChartLoading(true);
        try {
            const response = await fetch(`/admin/visitor-analytics/daily-visits?${params}`);
            const data = (await response.json()) as DailyVisitsResponse;
            if (data.daily_visits) {
                setDailyVisits(data.daily_visits, data.mode === 'yearly' ? 'yearly' : 'monthly');
            }
        } catch (error) {
            console.error('Error fetching daily visits:', error);
        } finally {
            setChartLoading(false);
        }
    }, [getFilterParams, setChartLoading, setDailyVisits]);

    // Fetch peak hour data
    const fetchPeakHour = useCallback(async () => {
        const params = new URLSearchParams(getFilterParams());
        try {
            const response = await fetch(`/admin/visitor-analytics/peak-hour?${params}`);
            const data = (await response.json()) as PeakHourResponse;
            if (data.peak_hour_data) {
                setPeakHourData(data.peak_hour_data, data.peak_hour, data.peak_visits);
            }
        } catch (error) {
            console.error('Error fetching peak hour:', error);
        }
    }, [getFilterParams, setPeakHourData]);

    // Fetch returning visitors
    const fetchReturningVisitors = useCallback(async () => {
        const params = new URLSearchParams(getFilterParams());
        try {
            const response = await fetch(`/admin/visitor-analytics/returning-visitors?${params}`);
            const data = (await response.json()) as ReturningVisitorsResponse;
            if (data.returning_visitors) {
                setReturningVisitors(data.returning_visitors);
            }
        } catch (error) {
            console.error('Error fetching returning visitors:', error);
        }
    }, [getFilterParams, setReturningVisitors]);

    // Fetch purpose of visit
    const fetchPurposeOfVisit = useCallback(async () => {
        const params = new URLSearchParams(getFilterParams());
        try {
            const response = await fetch(`/admin/visitor-analytics/purpose-of-visit?${params}`);
            const data = (await response.json()) as PurposeOfVisitResponse;
            if (data.purpose_of_visit) {
                setPurposeOfVisit(data.purpose_of_visit);
            }
        } catch (error) {
            console.error('Error fetching purpose of visit:', error);
        }
    }, [getFilterParams, setPurposeOfVisit]);

    // Fetch region distribution
    const fetchRegionDistribution = useCallback(async () => {
        const params = new URLSearchParams(getFilterParams());
        try {
            const response = await fetch(`/admin/visitor-analytics/region-distribution?${params}`);
            const data = (await response.json()) as RegionDistributionResponse;
            if (data.region_distribution) {
                setRegionDistribution(data.region_distribution);
            }
        } catch (error) {
            console.error('Error fetching region distribution:', error);
        }
    }, [getFilterParams, setRegionDistribution]);

    // Fetch live feed
    const fetchLiveFeed = useCallback(async () => {
        setFeedLoading(true);
        try {
            const response = await fetch('/admin/visitor-analytics/live-feed');
            const data = (await response.json()) as LiveFeedResponse;
            if (data.live_feed) {
                setLiveFeed(data.live_feed);
            }
        } catch (error) {
            console.error('Error fetching live feed:', error);
        } finally {
            setFeedLoading(false);
        }
    }, [setFeedLoading, setLiveFeed]);

    // Fetch all analytics data
    const fetchAllData = useCallback(
        async (showLoading = true) => {
            if (showLoading) {
                setKpiLoading(true);
                setChartLoading(true);
            }

            try {
                await Promise.all([
                    fetchKpiStats(),
                    fetchDailyVisits(),
                    fetchPeakHour(),
                    fetchReturningVisitors(),
                    fetchPurposeOfVisit(),
                    fetchRegionDistribution(),
                ]);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                toast.error('Failed to load analytics data');
            } finally {
                setKpiLoading(false);
                setChartLoading(false);
            }
        },
        [
            fetchKpiStats,
            fetchDailyVisits,
            fetchPeakHour,
            fetchReturningVisitors,
            fetchPurposeOfVisit,
            fetchRegionDistribution,
            setKpiLoading,
            setChartLoading,
        ]
    );

    // Initialize filters from server and fetch data
    useEffect(() => {
        store.use.setFilters()(initialFilters);
        fetchAllData(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refresh data when filters change (except for initial load)
    const handleRefresh = useCallback(() => {
        fetchAllData(true);
        fetchLiveFeed();
    }, [fetchAllData, fetchLiveFeed]);

    // Handle live feed item click
    const handleLiveFeedItemClick = useCallback((item: LiveFeedItem) => {
        toast.info(`Viewing details for ${item.full_name} (${item.visitor_id})`);
        // In a real application, this would navigate to visitor details or open a modal
    }, []);

    // Poll for live feed updates every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLiveFeed();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchLiveFeed]);

    return (
        <AppLayout>
            <Head title="Visitor Management Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Breadcrumbs */}
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Visitor Management Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Monitor and analyze visitor activity in real-time
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <KpiCards stats={kpiStats} isLoading={isKpiLoading} />

                {/* Global Filter Bar */}
                <GlobalFilterBar onRefresh={handleRefresh} />

                {/* Main Analytics Grid */}
                <div className="grid gap-4 lg:grid-cols-12">
                    {/* Daily Visits Chart */}
                    <DailyVisitsChart
                        data={dailyVisits}
                        mode={chartMode}
                        isLoading={isChartLoading}
                    />

                    {/* Peak Hour Chart */}
                    <PeakHourChart
                        data={peakHourData}
                        peakHour={peakHour}
                        peakVisits={peakVisits}
                        isLoading={isChartLoading}
                    />

                    {/* Returning Visitors Chart */}
                    <ReturningVisitorsChart
                        data={returningVisitors}
                        isLoading={isChartLoading}
                    />
                </div>

                {/* Secondary Analytics Grid */}
                <div className="grid gap-4 lg:grid-cols-12">
                    {/* Purpose of Visit Chart */}
                    <PurposeOfVisitChart
                        data={purposeOfVisit}
                        isLoading={isChartLoading}
                    />

                    {/* Region Distribution */}
                    <RegionDistribution
                        data={regionDistribution}
                        isLoading={isChartLoading}
                    />

                    {/* Live Feed */}
                    <LiveFeed
                        data={liveFeed}
                        isLoading={isFeedLoading}
                        onItemClick={handleLiveFeedItemClick}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
