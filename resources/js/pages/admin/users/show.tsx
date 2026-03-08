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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import activityLogs from '@/routes/activity-logs';
import users from '@/routes/users';
import type { BreadcrumbItem, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    History,
    IdCard,
    Mail,
    Pencil,
    Power,
    Shield,
    Trash2,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface Props {
    user: User;
}

interface ShowUserPageState {
    showDeleteModal: boolean;
    showToggleModal: boolean;
    isDeleting: boolean;
    isToggling: boolean;
    setShowDeleteModal: (showDeleteModal: boolean) => void;
    setShowToggleModal: (showToggleModal: boolean) => void;
    setIsDeleting: (isDeleting: boolean) => void;
    setIsToggling: (isToggling: boolean) => void;
    reset: () => void;
}

const useShowUserPageStore = create<ShowUserPageState>((set) => ({
    showDeleteModal: false,
    showToggleModal: false,
    isDeleting: false,
    isToggling: false,
    setShowDeleteModal: (showDeleteModal) => {
        set({ showDeleteModal });
    },
    setShowToggleModal: (showToggleModal) => {
        set({ showToggleModal });
    },
    setIsDeleting: (isDeleting) => {
        set({ isDeleting });
    },
    setIsToggling: (isToggling) => {
        set({ isToggling });
    },
    reset: () => {
        set({
            showDeleteModal: false,
            showToggleModal: false,
            isDeleting: false,
            isToggling: false,
        });
    },
}));

export default function ShowUser({ user }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: users.index.url(),
        },
        {
            title: 'Details',
            href: users.show.url({ user: user.id }),
        },
    ];

    const showDeleteModal = useShowUserPageStore(
        (state) => state.showDeleteModal,
    );
    const showToggleModal = useShowUserPageStore(
        (state) => state.showToggleModal,
    );
    const isDeleting = useShowUserPageStore((state) => state.isDeleting);
    const isToggling = useShowUserPageStore((state) => state.isToggling);
    const setShowDeleteModal = useShowUserPageStore(
        (state) => state.setShowDeleteModal,
    );
    const setShowToggleModal = useShowUserPageStore(
        (state) => state.setShowToggleModal,
    );
    const setIsDeleting = useShowUserPageStore((state) => state.setIsDeleting);
    const setIsToggling = useShowUserPageStore((state) => state.setIsToggling);
    const resetStore = useShowUserPageStore((state) => state.reset);

    useEffect(() => {
        resetStore();
    }, [resetStore]);

    const handleEdit = () => {
        router.visit(users.edit.url({ user: user.id }));
    };

    const handleViewActivityLogs = () => {
        router.visit(activityLogs.user.url({ user: user.id }));
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const executeDelete = () => {
        if (isDeleting) return;

        setIsDeleting(true);
        const toastId = toast.loading('Deleting user...');

        router.delete(users.destroy.url({ user: user.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User deleted successfully', {
                    id: toastId,
                    description:
                        'This user will be permanently deleted after 30 days.',
                    action: {
                        label: 'Undo',
                        onClick: () => {
                            handleRestore(user.id);
                        },
                    },
                });
                setShowDeleteModal(false);
                window.history.back();
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
                    window.history.back();
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

    const handleToggleStatus = () => {
        setShowToggleModal(true);
    };

    const executeToggleStatus = () => {
        if (isToggling) return;

        setIsToggling(true);
        const toastId = toast.loading('Updating status...');

        router.post(
            users.toggleStatus.url({ id: user.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status updated successfully', {
                        id: toastId,
                    });
                    setShowToggleModal(false);
                    router.reload({ only: ['user'] });
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

    const handleBack = () => {
        window.history.back();
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = () => {
        if (user.deleted_at) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Deleted
                </Badge>
            );
        }
        return user.status === 'enable' ? (
            <Badge className="gap-1 bg-green-500">
                <UserCheck className="h-3 w-3" />
                Enabled
            </Badge>
        ) : (
            <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Disabled
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {user.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={handleViewActivityLogs}
                        >
                            <History className="mr-2 size-4" />
                            Activity Logs
                        </Button>
                        <Button variant="outline" onClick={handleEdit}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Button>
                        <Button
                            variant={
                                user.status === 'enable' && !user.deleted_at
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={handleToggleStatus}
                            disabled={!!user.deleted_at}
                        >
                            <Power className="mr-2 size-4" />
                            {user.deleted_at
                                ? 'Deleted'
                                : user.status === 'enable'
                                  ? 'Disable'
                                  : 'Enable'}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={!!user.deleted_at}
                        >
                            <Trash2 className="mr-2 size-4" />
                            {user.deleted_at ? 'Already Deleted' : 'Delete'}
                        </Button>
                    </div>
                </div>

                {/* User Summary Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage
                                        src={
                                            user.avatar_original_url ??
                                            user.avatar_url ??
                                            undefined
                                        }
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="text-xl font-semibold">
                                        {user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">
                                        {user.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        {user.email}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="gap-1 bg-purple-500">
                                    <Shield className="h-3 w-3" />
                                    {user.role === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                                {getStatusBadge()}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Information Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <IdCard className="h-4 w-4" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    User ID
                                </p>
                                <p className="mt-1 text-sm">{user.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Name
                                </p>
                                <p className="mt-1 text-sm">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Email
                                </p>
                                <p className="mt-1 text-sm">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Account Created
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-sm">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    {formatDate(user.created_at)}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Last Updated
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-sm">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    {formatDate(user.updated_at)}
                                </div>
                            </div>
                            {user.deleted_at && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Deleted At
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-red-500">
                                        <Trash2 className="h-3 w-3" />
                                        {formatDate(user.deleted_at)}
                                    </div>
                                    <p className="mt-2 text-xs text-amber-600">
                                        Will be permanently deleted 30 days
                                        after soft deletion
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Shield className="h-4 w-4" />
                                System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Internal ID
                                </p>
                                <p className="mt-1 font-mono text-sm">
                                    #{user.id}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Account Age
                                </p>
                                <p className="mt-1 text-sm">
                                    {user.created_at
                                        ? Math.floor(
                                              (new Date().getTime() -
                                                  new Date(
                                                      user.created_at,
                                                  ).getTime()) /
                                                  (1000 * 60 * 60 * 24),
                                          )
                                        : 0}{' '}
                                    days
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Confirmation Modal */}
                <AlertDialog
                    open={showDeleteModal}
                    onOpenChange={setShowDeleteModal}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete{' '}
                                <strong>{user.name}</strong>?
                                <div className="mt-3 rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                                    <p className="text-sm">
                                        This will soft delete the user. The user
                                        will be retained for 30 days before
                                        permanent deletion.
                                    </p>
                                    <p className="mt-2 text-xs font-medium">
                                        You can restore the user anytime during
                                        this period.
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={executeDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete User'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Toggle Status Confirmation Modal */}
                <AlertDialog
                    open={showToggleModal}
                    onOpenChange={setShowToggleModal}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {user.status === 'enable' && !user.deleted_at
                                    ? 'Disable'
                                    : 'Enable'}{' '}
                                User
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to{' '}
                                {user.status === 'enable' && !user.deleted_at
                                    ? 'disable'
                                    : 'enable'}{' '}
                                <strong>{user.name}</strong>?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={executeToggleStatus}
                                disabled={isToggling}
                            >
                                {isToggling ? 'Updating...' : 'Confirm'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
