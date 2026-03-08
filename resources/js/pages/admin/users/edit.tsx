import { PhotoUploadModal } from '@/components/avatar';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem, EditUserFormData, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, LoaderCircleIcon, UserCog } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

interface Props {
    user: User;
}

interface EditUserPageState {
    formData: EditUserFormData;
    validationErrors: Record<string, string>;
    processing: boolean;
    showPasswordFields: boolean;
    isUploadingAvatar: boolean;
    showAvatarModal: boolean;
    setFormData: (formData: EditUserFormData) => void;
    setValidationErrors: (validationErrors: Record<string, string>) => void;
    setProcessing: (processing: boolean) => void;
    setShowPasswordFields: (showPasswordFields: boolean) => void;
    setIsUploadingAvatar: (isUploadingAvatar: boolean) => void;
    setShowAvatarModal: (showAvatarModal: boolean) => void;
    initialize: (formData: EditUserFormData) => void;
}

const useEditUserPageStore = create<EditUserPageState>((set) => ({
    formData: {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        status: 'enable',
    },
    validationErrors: {},
    processing: false,
    showPasswordFields: false,
    isUploadingAvatar: false,
    showAvatarModal: false,
    setFormData: (formData) => {
        set({ formData });
    },
    setValidationErrors: (validationErrors) => {
        set({ validationErrors });
    },
    setProcessing: (processing) => {
        set({ processing });
    },
    setShowPasswordFields: (showPasswordFields) => {
        set({ showPasswordFields });
    },
    setIsUploadingAvatar: (isUploadingAvatar) => {
        set({ isUploadingAvatar });
    },
    setShowAvatarModal: (showAvatarModal) => {
        set({ showAvatarModal });
    },
    initialize: (formData) => {
        set({
            formData,
            validationErrors: {},
            processing: false,
            showPasswordFields: false,
            isUploadingAvatar: false,
            showAvatarModal: false,
        });
    },
}));

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index.url(),
    },
    {
        title: 'Edit',
        href: users.edit.url({ user: 0 }),
    },
];

