import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { KpiStats } from '@/types';
import { Users, LogIn, LogOut, Clock, Repeat } from 'lucide-react';

interface KpiCardsProps {
    stats: KpiStats | null;
    isLoading?: boolean;
}

const kpiConfig = [
    {
        key: 'todays_visitors' as const,
        title: "Today's Visitors",
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        accentColor: 'bg-blue-600',
    },
    {
        key: 'checked_in' as const,
        title: 'Checked In',
        icon: LogIn,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        accentColor: 'bg-green-600',
    },
    {
        key: 'checked_out' as const,
        title: 'Checked Out',
        icon: LogOut,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        accentColor: 'bg-red-600',
    },
    {
        key: 'yet_to_check_out' as const,
        title: 'Yet To Check Out',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        accentColor: 'bg-yellow-600',
    },
    {
        key: 'returning_visitors' as const,
        title: 'Returning Visitors',
        icon: Repeat,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        accentColor: 'bg-purple-600',
    },
];

export function KpiCards({ stats, isLoading }: KpiCardsProps) {
    if (isLoading || !stats) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {kpiConfig.map((config) => (
                    <Card key={config.key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-full animate-pulse rounded bg-muted" />
                            {config.key === 'todays_visitors' && (
                                <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {kpiConfig.map((config) => {
                const Icon = config.icon;
                const value = stats[config.key];
                const percentageChange = config.key === 'todays_visitors' ? stats.percentage_change : null;

                return (
                    <Card key={config.key} className="relative overflow-hidden">
                        <div className={`absolute left-0 top-0 h-full w-1 ${config.accentColor}`} />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {config.title}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                            {percentageChange !== null && (
                                <p className={`mt-1 text-xs ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {percentageChange >= 0 ? '↑' : '↓'} {Math.abs(percentageChange)}% from last week
                                </p>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
