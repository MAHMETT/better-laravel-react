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
import type { BreadcrumbItem, PaginatedData, User, UserFilters } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Eye, RefreshCw, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index.url(),
    },
    {
        title: 'Trashed',
        href: users.trashed.url(),
    },
];

interface Props {
    users: PaginatedData<User>;
    filters: UserFilters;
}

interface UsersTrashedPageState {
    search: string;
    status: string;
    role: string;
    perPage: number;
    pendingSearch: string;
    pendingStatus: string;
    pendingRole: string;
    pendingPerPage: number;
    userToRestore: User | null;
    userToDelete: User | null;
    isRestoring: boolean;
    isDeleting: boolean;
    isLoading: boolean;
    setSearch: (search: string) => void;
    setStatus: (status: string) => void;
    setRole: (role: string) => void;
    setPerPage: (perPage: number) => void;
    setUserToRestore: (userToRestore: User | null) => void;
    setUserToDelete: (userToDelete: User | null) => void;
    setIsRestoring: (isRestoring: boolean) => void;
    setIsDeleting: (isDeleting: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
    applyPendingFilters: () => void;
    initialize: (filters: UserFilters) => void;
    reset: () => void;
}

const useUsersTrashedPageStore = create<UsersTrashedPageState>((set, get) => ({
    search: '',
    status: '',
    role: '',
    perPage: 10,
    pendingSearch: '',
    pendingStatus: '',
    pendingRole: '',
    pendingPerPage: 10,
    userToRestore: null,
    userToDelete: null,
    isRestoring: false,
    isDeleting: false,
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
    setUserToRestore: (userToRestore) => {
        set({ userToRestore });
    },
    setUserToDelete: (userToDelete) => {
        set({ userToDelete });
    },
    setIsRestoring: (isRestoring) => {
        set({ isRestoring });
    },
    setIsDeleting: (isDeleting) => {
        set({ isDeleting });
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
            userToRestore: null,
            userToDelete: null,
            isRestoring: false,
            isDeleting: false,
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
            userToRestore: null,
            userToDelete: null,
            isRestoring: false,
            isDeleting: false,
            isLoading: false,
        });
    },
}));

export default function UsersTrashed({
    users: paginatedUsers,
    filters,
}: Props) {
    const search = useUsersTrashedPageStore((state) => state.search);
    const status = useUsersTrashedPageStore((state) => state.status);
    const role = useUsersTrashedPageStore((state) => state.role);
    const pendingSearch = useUsersTrashedPageStore(
        (state) => state.pendingSearch,
    );
    const pendingStatus = useUsersTrashedPageStore(
        (state) => state.pendingStatus,
    );
    const pendingRole = useUsersTrashedPageStore((state) => state.pendingRole);
    const pendingPerPage = useUsersTrashedPageStore(
        (state) => state.pendingPerPage,
    );
    const userToRestore = useUsersTrashedPageStore(
        (state) => state.userToRestore,
    );
    const userToDelete = useUsersTrashedPageStore(
        (state) => state.userToDelete,
    );
    const isRestoring = useUsersTrashedPageStore((state) => state.isRestoring);
    const isDeleting = useUsersTrashedPageStore((state) => state.isDeleting);
    const isLoading = useUsersTrashedPageStore((state) => state.isLoading);
    const setSearch = useUsersTrashedPageStore((state) => state.setSearch);
    const setStatus = useUsersTrashedPageStore((state) => state.setStatus);
    const setRole = useUsersTrashedPageStore((state) => state.setRole);
    const setPerPage = useUsersTrashedPageStore((state) => state.setPerPage);
    const setUserToRestore = useUsersTrashedPageStore(
        (state) => state.setUserToRestore,
    );
    const setUserToDelete = useUsersTrashedPageStore(
        (state) => state.setUserToDelete,
    );
    const setIsRestoring = useUsersTrashedPageStore(
        (state) => state.setIsRestoring,
    );
    const setIsDeleting = useUsersTrashedPageStore(
        (state) => state.setIsDeleting,
    );
    const setIsLoading = useUsersTrashedPageStore(
        (state) => state.setIsLoading,
    );
    const applyPendingFilters = useUsersTrashedPageStore(
        (state) => state.applyPendingFilters,
    );
    const initialize = useUsersTrashedPageStore((state) => state.initialize);
    const reset = useUsersTrashedPageStore((state) => state.reset);

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
        router.get(users.trashed.url(), params, {
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
            users.trashed.url(),
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

    const handleRestore = (user: User) => {
        setUserToRestore(user);
    };

    const executeRestore = () => {
        if (!userToRestore || isRestoring) return;

        setIsRestoring(true);
        const toastId = toast.loading('Restoring user...');

        router.post(
            users.restore.url({ id: userToRestore.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('User restored successfully', {
                        id: toastId,
                    });
                    setUserToRestore(null);
                },
                onError: (errors: Record<string, string>) => {
                    const message =
                        Object.values(errors).join(', ') ||
                        'Failed to restore user';
                    toast.error(message, { id: toastId });
                },
                onFinish: () => {
                    setIsRestoring(false);
                },
            },
        );
    };

    const handleForceDelete = (user: User) => {
        setUserToDelete(user);
    };

    const executeForceDelete = () => {
        if (!userToDelete || isDeleting) return;

        setIsDeleting(true);
        const toastId = toast.loading('Permanently deleting user...');

        router.delete(users.forceDelete.url({ id: userToDelete.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User permanently deleted', { id: toastId });
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

    const handleBack = () => {
        window.history.back();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trashed Users" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900">
                            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Trashed Users
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage deleted user accounts
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 max-sm:w-full max-sm:flex-col sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="max-sm:w-full"
                        >
                            <Users className="mr-2 size-4" />
                            Back to Users
                        </Button>
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
                                        Deleted
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
                                            {user.deleted_at
                                                ? new Date(
                                                      user.deleted_at,
                                                  ).toLocaleDateString()
                                                : 'N/A'}
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
                                                        handleRestore(user);
                                                    }}
                                                    className="h-8 w-8 text-green-500 hover:text-green-600"
                                                >
                                                    <RefreshCw className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        handleForceDelete(user);
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
                                            No trashed users found.
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

            {/* Restore Confirmation Modal */}
            <AlertDialog
                open={!!userToRestore}
                onOpenChange={() => {
                    setUserToRestore(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to restore{' '}
                            {userToRestore?.name}? This will bring the user back
                            to the active list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeRestore}
                            disabled={isRestoring}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isRestoring ? 'Restoring...' : 'Restore'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Force Delete Confirmation Modal */}
            <AlertDialog
                open={!!userToDelete}
                onOpenChange={() => {
                    setUserToDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Permanently Delete User
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete{' '}
                            {userToDelete?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeForceDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