export default function EditUser({ user }: Props) {
    const page = usePage();
    const flash = page.props.flash as
        | { success?: string; error?: string }
        | undefined;
    const formData = useEditUserPageStore((state) => state.formData);
    const validationErrors = useEditUserPageStore(
        (state) => state.validationErrors,
    );
    const processing = useEditUserPageStore((state) => state.processing);
    const showPasswordFields = useEditUserPageStore(
        (state) => state.showPasswordFields,
    );
    const isUploadingAvatar = useEditUserPageStore(
        (state) => state.isUploadingAvatar,
    );
    const showAvatarModal = useEditUserPageStore(
        (state) => state.showAvatarModal,
    );
    const setFormData = useEditUserPageStore((state) => state.setFormData);
    const setValidationErrors = useEditUserPageStore(
        (state) => state.setValidationErrors,
    );
    const setProcessing = useEditUserPageStore((state) => state.setProcessing);
    const setShowPasswordFields = useEditUserPageStore(
        (state) => state.setShowPasswordFields,
    );
    const setIsUploadingAvatar = useEditUserPageStore(
        (state) => state.setIsUploadingAvatar,
    );
    const setShowAvatarModal = useEditUserPageStore(
        (state) => state.setShowAvatarModal,
    );
    const initialize = useEditUserPageStore((state) => state.initialize);

    useEffect(() => {
        initialize({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
            status: user.status,
        });
    }, [initialize, user.email, user.name, user.role, user.status]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const hasChanges =
        formData.name !== user.name ||
        formData.email !== user.email ||
        formData.role !== user.role ||
        formData.status !== user.status ||
        formData.password !== '';

    const handleAvatarUpload = (file: File) => {
        setIsUploadingAvatar(true);
        const toastId = toast.loading('Updating avatar...');

        const formData = new FormData();
        formData.append('avatar', file);

        router.patch(users.updateAvatar.url({ id: user.id }), formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Avatar updated successfully', { id: toastId });
            },
            onError: (errors: Record<string, string>) => {
                toast.error(errors.avatar || 'Failed to update avatar', {
                    id: toastId,
                });
            },
            onFinish: () => {
                setIsUploadingAvatar(false);
            },
        });
    };

    const handleAvatarDelete = () => {
        setIsUploadingAvatar(true);
        const toastId = toast.loading('Removing avatar...');

        router.delete(users.deleteAvatar.url({ id: user.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Avatar removed successfully', { id: toastId });
            },
            onError: (errors: Record<string, string>) => {
                toast.error(errors.avatar || 'Failed to remove avatar', {
                    id: toastId,
                });
            },
            onFinish: () => {
                setIsUploadingAvatar(false);
            },
        });
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setProcessing(true);
        setValidationErrors({});

        const dataToSubmit: Record<string, string> = {};

        if (formData.name !== user.name) {
            dataToSubmit.name = formData.name.trim();
        }

        if (formData.email !== user.email) {
            dataToSubmit.email = formData.email.trim();
        }

        if (formData.role !== user.role) {
            dataToSubmit.role = formData.role;
        }

        if (formData.status !== user.status) {
            dataToSubmit.status = formData.status;
        }

        if (formData.password && formData.password.length > 0) {
            dataToSubmit.password = formData.password;
            dataToSubmit.password_confirmation = formData.password_confirmation;
        }

        const errors: Record<string, string> = {};

        if (dataToSubmit.name) {
            if (dataToSubmit.name.length < 2) {
                errors.name = 'Name must be at least 2 characters';
            }
        }

        if (dataToSubmit.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(dataToSubmit.email)) {
                errors.email = 'Please enter a valid email address';
            }
        }

        if (dataToSubmit.password) {
            if (dataToSubmit.password.length < 8) {
                errors.password = 'Password must be at least 8 characters';
            }
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(dataToSubmit.password)) {
                errors.password =
                    'Password must contain uppercase, lowercase, and number';
            }
            if (dataToSubmit.password !== dataToSubmit.password_confirmation) {
                errors.password_confirmation = 'Passwords must match';
            }
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix the validation errors');
            setProcessing(false);
            return;
        }

        if (Object.keys(dataToSubmit).length === 0) {
            toast.info('No changes to save');
            setProcessing(false);
            return;
        }

        const toastId = toast.loading('Updating user...');

        router.put(users.update.url({ user: user.id }), dataToSubmit, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User updated successfully', { id: toastId });
                setFormData({
                    ...formData,
                    password: '',
                    password_confirmation: '',
                });
                setValidationErrors({});
                setShowPasswordFields(false);
            },
            onError: (errors: Record<string, string>) => {
                setValidationErrors(errors);
                toast.error('Failed to update user', { id: toastId });
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleCancel = (): void => {
        window.history.back();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancel}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Edit User
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Update user information and permissions
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>User Information</CardTitle>
                        </div>
                        <CardDescription>
                            Update the details below. Leave password blank to
                            keep it unchanged.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div
                                    className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border-2 border-muted"
                                    onClick={() => {
                                        setShowAvatarModal(true);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' ||
                                            e.key === ' '
                                        ) {
                                            setShowAvatarModal(true);
                                        }
                                    }}
                                >
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted text-xl font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <span className="text-xs text-white">
                                            Change
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.avatar_url
                                            ? 'Click to change profile photo'
                                            : 'No profile photo'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            });
                                        }}
                                        placeholder="John Doe"
                                        autoFocus
                                    />
                                    <InputError
                                        message={validationErrors.name}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            });
                                        }}
                                        placeholder="john@example.com"
                                    />
                                    <InputError
                                        message={validationErrors.email}
                                    />
                                </div>
                            </div>

                            {!showPasswordFields ? (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">
                                                Password
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Want to change the password?
                                                Click the button below.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowPasswordFields(true);
                                            }}
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            New Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                });
                                            }}
                                            placeholder="Leave blank to keep current"
                                        />
                                        <InputError
                                            message={validationErrors.password}
                                        />
                                        {formData.password && (
                                            <p className="text-xs text-muted-foreground">
                                                Must be at least 8 characters
                                                with uppercase, lowercase, and
                                                number
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm New Password
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={
                                                formData.password_confirmation
                                            }
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    password_confirmation:
                                                        e.target.value,
                                                });
                                            }}
                                            placeholder="Confirm new password"
                                        />
                                        <InputError
                                            message={
                                                validationErrors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowPasswordFields(false);
                                                setFormData({
                                                    ...formData,
                                                    password: '',
                                                    password_confirmation: '',
                                                });
                                            }}
                                        >
                                            Cancel Password Change
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(
                                            v: 'admin' | 'user',
                                        ) => {
                                            setFormData({
                                                ...formData,
                                                role: v,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">
                                                User
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={validationErrors.role}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(
                                            v: 'enable' | 'disable',
                                        ) => {
                                            setFormData({
                                                ...formData,
                                                status: v,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="enable">
                                                Enabled
                                            </SelectItem>
                                            <SelectItem value="disable">
                                                Disabled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={validationErrors.status}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center">
                                <Button
                                    type="submit"
                                    disabled={processing || !hasChanges}
                                    className="w-full sm:w-auto"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircleIcon className="size-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <UserCog className="mr-2 size-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <PhotoUploadModal
                    open={showAvatarModal}
                    onOpenChange={setShowAvatarModal}
                    currentAvatar={user.avatar_original_url ?? user.avatar_url}
                    userName={user.name}
                    userId={user.id}
                    onUpload={handleAvatarUpload}
                    onDelete={handleAvatarDelete}
                    canDelete={!!user.avatar_url}
                    isUploading={isUploadingAvatar}
                    isDeleting={isUploadingAvatar}
                />
            </div>
        </AppLayout>
    );
}
