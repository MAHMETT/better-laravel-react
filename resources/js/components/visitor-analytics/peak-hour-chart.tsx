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
import type { PeakHourData } from '@/types';

interface PeakHourChartProps {
    data: PeakHourData[];
    peakHour: string;
    peakVisits: number;
    isLoading?: boolean;
}

export function PeakHourChart({ data, peakHour, peakVisits, isLoading }: PeakHourChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-12 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Peak Hour</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-12 lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-base">Peak Hour</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm">No data available</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Peak Hour</p>
                                <p className="text-2xl font-bold">{peakHour}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Peak Visits</p>
                                <p className="text-2xl font-bold">{peakVisits}</p>
                            </div>
                        </div>
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.3)" />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={3}
                                    />
                                    <YAxis
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '0.5rem',
                                            boxShadow: 'var(--shadow-md)',
                                        }}
                                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="visits"
                                        stroke="hsl(var(--chart-1))"
                                        fillOpacity={1}
                                        fill="url(#colorVisits)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
