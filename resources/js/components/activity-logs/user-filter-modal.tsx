import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserLogFilterUser } from '@/types';
import { useMemo } from 'react';

type UserFilterModalProps = {
    open: boolean;
    users: UserLogFilterUser[];
    selectedUsers: UserLogFilterUser[];
    selectedUserIds: number[];
    searchKeyword: string;
    roleFilter: string;
    statusFilter: string;
    isLoading: boolean;
    hasMoreUsers: boolean;
    onSearchChange: (keyword: string) => void;
    onRoleFilterChange: (role: 'all' | 'admin' | 'user') => void;
    onStatusFilterChange: (status: 'all' | 'enable' | 'disable') => void;
    onToggleUser: (userId: number) => void;
    onReplaceSelectedUsers: (userIds: number[]) => void;
    onClearSelection: () => void;
    onLoadMore: () => void;
    onCancel: () => void;
    onApply: () => void;
};

export function UserFilterModal({
    open,
    users,
    selectedUsers,
    selectedUserIds,
    searchKeyword,
    roleFilter,
    statusFilter,
    isLoading,
    hasMoreUsers,
    onSearchChange,
    onRoleFilterChange,
    onStatusFilterChange,
    onToggleUser,
    onReplaceSelectedUsers,
    onClearSelection,
    onLoadMore,
    onCancel,
    onApply,
}: UserFilterModalProps) {
    const visibleUserIds = useMemo(() => users.map((user) => user.id), [users]);
    const selectedUsersRegistry = useMemo(() => {
        const registry = new Map<number, UserLogFilterUser>();

        selectedUsers.forEach((user) => registry.set(user.id, user));
        users.forEach((user) => registry.set(user.id, user));

        return registry;
    }, [selectedUsers, users]);

    const displaySelectedUsers = useMemo(
        () =>
            selectedUserIds
                .map((userId) => selectedUsersRegistry.get(userId))
                .filter((user): user is UserLogFilterUser => user !== undefined),
        [selectedUserIds, selectedUsersRegistry],
    );

    const areAllVisibleUsersSelected = useMemo(() => {
        if (visibleUserIds.length === 0) {
            return false;
        }

        return visibleUserIds.every((userId) => selectedUserIds.includes(userId));
    }, [visibleUserIds, selectedUserIds]);

    const selectedCount = selectedUserIds.length;

    const handleToggleSelectVisibleUsers = (): void => {
        if (visibleUserIds.length === 0) {
            return;
        }

        if (areAllVisibleUsersSelected) {
            onReplaceSelectedUsers(
                selectedUserIds.filter(
                    (selectedUserId) => !visibleUserIds.includes(selectedUserId),
                ),
            );

            return;
        }

        onReplaceSelectedUsers(Array.from(new Set([...selectedUserIds, ...visibleUserIds])));
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
            <DialogContent className="max-h-[88vh] max-w-3xl overflow-hidden p-0">
                <DialogHeader className="border-b px-6 pt-6 pb-4">
                    <DialogTitle>Filter by User</DialogTitle>
                    <DialogDescription>
                        Search and select users to filter activity logs.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 px-6 py-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="user-search">Search User</Label>
                            <Input
                                id="user-search"
                                type="text"
                                value={searchKeyword}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder="Search by name, email, or user ID"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-role-filter">Role</Label>
                            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                                <SelectTrigger id="user-role-filter">
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="user-status-filter">Status</Label>
                            <Select
                                value={statusFilter}
                                onValueChange={onStatusFilterChange}
                            >
                                <SelectTrigger id="user-status-filter">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="enable">Enabled</SelectItem>
                                    <SelectItem value="disable">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2 flex flex-wrap items-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleToggleSelectVisibleUsers}
                                disabled={visibleUserIds.length === 0}
                            >
                                {areAllVisibleUsersSelected
                                    ? 'Unselect Visible'
                                    : 'Select Visible'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClearSelection}
                                disabled={selectedCount === 0}
                            >
                                Clear Selection
                            </Button>
                            <Badge variant="secondary">Selected {selectedCount}</Badge>
                        </div>
                    </div>

                    {displaySelectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {displaySelectedUsers.slice(0, 6).map((selectedUser) => (
                                <Badge key={selectedUser.id} variant="outline">
                                    {selectedUser.name}
                                </Badge>
                            ))}
                            {displaySelectedUsers.length > 6 && (
                                <Badge variant="outline">
                                    +{displaySelectedUsers.length - 6} more
                                </Badge>
                            )}
                        </div>
                    )}

                    <ScrollArea className="h-[360px] rounded-md border">
                        <div className="divide-y">
                            {isLoading && users.length === 0 && (
                                <div className="space-y-3 p-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            )}

                            {!isLoading && users.length === 0 && (
                                <div className="text-muted-foreground p-6 text-center text-sm">
                                    No users match your current search and filters.
                                </div>
                            )}

                            {users.map((user) => {
                                const isSelected = selectedUserIds.includes(user.id);

                                return (
                                    <label
                                        key={user.id}
                                        className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 p-4"
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onToggleUser(user.id)}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate font-medium">
                                                    {user.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="capitalize"
                                                >
                                                    {user.role}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="capitalize"
                                                >
                                                    {user.status}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {user.email}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                User ID: {user.id}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {hasMoreUsers && (
                            <div className="border-t p-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={onLoadMore}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Loading...' : 'Load More Users'}
                                </Button>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="border-t px-6 py-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onApply}>
                        Apply Filter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
