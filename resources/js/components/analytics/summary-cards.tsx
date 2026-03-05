import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VisitorSummary, DeviceDistribution, UserTypeDistribution } from '@/types';
import { Users, UserPlus, Repeat, HelpCircle, Monitor, Smartphone, Tablet, UserCheck, UserX } from 'lucide-react';

interface SummaryCardsProps {
    summary: VisitorSummary | null;
    deviceDistribution: DeviceDistribution | null;
    userTypeDistribution: UserTypeDistribution | null;
    isLoading?: boolean;
}

export function SummaryCards({
    summary,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deviceDistribution,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userTypeDistribution,
    isLoading,
}: SummaryCardsProps) {
    if (isLoading || !summary) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Loading...
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-full animate-pulse rounded bg-muted" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const total = summary.total_visitors || 1;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Visitors */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Visitors
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.total_visitors}</div>
                    <p className="text-xs text-muted-foreground">
                        Unique visitors in selected period
                    </p>
                </CardContent>
            </Card>

            {/* New Visitors */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        New Visitors
                    </CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.new_visitors}</div>
                    <p className="text-xs text-muted-foreground">
                        {((summary.new_visitors / total) * 100).toFixed(1)}% of total
                    </p>
                </CardContent>
            </Card>

            {/* Loyal Visitors */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Loyal Visitors
                    </CardTitle>
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.loyal_visitors}</div>
                    <p className="text-xs text-muted-foreground">
                        {((summary.loyal_visitors / total) * 100).toFixed(1)}% of total
                    </p>
                </CardContent>
            </Card>

            {/* Other Visitors */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Other Visitors
                    </CardTitle>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.other_visitors}</div>
                    <p className="text-xs text-muted-foreground">
                        {((summary.other_visitors / total) * 100).toFixed(1)}% of total
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

interface DistributionCardsProps {
    deviceDistribution: DeviceDistribution | null;
    userTypeDistribution: UserTypeDistribution | null;
    isLoading?: boolean;
}

export function DistributionCards({
    deviceDistribution,
    userTypeDistribution,
    isLoading,

}: DistributionCardsProps) {
    if (isLoading || (!deviceDistribution && !userTypeDistribution)) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[...Array(3)].map((_, j) => (
                                    <div
                                        key={j}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                                        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!deviceDistribution || !userTypeDistribution) {
        return null;
    }

    const deviceTotal =
        deviceDistribution.desktop +
        deviceDistribution.mobile +
        deviceDistribution.tablet +
        deviceDistribution.unknown;

    const userTotal = userTypeDistribution.users + userTypeDistribution.guests;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Device Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Monitor className="h-5 w-5" />
                        Device Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <DistributionRow
                            icon={<Monitor className="h-4 w-4" />}
                            label="Desktop"
                            count={deviceDistribution.desktop}
                            total={deviceTotal}
                        />
                        <DistributionRow
                            icon={<Smartphone className="h-4 w-4" />}
                            label="Mobile"
                            count={deviceDistribution.mobile}
                            total={deviceTotal}
                        />
                        <DistributionRow
                            icon={<Tablet className="h-4 w-4" />}
                            label="Tablet"
                            count={deviceDistribution.tablet}
                            total={deviceTotal}
                        />
                        {deviceDistribution.unknown > 0 && (
                            <DistributionRow
                                icon={<HelpCircle className="h-4 w-4" />}
                                label="Unknown"
                                count={deviceDistribution.unknown}
                                total={deviceTotal}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* User Type Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <UserCheck className="h-5 w-5" />
                        User Type
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <DistributionRow
                            icon={<UserCheck className="h-4 w-4" />}
                            label="Authenticated Users"
                            count={userTypeDistribution.users}
                            total={userTotal}
                        />
                        <DistributionRow
                            icon={<UserX className="h-4 w-4" />}
                            label="Guests"
                            count={userTypeDistribution.guests}
                            total={userTotal}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface DistributionRowProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    total: number;
}

function DistributionRow({ icon, label, count, total }: DistributionRowProps) {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{icon}</span>
                <span className="text-sm">{label}</span>
            </div>
            <div className="text-right">
                <span className="text-sm font-medium">{count}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                    {percentage}%
                </span>
            </div>
        </div>
    );
}
