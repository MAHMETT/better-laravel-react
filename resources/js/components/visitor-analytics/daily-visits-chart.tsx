import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyVisitData, ChartMode } from '@/types';

interface DailyVisitsChartProps {
    data: DailyVisitData[];
    mode: ChartMode;
    isLoading?: boolean;
}

export function DailyVisitsChart({ data, mode, isLoading }: DailyVisitsChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-6">
                <CardHeader>
                    <CardTitle>Daily Visits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-12 lg:col-span-6">
            <CardHeader>
                <CardTitle className="text-base">
                    {mode === 'yearly' ? 'Monthly Visits (This Year)' : 'Daily Visits (This Week vs Last Week)'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm">No data available</p>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.3)" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
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
                                <Legend />
                                {mode === 'yearly' ? (
                                    <Bar
                                        dataKey="visits"
                                        fill="hsl(var(--chart-1))"
                                        radius={[4, 4, 0, 0]}
                                        name="Visits"
                                    />
                                ) : (
                                    <>
                                        <Bar
                                            dataKey="this_week"
                                            fill="hsl(var(--chart-1))"
                                            radius={[4, 4, 0, 0]}
                                            name="This Week"
                                        />
                                        <Bar
                                            dataKey="last_week"
                                            fill="hsl(var(--chart-2))"
                                            radius={[4, 4, 0, 0]}
                                            name="Last Week"
                                        />
                                    </>
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
