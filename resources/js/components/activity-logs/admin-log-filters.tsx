import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter, Users, X } from 'lucide-react';
import type { AdminUserLogFilters } from '@/types';

interface AdminLogFiltersProps {
    filters: Omit<AdminUserLogFilters, 'user_ids'>;
    selectedUserCount: number;
    onFiltersChange: (
        filters: Partial<Omit<AdminUserLogFilters, 'user_ids'>>,
    ) => void;
    onOpenUserFilter: () => void;
    onClearUserFilter: () => void;
    onApply: () => void;
    onClear: () => void;
    disabled?: boolean;
    showUserFilter?: boolean;
}

export function AdminLogFilters({
    filters,
    selectedUserCount,
    onFiltersChange,
    onOpenUserFilter,
    onClearUserFilter,
    onApply,
    onClear,
    disabled = false,
    showUserFilter = true,
}: AdminLogFiltersProps) {
    const hasActiveFilters =
        filters.event_type ||
        filters.date_from ||
        filters.date_to ||
        selectedUserCount > 0;

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">
                        Filter Activity Logs
                    </h3>
                </div>
                {hasActiveFilters && (
                    <Badge variant="secondary" className="gap-1">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {selectedUserCount > 0 &&
                            `${selectedUserCount} user(s)`}
                        {filters.event_type && filters.event_type}
                        {(filters.date_from || filters.date_to) && 'date range'}
                    </Badge>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {showUserFilter && (
                    <div className="space-y-2 lg:col-span-2">
                        <Label className="text-sm font-medium">Users</Label>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onOpenUserFilter}
                                disabled={disabled}
                                className="gap-2"
                            >
                                <Users className="h-4 w-4" />
                                Select Users
                            </Button>
                            {selectedUserCount > 0 && (
                                <Badge
                                    variant="default"
                                    className="gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                    {selectedUserCount} user
                                    {selectedUserCount > 1 ? 's' : ''} selected
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClearUserFilter}
                                        disabled={disabled}
                                        className="h-5 w-5 p-0 hover:bg-transparent"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {selectedUserCount > 0
                                ? `Filtering by ${selectedUserCount} selected user${selectedUserCount > 1 ? 's' : ''}`
                                : 'Filter logs by specific users'}
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="event_type" className="text-sm font-medium">
                        Event Type
                    </Label>
                    <Select
                        value={filters.event_type || 'all'}
                        onValueChange={(value) => {
                            onFiltersChange({
                                event_type: value === 'all' ? '' : value,
                            });
                        }}
                        disabled={disabled}
                    >
                        <SelectTrigger id="event_type" className="h-10">
                            <SelectValue placeholder="All events" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All events</SelectItem>
                            <SelectItem value="login">🔐 Login</SelectItem>
                            <SelectItem value="logout">🚪 Logout</SelectItem>
                            <SelectItem value="forced_logout">
                                ⚠️ Forced Logout
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date_from" className="text-sm font-medium">
                        From Date
                    </Label>
                    <Input
                        id="date_from"
                        type="date"
                        value={filters.date_from}
                        onChange={(event) => {
                            onFiltersChange({ date_from: event.target.value });
                        }}
                        disabled={disabled}
                        className="h-10"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date_to" className="text-sm font-medium">
                        To Date
                    </Label>
                    <Input
                        id="date_to"
                        type="date"
                        value={filters.date_to}
                        onChange={(event) => {
                            onFiltersChange({ date_to: event.target.value });
                        }}
                        disabled={disabled}
                        className="h-10"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="per_page" className="text-sm font-medium">
                        Rows per Page
                    </Label>
                    <Select
                        value={String(filters.per_page)}
                        onValueChange={(value) => {
                            onFiltersChange({
                                per_page: Number(value),
                            });
                        }}
                        disabled={disabled}
                    >
                        <SelectTrigger id="per_page" className="h-10">
                            <SelectValue placeholder="Select rows" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 rows</SelectItem>
                            <SelectItem value="25">25 rows</SelectItem>
                            <SelectItem value="50">50 rows</SelectItem>
                            <SelectItem value="100">100 rows</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div className="flex gap-2">
                    <Button
                        onClick={onApply}
                        disabled={disabled}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Apply Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClear}
                        disabled={disabled || !hasActiveFilters}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear All
                    </Button>
                </div>
            </div>
        </div>
    );
}
