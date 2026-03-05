import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint, ChartGranularity } from '@/types';
import { TrendingUp, Users } from 'lucide-react';

interface TrafficChartProps {
    data: ChartDataPoint[];
    granularity: ChartGranularity;
    isLoading?: boolean;
    error?: boolean;
}

export function TrafficChart({ data, granularity, isLoading, error }: TrafficChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Traffic Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] w-full items-center justify-center">
                        <div className="h-full w-full animate-pulse rounded bg-muted" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Traffic Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
                        <Users className="mb-4 h-16 w-16 opacity-30" />
                        <p className="text-lg font-medium">No traffic data available</p>
                        <p className="text-sm">
                            {error
                                ? 'Failed to load data. Please try again.'
                                : 'Visitor tracking data will appear here once users start visiting your site.'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const formatXAxis = (value: string) => {
        const date = new Date(value);

        switch (granularity) {
            case 'hourly':
                return date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
            case 'daily':
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });
            case 'weekly':
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                });
            case 'monthly':
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    year: '2-digit',
                });
            default:
                return value;
        }
    };

    const tooltipFormatter = (value: number | undefined, name: string | undefined) => {
        const labels: Record<string, string> = {
            visits: 'Total Visits',
            unique_visitors: 'Unique Visitors',
        };
        return [(value ?? 0).toLocaleString(), labels[name || ''] || ''];
    };

    const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);
    const totalUnique = data.reduce((sum, item) => sum + item.unique_visitors, 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-5 w-5" />
                            Traffic Overview
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {granularity === 'hourly' && 'Visits per hour'}
                            {granularity === 'daily' && 'Visits per day'}
                            {granularity === 'weekly' && 'Visits per week'}
                            {granularity === 'monthly' && 'Visits per month'}
                        </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary" />
                            <span className="text-muted-foreground">
                                Total: {totalVisits.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-secondary" />
                            <span className="text-muted-foreground">
                                Unique: {totalUnique.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                        <Users className="mb-2 h-12 w-12 opacity-50" />
                        <p className="text-sm">No data available for the selected period</p>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorVisits"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="hsl(var(--primary))"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="hsl(var(--primary))"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="colorUnique"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="hsl(var(--secondary))"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="hsl(var(--secondary))"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-muted"
                                />
                                <XAxis
                                    dataKey="period"
                                    tickFormatter={formatXAxis}
                                    className="text-xs"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) =>
                                        value >= 1000
                                            ? `${(value / 1000).toFixed(1)}k`
                                            : value.toString()
                                    }
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={tooltipFormatter}
                                    labelFormatter={(label) => {
                                        const date = new Date(label);
                                        return date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: granularity === 'hourly' ? 'numeric' : undefined,
                                            minute: granularity === 'hourly' ? '2-digit' : undefined,
                                        });
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visits"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorVisits)"
                                    name="visits"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="unique_visitors"
                                    stroke="hsl(var(--secondary))"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorUnique)"
                                    name="unique_visitors"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
