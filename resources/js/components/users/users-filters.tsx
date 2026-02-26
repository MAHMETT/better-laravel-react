import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface UsersFiltersProps {
    search: string;
    status: string;
    role: string;
    perPage: number;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onPerPageChange: (value: number) => void;
    onClearFilters: () => void;
}

export function UsersFilters({
    search,
    status,
    role,
    perPage,
    onSearchChange,
    onStatusChange,
    onRoleChange,
    onPerPageChange,
    onClearFilters,
}: UsersFiltersProps) {
    const hasFilters = search || status || role;

    return (
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-32.5">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="enable">Enabled</SelectItem>
                        <SelectItem value="disable">Disabled</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={role} onValueChange={onRoleChange}>
                    <SelectTrigger className="w-32.5">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={perPage.toString()}
                    onValueChange={(v) => onPerPageChange(Number(v))}
                >
                    <SelectTrigger className="w-30">
                        <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 / page</SelectItem>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="25">25 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClearFilters}
                        className="h-9 w-9"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear filters</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
