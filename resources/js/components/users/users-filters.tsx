import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CheckIcon,
    ChessKingIcon,
    Filter,
    Search,
    UserIcon,
    X,
    XIcon,
} from 'lucide-react';

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
    onApply?: () => void;
    disabled?: boolean;
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
    onApply,
    disabled = false,
}: UsersFiltersProps) {
    const hasFilters = search || status || role;

    return (
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => {
                        onSearchChange(e.target.value);
                    }}
                    className="pl-9"
                    disabled={disabled}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <Select
                    value={status}
                    onValueChange={onStatusChange}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-32.5">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="enable">
                            <CheckIcon className="size-4" />
                            Enabled
                        </SelectItem>
                        <SelectItem value="disable">
                            <XIcon className="size-4" />
                            Disabled
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={role}
                    onValueChange={onRoleChange}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-32.5">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">
                            <ChessKingIcon className="size-4" />
                            Admin
                        </SelectItem>
                        <SelectItem value="user">
                            <UserIcon className="size-4" />
                            User
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={perPage.toString()}
                    onValueChange={(v) => {
                        onPerPageChange(Number(v));
                    }}
                    disabled={disabled}
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

                {onApply && (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onApply}
                        disabled={disabled || !hasFilters}
                        className="h-9"
                    >
                        <Filter className="mr-2 size-4" />
                        Apply
                    </Button>
                )}

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClearFilters}
                        className="size-9"
                        disabled={disabled}
                    >
                        <X className="size-4" />
                        <span className="sr-only">Clear filters</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
