import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { ReturningVisitorsData } from '@/types';

interface ReturningVisitorsChartProps {
    data: ReturningVisitorsData | null;
    isLoading?: boolean;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

export function ReturningVisitorsChart({ data, isLoading }: ReturningVisitorsChartProps) {
    if (isLoading || !data) {
        return (
            <Card className="col-span-12 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Returning Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
                </CardContent>
            </Card>
        );
    }

    const chartData = [
        { name: 'Recurring', value: data.recurring.count, percentage: data.recurring.percentage },
        { name: 'One-time', value: data.one_time.count, percentage: data.one_time.percentage },
    ];

    const total = data.recurring.count + data.one_time.count;

    return (
        <Card className="col-span-12 lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-base">Returning Visitors</CardTitle>
            </CardHeader>
            <CardContent>
                {total === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm">No data available</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                                        labelLine={false}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '0.5rem',
                                            boxShadow: 'var(--shadow-md)',
                                        }}
                                        formatter={(value: number) => [value.toLocaleString(), 'Visitors']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-muted/50 p-2 text-center">
                                <p className="text-xs text-muted-foreground">Recurring</p>
                                <p className="text-lg font-bold">{data.recurring.count}</p>
                                <p className="text-xs text-muted-foreground">{data.recurring.percentage}%</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-2 text-center">
                                <p className="text-xs text-muted-foreground">One-time</p>
                                <p className="text-lg font-bold">{data.one_time.count}</p>
                                <p className="text-xs text-muted-foreground">{data.one_time.percentage}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
