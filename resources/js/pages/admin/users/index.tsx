import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Paginations } from '@/components/ui/pagination';
import { UsersFilters } from '@/components/users/users-filters';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem, User, UserPagination } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Power, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index.url(),
    },
];

interface Stats {
    total: number;
    enabled: number;
    disabled: number;
    admins: number;
}

interface Filters {
    search: string;
    status: string;
    role: string;
    per_page: number;
}

interface Props extends UserPagination {
    stats: Stats;
    filters: Filters;
}

interface UsersIndexPageState {
    search: string;
    status: string;
    role: string;
    perPage: number;
    userToDelete: User | null;
    userToToggle: User | null;
    isDeleting: boolean;
    isToggling: boolean;
    setSearch: (search: string) => void;
    setStatus: (status: string) => void;
    setRole: (role: string) => void;
    setPerPage: (perPage: number) => void;
    setUserToDelete: (userToDelete: User | null) => void;
    setUserToToggle: (userToToggle: User | null) => void;
    setIsDeleting: (isDeleting: boolean) => void;
    setIsToggling: (isToggling: boolean) => void;
    initialize: (filters: Filters) => void;
}

const useUsersIndexPageStore = create<UsersIndexPageState>((set) => ({
    search: '',
    status: '',
    role: '',
    perPage: 10,
    userToDelete: null,
    userToToggle: null,
    isDeleting: false,
    isToggling: false,
    setSearch: (search) => set({ search }),
    setStatus: (status) => set({ status }),
    setRole: (role) => set({ role }),
    setPerPage: (perPage) => set({ perPage }),
    setUserToDelete: (userToDelete) => set({ userToDelete }),
    setUserToToggle: (userToToggle) => set({ userToToggle }),
    setIsDeleting: (isDeleting) => set({ isDeleting }),
    setIsToggling: (isToggling) => set({ isToggling }),
    initialize: (filters) =>
        set({
            search: filters.search,
            status: filters.status,
            role: filters.role,
            perPage: filters.per_page,
            userToDelete: null,
            userToToggle: null,
            isDeleting: false,
            isToggling: false,
        }),
}));

