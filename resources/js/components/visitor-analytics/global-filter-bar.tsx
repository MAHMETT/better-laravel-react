import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Search } from 'lucide-react';
import { useVisitorAnalyticsStore } from '@/stores/visitor-analytics-store';
import type { TimeRangeOption, ChartMode } from '@/types';
import { toast } from 'sonner';

const timeRangeOptions: { value: TimeRangeOption; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'custom', label: 'Custom' },
];

interface GlobalFilterBarProps {
    onRefresh?: () => void;
}

export function GlobalFilterBar({ onRefresh }: GlobalFilterBarProps) {
    const store = useVisitorAnalyticsStore;

    const searchQuery = store.use.filters().search;
    const location = store.use.filters().location;
    const site = store.use.filters().site;
    const timeRange = store.use.filters().time_range;
    const chartMode = store.use.filters().chart_mode;
    const dateFrom = store.use.filters().date_from;
    const dateTo = store.use.filters().date_to;

    const setFilters = store.use.setFilters();
    const setTimeRange = store.use.setTimeRange();
    const setChartMode = store.use.setChartMode();
    const setSearchQuery = store.use.setSearchQuery();
    const getFilterParams = store.use.getFilterParams();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onRefresh?.();
        }
    };

    const handleTimeRangeChange = (value: TimeRangeOption) => {
        setTimeRange(value);
        onRefresh?.();
    };

    const handleChartModeChange = (checked: boolean) => {
        setChartMode(checked ? 'yearly' : 'monthly');
        onRefresh?.();
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams(getFilterParams());
            const response = await fetch(`/admin/visitor-analytics/export?${params}`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast.success('Export completed successfully');
            } else {
                toast.error('Export failed');
            }
        } catch (error) {
            toast.error('Export failed');
        }
    };

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-4">
                {/* Search and Actions Row */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by visitor name or ID..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            className="pl-9"
                        />
                    </div>

                    {/* Location Filter */}
                    <Select
                        value={location}
                        onValueChange={(value) => {
                            setFilters({ location: value });
                            onRefresh?.();
                        }}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Locations</SelectItem>
                            <SelectItem value="Main Office">Main Office</SelectItem>
                            <SelectItem value="Branch A">Branch A</SelectItem>
                            <SelectItem value="Branch B">Branch B</SelectItem>
                            <SelectItem value="Warehouse">Warehouse</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Site Filter */}
                    <Select
                        value={site}
                        onValueChange={(value) => {
                            setFilters({ site: value });
                            onRefresh?.();
                        }}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="All Sites" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Sites</SelectItem>
                            <SelectItem value="Site 1">Site 1</SelectItem>
                            <SelectItem value="Site 2">Site 2</SelectItem>
                            <SelectItem value="Site 3">Site 3</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Time Range Filter */}
                    <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeRangeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Custom Date Range (shown when custom is selected) */}
                    {timeRange === 'custom' && (
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setFilters({ date_from: e.target.value })}
                                className="w-[150px]"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setFilters({ date_to: e.target.value })}
                                className="w-[150px]"
                            />
                        </div>
                    )}

                    {/* Export Button */}
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Stats
                    </Button>
                </div>

                {/* Time Toggle Switch */}
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">View Mode:</Label>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${chartMode === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}`}>
                            M
                        </span>
                        <Switch
                            checked={chartMode === 'yearly'}
                            onCheckedChange={handleChartModeChange}
                        />
                        <span className={`text-sm ${chartMode === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}`}>
                            Y
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
