import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { RegionData } from '@/types';

interface RegionDistributionProps {
    data: RegionData[];
    isLoading?: boolean;
}

export function RegionDistribution({ data, isLoading }: RegionDistributionProps) {
    if (isLoading) {
        return (
            <Card className="col-span-12 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Region Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="animate-pulse space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded bg-muted" />
                                    <div className="h-3 w-20 rounded bg-muted" />
                                </div>
                                <div className="h-2 w-full rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxVisits = Math.max(...data.map((d) => d.visits), 1);

    return (
        <Card className="col-span-12 lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-base">Region Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm">No data available</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.map((item, index) => {
                            const percentage = Math.round((item.visits / maxVisits) * 100);
                            const flag = item.country_code
                                ? getFlagEmoji(item.country_code)
                                : '🌍';

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{flag}</span>
                                            <span className="text-sm font-medium">{item.region}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-muted-foreground">
                                            {item.visits}
                                        </span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Convert country code to flag emoji.
 */
function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