export default function UsersIndex({
    users: paginatedUsers,
    stats,
    filters,
}: Props) {
    const search = useUsersIndexPageStore((state) => state.search);
    const status = useUsersIndexPageStore((state) => state.status);
    const role = useUsersIndexPageStore((state) => state.role);
    const perPage = useUsersIndexPageStore((state) => state.perPage);
    const userToDelete = useUsersIndexPageStore((state) => state.userToDelete);
    const userToToggle = useUsersIndexPageStore((state) => state.userToToggle);
    const isDeleting = useUsersIndexPageStore((state) => state.isDeleting);
    const isToggling = useUsersIndexPageStore((state) => state.isToggling);
    const setSearch = useUsersIndexPageStore((state) => state.setSearch);
    const setStatus = useUsersIndexPageStore((state) => state.setStatus);
    const setRole = useUsersIndexPageStore((state) => state.setRole);
    const setPerPage = useUsersIndexPageStore((state) => state.setPerPage);
    const setUserToDelete = useUsersIndexPageStore(
        (state) => state.setUserToDelete,
    );
    const setUserToToggle = useUsersIndexPageStore(
        (state) => state.setUserToToggle,
    );
    const setIsDeleting = useUsersIndexPageStore((state) => state.setIsDeleting);
    const setIsToggling = useUsersIndexPageStore((state) => state.setIsToggling);
    const initialize = useUsersIndexPageStore((state) => state.initialize);

    useEffect(() => {
        initialize(filters);
    }, [filters, initialize]);

    const buildFilterParams = useCallback(
        (overrides?: Partial<Filters>): Record<string, string> => {
            const params: Record<string, string> = {};
            const currentSearch = overrides?.search ?? search;
            const currentStatus = overrides?.status ?? status;
            const currentRole = overrides?.role ?? role;

            if (currentSearch && currentSearch !== '') {
                params.search = currentSearch;
            }
            if (
                currentStatus &&
                currentStatus !== '' &&
                currentStatus !== 'all'
            ) {
                params.status = currentStatus;
            }
            if (currentRole && currentRole !== '' && currentRole !== 'all') {
                params.role = currentRole;
            }

            return params;
        },
        [search, status, role],
    );

    const handleFilterChange = (newFilters: Partial<Filters>) => {
        const params = buildFilterParams(newFilters);

        if (newFilters.per_page !== undefined) {
            params.per_page = String(newFilters.per_page);
        }

        router.get(users.index.url(), params, { replace: true });
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                const params = buildFilterParams();
                if (search === '') {
                    delete params.search;
                } else {
                    params.search = search;
                }
                router.get(users.index.url(), params, { replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [buildFilterParams, filters.search, search]);

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setRole('');
        setPerPage(10);
        router.get(users.index.url(), {}, { replace: true });
    };

    const handleView = (user: User) => {
        router.visit(users.show.url({ user: user.id }));
    };

    const handleEdit = (user: User) => {
        router.visit(users.edit.url({ user: user.id }));
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
    };

    const executeDelete = () => {
        if (!userToDelete || isDeleting) return;

        setIsDeleting(true);
        const toastId = toast.loading('Deleting user...');

        router.delete(users.destroy.url({ user: userToDelete.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User deleted successfully', { id: toastId });
                setUserToDelete(null);
            },
            onError: (errors: Record<string, string>) => {
                const message =
                    Object.values(errors).join(', ') || 'Failed to delete user';
                toast.error(message, { id: toastId });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleToggleStatus = (user: User) => {
        setUserToToggle(user);
    };

    const executeToggleStatus = () => {
        if (!userToToggle || isToggling) return;

        setIsToggling(true);
        const toastId = toast.loading('Updating status...');

        router.post(
            users.toggleStatus.url({ id: userToToggle.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('User status updated successfully', {
                        id: toastId,
                    });
                    setUserToToggle(null);
                },
                onError: (errors: Record<string, string>) => {
                    const message =
                        Object.values(errors).join(', ') ||
                        'Failed to update status';
                    toast.error(message, { id: toastId });
                },
                onFinish: () => {
                    setIsToggling(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary p-2">
                            <Users className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Users Management
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage user accounts, roles, and permissions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 max-sm:w-full max-sm:flex-col sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(users.trashed.url())}
                            className="max-sm:w-full"
                        >
                            <Trash2 className="mr-2 size-4" />
                            View Trashed Users
                        </Button>
                        <Button
                            onClick={() => router.visit(users.create.url())}
                            className="max-sm:w-full"
                        >
                            <Plus className="mr-2 size-4" />
                            Add User
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            Total Users
                        </p>
                        <p className="text-2xl font-semibold">{stats.total}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Enabled</p>
                        <p className="text-2xl font-semibold">
                            {stats.enabled}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            Disabled
                        </p>
                        <p className="text-2xl font-semibold">
                            {stats.disabled}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Admins</p>
                        <p className="text-2xl font-semibold">{stats.admins}</p>
                    </div>
                </div>

                {/* Filters */}
                <UsersFilters
                    search={search}
                    status={status}
                    role={role}
                    perPage={perPage}
                    onSearchChange={setSearch}
                    onStatusChange={(value) => {
                        setStatus(value);
                        handleFilterChange({ status: value });
                    }}
                    onRoleChange={(value) => {
                        setRole(value);
                        handleFilterChange({ role: value });
                    }}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        handleFilterChange({ per_page: value });
                    }}
                    onClearFilters={handleClearFilters}
                />

                {/* Search debounce effect */}
                <input type="hidden" name="search" value={search} readOnly />

                {/* Table */}
                <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        User
                                    </th>
                                    <th className="hidden h-12 px-4 text-left align-middle font-medium text-muted-foreground md:table-cell">
                                        Role
                                    </th>
                                    <th className="hidden h-12 px-4 text-left align-middle font-medium text-muted-foreground lg:table-cell">
                                        Status
                                    </th>
                                    <th className="hidden h-12 px-4 text-left align-middle font-medium text-muted-foreground lg:table-cell">
                                        Created
                                    </th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage
                                                        src={
                                                            user.avatar_url ??
                                                            undefined
                                                        }
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback>
                                                        {user.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden p-4 align-middle md:table-cell">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="hidden p-4 align-middle lg:table-cell">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    user.status === 'enable'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}
                                            >
                                                {user.status === 'enable'
                                                    ? 'Enabled'
                                                    : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="hidden p-4 align-middle text-muted-foreground lg:table-cell">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right align-middle">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleView(user)
                                                    }
                                                    className="h-8 w-8"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(user)
                                                    }
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleToggleStatus(user)
                                                    }
                                                    className="h-8 w-8"
                                                >
                                                    <Power className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(user)
                                                    }
                                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedUsers.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <Paginations pagination={paginatedUsers} />
            </div>

            {/* Delete Confirmation Modal */}
            <AlertDialog
                open={!!userToDelete}
                onOpenChange={() => setUserToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {userToDelete?.name}
                            ? This action can be undone by restoring the user
                            from trash.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setUserToDelete(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Toggle Status Confirmation Modal */}
            <AlertDialog
                open={!!userToToggle}
                onOpenChange={() => setUserToToggle(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {userToToggle?.status === 'enable'
                                ? 'Disable'
                                : 'Enable'}{' '}
                            User
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to{' '}
                            {userToToggle?.status === 'enable'
                                ? 'disable'
                                : 'enable'}{' '}
                            {userToToggle?.name}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setUserToToggle(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeToggleStatus}
                            disabled={isToggling}
                        >
                            {isToggling ? 'Updating...' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
