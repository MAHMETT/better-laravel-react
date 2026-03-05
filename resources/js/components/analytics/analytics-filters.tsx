import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useVisitorAnalyticsStore } from '@/stores/visitor-analytics';
import type { AnalyticsPreset, ChartGranularity } from '@/types';

const presetLabels: Record<AnalyticsPreset, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    this_week: 'This Week',
    last_week: 'Last Week',
    this_month: 'This Month',
    last_month: 'Last Month',
    this_year: 'This Year',
    custom: 'Custom',
};

const granularityLabels: Record<ChartGranularity, string> = {
    hourly: 'Hourly',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
};

interface AnalyticsFiltersProps {
    onApplyFilters?: () => void;
}

export function AnalyticsFilters({ onApplyFilters }: AnalyticsFiltersProps) {
    const store = useVisitorAnalyticsStore;

    const preset = store.use.filters().preset;
    const granularity = store.use.filters().granularity;
    const dateFrom = store.use.filters().date_from;
    const dateTo = store.use.filters().date_to;

    const setPreset = store.use.setPreset();
    const setGranularity = store.use.setGranularity();
    const setDateRange = store.use.setDateRange();

    const handlePresetChange = (value: AnalyticsPreset) => {
        setPreset(value);
    };

    const handleGranularityChange = (value: ChartGranularity) => {
        setGranularity(value);
    };

    const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(e.target.value, dateTo);
    };

    const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(dateFrom, e.target.value);
    };

    const handleApply = () => {
        onApplyFilters?.();
    };

    return (
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-4">
                {/* Preset Filter */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="preset-filter"
                        className="text-sm font-medium whitespace-nowrap"
                    >
                        Time Range
                    </label>
                    <Select value={preset} onValueChange={handlePresetChange}>
                        <SelectTrigger id="preset-filter" className="w-[160px]">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(presetLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Granularity */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="granularity-filter"
                        className="text-sm font-medium whitespace-nowrap"
                    >
                        Chart View
                    </label>
                    <Select
                        value={granularity}
                        onValueChange={handleGranularityChange}
                    >
                        <SelectTrigger id="granularity-filter" className="w-[120px]">
                            <SelectValue placeholder="Select view" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(granularityLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Custom Date Range */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">
                        From
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={handleDateFromChange}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    />
                    <label className="text-sm font-medium whitespace-nowrap">
                        To
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={handleDateToChange}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    />
                </div>

                {/* Apply Button */}
                <Button onClick={handleApply} size="sm" className="ml-auto">
                    Apply Filters
                </Button>
            </div>
        </div>
    );
}
