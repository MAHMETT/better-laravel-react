import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import type { PurposeData } from '@/types';

interface PurposeOfVisitChartProps {
    data: PurposeData[];
    isLoading?: boolean;
}

export function PurposeOfVisitChart({ data, isLoading }: PurposeOfVisitChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-12 lg:col-span-6">
                <CardHeader>
                    <CardTitle>Purpose of Visit</CardTitle>
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
                <CardTitle className="text-base">Purpose of Visit</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm">No data available</p>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.3)" />
                                <XAxis
                                    type="number"
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    dataKey="purpose"
                                    type="category"
                                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
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
                                    formatter={(value: number) => [value.toLocaleString(), 'Visitors']}
                                />
                                <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
