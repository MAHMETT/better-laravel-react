import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, Circle } from 'lucide-react';
import type { LiveFeedItem } from '@/types';

interface LiveFeedProps {
    data: LiveFeedItem[];
    isLoading?: boolean;
    onItemClick?: (item: LiveFeedItem) => void;
}

export function LiveFeed({ data, isLoading, onItemClick }: LiveFeedProps) {
    if (isLoading) {
        return (
            <Card className="col-span-12 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Live Feed</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="h-3 w-3 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 rounded bg-muted" />
                                    <div className="h-2 w-16 rounded bg-muted" />
                                </div>
                                <div className="h-4 w-4 rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-12 lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-base">Live Feed</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm">No recent activity</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-3">
                            {data.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onItemClick?.(item)}
                                    className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                                >
                                    <Circle
                                        className={`h-3 w-3 flex-shrink-0 ${
                                            item.action === 'IN'
                                                ? 'fill-green-500 text-green-500'
                                                : 'fill-red-500 text-red-500'
                                        }`}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{item.full_name}</p>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs font-semibold ${
                                                    item.action === 'IN'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {item.action}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {item.time_ago}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
