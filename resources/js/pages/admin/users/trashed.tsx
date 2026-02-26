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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { UsersFilters } from '@/components/users/users-filters';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Eye, RefreshCw, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    status: 'enable' | 'disable';
    avatar_url?: string | null;
    deleted_at: string;
    created_at: string;
}

interface Filters {
    search: string;
    status: string;
    role: string;
    per_page: number;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: Filters;
}

export default function UsersTrashed({
    users: paginatedUsers,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [role, setRole] = useState(filters.role);

    const buildFilterParams = (
        overrides?: Partial<Filters>,
    ): Record<string, string> => {
        const params: Record<string, string> = {};
        const currentSearch = overrides?.search ?? search;
        const currentStatus = overrides?.status ?? status;
        const currentRole = overrides?.role ?? role;

        if (currentSearch && currentSearch !== '') {
            params.search = currentSearch;
        }
        if (currentStatus && currentStatus !== '' && currentStatus !== 'all') {
            params.status = currentStatus;
        }
        if (currentRole && currentRole !== '' && currentRole !== 'all') {
            params.role = currentRole;
        }

        return params;
    };

    const handleFilterChange = (newFilters: Partial<Filters>) => {
        const params = buildFilterParams(newFilters);

        if (newFilters.per_page !== undefined) {
            params.per_page = String(newFilters.per_page);
        }

        router.get(users.trashed.url(), params, { replace: true });
    };
    const [perPage, setPerPage] = useState(filters.per_page);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                const params = buildFilterParams();
                if (search === '') {
                    delete params.search;
                } else {
                    params.search = search;
                }
                router.get(users.trashed.url(), params, { replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const [userToRestore, setUserToRestore] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setRole('');
        setPerPage(10);
        router.get(users.trashed.url(), {}, { replace: true });
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

    const handlePageChange = (page: number) => {
        const link = paginatedUsers.links.find((l) => l.label === String(page));
        if (link?.url) {
            router.visit(link.url, { replace: true });
        }
    };

    const handleBack = () => {
        router.visit(users.index.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trashed Users" />

            <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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
                            <Users className="mr-2 h-4 w-4" />
                            Back to Users
                        </Button>
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
                                            {new Date(
                                                user.deleted_at,
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
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleRestore(user)
                                                    }
                                                    className="h-8 w-8 text-green-500 hover:text-green-600"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleForceDelete(user)
                                                    }
                                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                {paginatedUsers.last_page > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (paginatedUsers.current_page > 1) {
                                            handlePageChange(
                                                paginatedUsers.current_page - 1,
                                            );
                                        }
                                    }}
                                    className={
                                        paginatedUsers.current_page === 1
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }
                                />
                            </PaginationItem>
                            {Array.from(
                                { length: paginatedUsers.last_page },
                                (_, i) => i + 1,
                            ).map((page) => {
                                const showPage =
                                    page === 1 ||
                                    page === paginatedUsers.last_page ||
                                    Math.abs(
                                        page - paginatedUsers.current_page,
                                    ) <= 1;

                                const showEllipsisBefore =
                                    page === paginatedUsers.current_page - 2 &&
                                    page > 2;
                                const showEllipsisAfter =
                                    page === paginatedUsers.current_page + 2 &&
                                    page < paginatedUsers.last_page - 1;

                                if (
                                    !showPage &&
                                    !showEllipsisBefore &&
                                    !showEllipsisAfter
                                ) {
                                    return null;
                                }

                                if (showEllipsisBefore || showEllipsisAfter) {
                                    return (
                                        <PaginationEllipsis
                                            key={`ellipsis-${page}`}
                                        />
                                    );
                                }

                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(page);
                                            }}
                                            isActive={
                                                page ===
                                                paginatedUsers.current_page
                                            }
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (
                                            paginatedUsers.current_page <
                                            paginatedUsers.last_page
                                        ) {
                                            handlePageChange(
                                                paginatedUsers.current_page + 1,
                                            );
                                        }
                                    }}
                                    className={
                                        paginatedUsers.current_page ===
                                        paginatedUsers.last_page
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            {/* Restore Confirmation Modal */}
            <AlertDialog
                open={!!userToRestore}
                onOpenChange={() => setUserToRestore(null)}
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
                onOpenChange={() => setUserToDelete(null)}
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
