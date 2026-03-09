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
import {
    Check,
    CheckIcon,
    ChessKingIcon,
    MailIcon,
    Search,
    User,
    UserCheck,
    UserIcon,
    Users,
    X,
    XIcon,
} from 'lucide-react';
import { useMemo } from 'react';

interface UserFilterModalProps {
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
}

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
                .filter(
                    (user): user is UserLogFilterUser => user !== undefined,
                ),
        [selectedUserIds, selectedUsersRegistry],
    );

    const areAllVisibleUsersSelected = useMemo(() => {
        if (visibleUserIds.length === 0) {
            return false;
        }

        return visibleUserIds.every((userId) =>
            selectedUserIds.includes(userId),
        );
    }, [visibleUserIds, selectedUserIds]);

    const selectedCount = selectedUserIds.length;

    const handleToggleSelectVisibleUsers = (): void => {
        if (visibleUserIds.length === 0) {
            return;
        }

        if (areAllVisibleUsersSelected) {
            onReplaceSelectedUsers(
                selectedUserIds.filter(
                    (selectedUserId) =>
                        !visibleUserIds.includes(selectedUserId),
                ),
            );

            return;
        }

        onReplaceSelectedUsers(
            Array.from(new Set([...selectedUserIds, ...visibleUserIds])),
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => !nextOpen && onCancel()}
        >
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
                <DialogHeader className="border-b bg-muted/30 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Filter by User
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Search and select users to filter activity logs
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 px-6 py-5">
                    {/* Search and Filter Controls */}
                    <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <Label
                                htmlFor="user-search"
                                className="mb-2 flex items-center gap-2 text-sm font-medium"
                            >
                                <Search className="h-4 w-4 text-muted-foreground" />
                                Search User
                            </Label>
                            <Input
                                id="user-search"
                                type="text"
                                value={searchKeyword}
                                onChange={(event) => {
                                    onSearchChange(event.target.value);
                                }}
                                placeholder="Search by name, email, or ID..."
                                className="h-10"
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="user-role-filter"
                                className="mb-2 block text-sm font-medium"
                            >
                                Role
                            </Label>
                            <Select
                                value={roleFilter}
                                onValueChange={onRoleFilterChange}
                            >
                                <SelectTrigger
                                    id="user-role-filter"
                                    className="h-10"
                                >
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All roles
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        <ChessKingIcon className="size-4" />{' '}
                                        Admin
                                    </SelectItem>
                                    <SelectItem value="user">
                                        <User className="size-4" /> User
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label
                                htmlFor="user-status-filter"
                                className="mb-2 block text-sm font-medium"
                            >
                                Status
                            </Label>
                            <Select
                                value={statusFilter}
                                onValueChange={onStatusFilterChange}
                            >
                                <SelectTrigger
                                    id="user-status-filter"
                                    className="h-10"
                                >
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="enable">
                                        <CheckIcon className="size-4" /> Enabled
                                    </SelectItem>
                                    <SelectItem value="disable">
                                        <X className="size-4" /> Disabled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 p-4">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleToggleSelectVisibleUsers}
                                disabled={visibleUserIds.length === 0}
                                className="gap-2"
                            >
                                <UserCheck className="h-4 w-4" />
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
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                Clear Selection
                            </Button>
                        </div>
                        <Badge
                            variant="default"
                            className="gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                            <Check className="h-4 w-4" />
                            {selectedCount} selected
                        </Badge>
                    </div>

                    {/* Selected Users Preview */}
                    {displaySelectedUsers.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Selected Users
                            </Label>
                            <div className="flex max-h-20 flex-wrap gap-2 overflow-y-auto rounded-lg border bg-muted/20 p-3">
                                {displaySelectedUsers
                                    .slice(0, 8)
                                    .map((selectedUser) => (
                                        <Badge
                                            key={selectedUser.id}
                                            variant="outline"
                                            className="gap-1 bg-primary/5"
                                        >
                                            {selectedUser.name}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    onToggleUser(
                                                        selectedUser.id,
                                                    );
                                                }}
                                                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    ))}
                                {displaySelectedUsers.length > 8 && (
                                    <Badge variant="outline">
                                        +{displaySelectedUsers.length - 8} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* User List */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Available Users{' '}
                            {users.length > 0 && `(${users.length})`}
                        </Label>
                        <ScrollArea className="h-100 rounded-md border">
                            {isLoading && users.length === 0 && (
                                <div className="space-y-3 p-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            )}

                            {!isLoading && users.length === 0 && (
                                <div className="flex h-32 flex-col items-center justify-center text-center">
                                    <Search className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No users match your search
                                    </p>
                                </div>
                            )}

                            {users.map((user) => {
                                const isSelected = selectedUserIds.includes(
                                    user.id,
                                );

                                return (
                                    <label
                                        key={user.id}
                                        className="flex cursor-pointer items-start gap-3 border-b p-4 transition-colors last:border-b-0 hover:bg-muted/60"
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => {
                                                onToggleUser(user.id);
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-foreground">
                                                    {user.name}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                                >
                                                    {user.role === 'admin' && (
                                                        <ChessKingIcon className="size-4" />
                                                    )}
                                                    {user.role === 'user' && (
                                                        <UserIcon className="size-4" />
                                                    )}
                                                    <span className="capitalize">
                                                        {user.role}
                                                    </span>
                                                </Badge>
                                                <Badge
                                                    variant="secondary"
                                                    className={`gap-1 capitalize ${
                                                        user.status === 'enable'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                    }`}
                                                >
                                                    {user.status ===
                                                    'enable' ? (
                                                        <CheckIcon className="size-4" />
                                                    ) : (
                                                        <XIcon className="size-4" />
                                                    )}
                                                    {user.status === 'enable'
                                                        ? 'Enabled'
                                                        : 'Disabled'}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                                <MailIcon className="mr-2 inline-block h-4 w-4" />
                                                {user.email}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </label>
                                );
                            })}
                        </ScrollArea>
                    </div>

                    {hasMoreUsers && (
                        <div className="flex justify-center border-t pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onLoadMore}
                                disabled={isLoading}
                                className="w-full gap-2"
                            >
                                {isLoading && (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                )}
                                {isLoading
                                    ? 'Loading more users...'
                                    : 'Load More Users'}
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t bg-muted/30 px-6 py-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onApply}
                        disabled={selectedCount === 0}
                        className="gap-2"
                    >
                        <Check className="h-4 w-4" />
                        Apply Filter {selectedCount > 0 && `(${selectedCount})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
