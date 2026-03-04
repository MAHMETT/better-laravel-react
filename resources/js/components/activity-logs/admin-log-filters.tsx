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
import type { AdminUserLogFilters } from '@/types';

type AdminLogFiltersProps = {
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
};

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
    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {showUserFilter && (
                    <div className="space-y-2 xl:col-span-2">
                        <Label>User Filters</Label>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onOpenUserFilter}
                                disabled={disabled}
                            >
                                Filter by User
                            </Button>
                            {selectedUserCount > 0 && (
                                <>
                                    <Badge variant="secondary">
                                        Filtered by {selectedUserCount} Users
                                    </Badge>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClearUserFilter}
                                        disabled={disabled}
                                    >
                                        Clear User Filter
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="event_type">Event</Label>
                    <Select
                        value={filters.event_type || 'all'}
                        onValueChange={(value) =>
                            onFiltersChange({
                                event_type: value === 'all' ? '' : value,
                            })
                        }
                        disabled={disabled}
                    >
                        <SelectTrigger id="event_type">
                            <SelectValue placeholder="All events" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All events</SelectItem>
                            <SelectItem value="login">Login</SelectItem>
                            <SelectItem value="logout">Logout</SelectItem>
                            <SelectItem value="forced_logout">
                                Forced Logout
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date_from">Date from</Label>
                    <Input
                        id="date_from"
                        type="date"
                        value={filters.date_from}
                        onChange={(event) =>
                            onFiltersChange({ date_from: event.target.value })
                        }
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date_to">Date to</Label>
                    <Input
                        id="date_to"
                        type="date"
                        value={filters.date_to}
                        onChange={(event) =>
                            onFiltersChange({ date_to: event.target.value })
                        }
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="per_page">Rows</Label>
                    <Select
                        value={String(filters.per_page)}
                        onValueChange={(value) =>
                            onFiltersChange({
                                per_page: Number(value),
                            })
                        }
                        disabled={disabled}
                    >
                        <SelectTrigger id="per_page">
                            <SelectValue placeholder="Rows per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={onApply} disabled={disabled}>
                    Apply filters
                </Button>
                <Button variant="outline" onClick={onClear} disabled={disabled}>
                    Clear
                </Button>
            </div>
        </div>
    );
}
