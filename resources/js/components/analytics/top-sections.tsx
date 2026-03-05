import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TopRoute, TopReferrer } from '@/types';
import { Link, ExternalLink } from 'lucide-react';

interface TopRoutesProps {
    routes: TopRoute[];
    isLoading?: boolean;
}

export function TopRoutes({ routes, isLoading }: TopRoutesProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Visited Routes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between"
                            >
                                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (routes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Link className="h-5 w-5" />
                        Top Visited Routes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <Link className="mb-2 h-12 w-12 opacity-50" />
                        <p className="text-sm">No route data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxVisits = Math.max(...routes.map((r) => r.visits));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Link className="h-5 w-5" />
                    Top Visited Routes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[280px] pr-4">
                    <div className="space-y-3">
                        {routes.map((route, index) => (
                            <div
                                key={route.route_path}
                                className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {route.route_path}
                                        </p>
                                        {route.route_name && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {route.route_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24">
                                        <div className="h-2 w-full rounded-full bg-muted">
                                            <div
                                                className="h-2 rounded-full bg-primary transition-all"
                                                style={{
                                                    width: `${(route.visits / maxVisits) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">
                                        {route.visits.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

interface TopReferrersProps {
    referrers: TopReferrer[];
    isLoading?: boolean;
}

export function TopReferrers({ referrers, isLoading }: TopReferrersProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Top Referrers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between"
                            >
                                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (referrers.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ExternalLink className="h-5 w-5" />
                        Top Referrers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <ExternalLink className="mb-2 h-12 w-12 opacity-50" />
                        <p className="text-sm">No referrer data available</p>
                        <p className="text-xs">
                            Visitors may be coming directly or from secure sources
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxVisits = Math.max(...referrers.map((r) => r.visits));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <ExternalLink className="h-5 w-5" />
                    Top Referrers
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[280px] pr-4">
                    <div className="space-y-3">
                        {referrers.map((referrer, index) => {
                            const domain = getDomain(referrer.referrer);

                            return (
                                <div
                                    key={referrer.referrer}
                                    className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="truncate text-sm font-medium"
                                                title={referrer.referrer}
                                            >
                                                {domain}
                                            </p>
                                            <p
                                                className="truncate text-xs text-muted-foreground"
                                                title={referrer.referrer}
                                            >
                                                {referrer.referrer}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24">
                                            <div className="h-2 w-full rounded-full bg-muted">
                                                <div
                                                    className="h-2 rounded-full bg-secondary transition-all"
                                                    style={{
                                                        width: `${(referrer.visits / maxVisits) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium tabular-nums">
                                            {referrer.visits.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function getDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
}
