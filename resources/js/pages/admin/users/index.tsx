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
import type {
    BreadcrumbItem,
    PaginatedData,
    User,
    UserFilters,
    UserStats,
} from '@/types';
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

interface Props {
    users: PaginatedData<User>;
    stats: UserStats;
    filters: UserFilters;
}

interface UsersIndexPageState {
    search: string;
    status: string;
    role: string;
    perPage: number;
    pendingSearch: string;
    pendingStatus: string;
    pendingRole: string;
    pendingPerPage: number;
    userToDelete: User | null;
    userToToggle: User | null;
    isDeleting: boolean;
    isToggling: boolean;
    isLoading: boolean;
    setSearch: (search: string) => void;
    setStatus: (status: string) => void;
    setRole: (role: string) => void;
    setPerPage: (perPage: number) => void;
    setUserToDelete: (userToDelete: User | null) => void;
    setUserToToggle: (userToToggle: User | null) => void;
    setIsDeleting: (isDeleting: boolean) => void;
    setIsToggling: (isToggling: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
    applyPendingFilters: () => void;
    initialize: (filters: UserFilters) => void;
    reset: () => void;
}

const useUsersIndexPageStore = create<UsersIndexPageState>((set, get) => ({
    search: '',
    status: '',
    role: '',
    perPage: 10,
    pendingSearch: '',
    pendingStatus: '',
    pendingRole: '',
    pendingPerPage: 10,
    userToDelete: null,
    userToToggle: null,
    isDeleting: false,
    isToggling: false,
    isLoading: false,
    setSearch: (search) => {
        set({ pendingSearch: search });
    },
    setStatus: (status) => {
        set({ pendingStatus: status });
    },
    setRole: (role) => {
        set({ pendingRole: role });
    },
    setPerPage: (perPage) => {
        set({ pendingPerPage: perPage });
    },
    setUserToDelete: (userToDelete) => {
        set({ userToDelete });
    },
    setUserToToggle: (userToToggle) => {
        set({ userToToggle });
    },
    setIsDeleting: (isDeleting) => {
        set({ isDeleting });
    },
    setIsToggling: (isToggling) => {
        set({ isToggling });
    },
    setIsLoading: (isLoading) => {
        set({ isLoading });
    },
    applyPendingFilters: () => {
        const { pendingSearch, pendingStatus, pendingRole, pendingPerPage } =
            get();
        set({
            search: pendingSearch,
            status: pendingStatus,
            role: pendingRole,
            perPage: pendingPerPage,
        });
    },
    initialize: (filters) => {
        set({
            search: filters.search,
            status: filters.status,
            role: filters.role,
            perPage: filters.per_page,
            pendingSearch: filters.search,
            pendingStatus: filters.status,
            pendingRole: filters.role,
            pendingPerPage: filters.per_page,
            userToDelete: null,
            userToToggle: null,
            isDeleting: false,
            isToggling: false,
            isLoading: false,
        });
    },
    reset: () => {
        set({
            search: '',
            status: '',
            role: '',
            perPage: 10,
            pendingSearch: '',
            pendingStatus: '',
            pendingRole: '',
            pendingPerPage: 10,
            userToDelete: null,
            userToToggle: null,
            isDeleting: false,
            isToggling: false,
            isLoading: false,
        });
    },
}));

export default function UsersIndex({
    users: paginatedUsers,
    stats,
    filters,
}: Props) {
    const search = useUsersIndexPageStore((state) => state.search);
    const status = useUsersIndexPageStore((state) => state.status);
    const role = useUsersIndexPageStore((state) => state.role);
    const pendingSearch = useUsersIndexPageStore(
        (state) => state.pendingSearch,
    );
    const pendingStatus = useUsersIndexPageStore(
        (state) => state.pendingStatus,
    );
    const pendingRole = useUsersIndexPageStore((state) => state.pendingRole);
    const pendingPerPage = useUsersIndexPageStore(
        (state) => state.pendingPerPage,
    );
    const userToDelete = useUsersIndexPageStore((state) => state.userToDelete);
    const userToToggle = useUsersIndexPageStore((state) => state.userToToggle);
    const isDeleting = useUsersIndexPageStore((state) => state.isDeleting);
    const isToggling = useUsersIndexPageStore((state) => state.isToggling);
    const isLoading = useUsersIndexPageStore((state) => state.isLoading);
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
    const setIsDeleting = useUsersIndexPageStore(
        (state) => state.setIsDeleting,
    );
    const setIsToggling = useUsersIndexPageStore(
        (state) => state.setIsToggling,
    );
    const setIsLoading = useUsersIndexPageStore((state) => state.setIsLoading);
    const applyPendingFilters = useUsersIndexPageStore(
        (state) => state.applyPendingFilters,
    );
    const initialize = useUsersIndexPageStore((state) => state.initialize);
    const reset = useUsersIndexPageStore((state) => state.reset);

    useEffect(() => {
        initialize(filters);
    }, [filters, initialize]);

    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    const buildFilterParams = useCallback(
        (overrides?: Partial<UserFilters>): Record<string, string> => {
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

    const handleApplyFilters = () => {
        applyPendingFilters();
        const params = buildFilterParams({
            search: pendingSearch,
            status: pendingStatus,
            role: pendingRole,
            per_page: pendingPerPage,
        });

        if (pendingPerPage !== undefined) {
            params.per_page = String(pendingPerPage);
        }

        setIsLoading(true);
        router.get(users.index.url(), params, {
            replace: true,
            preserveScroll: true,
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setRole('');
        setPerPage(10);
        setIsLoading(true);
        router.get(
            users.index.url(),
            {},
            {
                replace: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Filters cleared.');
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
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

    const handleRestore = (userId: number) => {
        const toastId = toast.loading('Restoring user...');

        router.post(
            users.restore.url({ id: userId }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('User restored successfully', {
                        id: toastId,
                    });
                },
                onError: (errors: Record<string, string>) => {
                    const message =
                        Object.values(errors).join(', ') ||
                        'Failed to restore user';
                    toast.error(message, { id: toastId });
                },
            },
        );
    };

    const executeDelete = () => {
        if (!userToDelete || isDeleting) return;

        setIsDeleting(true);
        const toastId = toast.loading('Deleting user...');

        router.delete(users.destroy.url({ user: userToDelete.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User deleted successfully', {
                    id: toastId,
                    description:
                        'This user will be permanently deleted after 30 days.',
                    action: {
                        label: 'Undo',
                        onClick: () => {
                            handleRestore(userToDelete.id);
                        },
                    },
                });
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
                            onClick={() => {
                                router.visit(users.trashed.url());
                            }}
                            className="max-sm:w-full"
                        >
                            <Trash2 className="mr-2 size-4" />
                            View Trashed Users
                        </Button>
                        <Button
                            onClick={() => {
                                router.visit(users.create.url());
                            }}
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
                    search={pendingSearch}
                    status={pendingStatus}
                    role={pendingRole}
                    perPage={pendingPerPage}
                    onSearchChange={setSearch}
                    onStatusChange={setStatus}
                    onRoleChange={setRole}
                    onPerPageChange={setPerPage}
                    onClearFilters={handleClearFilters}
                    onApply={handleApplyFilters}
                    disabled={isLoading}
                />

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
                                                    onClick={() => {
                                                        handleView(user);
                                                    }}
                                                    className="h-8 w-8"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        handleEdit(user);
                                                    }}
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        handleToggleStatus(
                                                            user,
                                                        );
                                                    }}
                                                    className="h-8 w-8"
                                                >
                                                    <Power className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        handleDelete(user);
                                                    }}
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
                onOpenChange={() => {
                    setUserToDelete(null);
                }}
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
                            onClick={() => {
                                setUserToDelete(null);
                            }}
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
                onOpenChange={() => {
                    setUserToToggle(null);
                }}
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
                            onClick={() => {
                                setUserToToggle(null);
                            }}
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
