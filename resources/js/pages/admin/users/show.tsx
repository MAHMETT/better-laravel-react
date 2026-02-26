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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Media {
    id: string;
    file_name: string;
    url: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: 'admin' | 'user';
    status: 'enable' | 'disable';
    avatar_url?: string | null;
    avatarMedia?: Media | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_enabled: boolean;
}

interface Props {
    user: User;
}

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

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleEdit = () => {
        router.visit(users.edit.url({ user: user.id }));
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
                toast.success('User deleted successfully', { id: toastId });
                setShowDeleteModal(false);
                router.visit(users.index.url());
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

    const handleBack = () =>
        window.history.back() ?? router.visit(users.index.url());

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant={
                                user.status === 'enable'
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={handleToggleStatus}
                        >
                            <Power className="mr-2 h-4 w-4" />
                            {user.status === 'enable' ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage
                                    src={user.avatar_url ?? undefined}
                                    alt={user.name}
                                />
                                <AvatarFallback className="text-lg">
                                    {user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{user.name}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Role
                                </p>
                                <p className="mt-1">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Status
                                </p>
                                <p className="mt-1">
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
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Created At
                                </p>
                                <p className="mt-1">
                                    {formatDate(user.created_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Updated At
                                </p>
                                <p className="mt-1">
                                    {formatDate(user.updated_at)}
                                </p>
                            </div>
                            {user.deleted_at && (
                                <div className="sm:col-span-2">
                                    <p className="text-sm font-medium text-red-500">
                                        Deleted At
                                    </p>
                                    <p className="mt-1 text-red-500">
                                        {formatDate(user.deleted_at)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Confirmation Modal */}
                <AlertDialog
                    open={showDeleteModal}
                    onOpenChange={setShowDeleteModal}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete {user.name}?
                                This action can be undone by restoring the user
                                from trash.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                    open={showToggleModal}
                    onOpenChange={setShowToggleModal}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {user.status === 'enable'
                                    ? 'Disable'
                                    : 'Enable'}{' '}
                                User
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to{' '}
                                {user.status === 'enable'
                                    ? 'disable'
                                    : 'enable'}{' '}
                                {user.name}?
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
