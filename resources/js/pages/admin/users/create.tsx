import { AvatarUploader } from '@/components/avatar';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
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
import { useInitials } from '@/hooks';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem, CreateUserFormData } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CameraIcon,
    CheckIcon,
    ChessKingIcon,
    LoaderCircleIcon,
    UserIcon,
    UserPlus,
    XIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index.url(),
    },
    {
        title: 'Create',
        href: users.create.url(),
    },
];

interface CreateUserPageState {
    formData: CreateUserFormData;
    validationErrors: Record<string, string>;
    processing: boolean;
    showAvatarModal: boolean;
    selectedAvatarFile: File | null;
    selectedAvatarPreview: string | null;
    setFormData: (formData: CreateUserFormData) => void;
    setValidationErrors: (validationErrors: Record<string, string>) => void;
    setProcessing: (processing: boolean) => void;
    setShowAvatarModal: (showAvatarModal: boolean) => void;
    setSelectedAvatarFile: (file: File | null) => void;
    setSelectedAvatarPreview: (url: string | null) => void;
    reset: () => void;
}

const initialFormData: CreateUserFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
    status: 'enable',
};

const useCreateUserPageStore = create<CreateUserPageState>((set) => ({
    formData: { ...initialFormData },
    validationErrors: {},
    processing: false,
    showAvatarModal: false,
    selectedAvatarFile: null,
    selectedAvatarPreview: null,
    setFormData: (formData) => {
        set({ formData });
    },
    setValidationErrors: (validationErrors) => {
        set({ validationErrors });
    },
    setProcessing: (processing) => {
        set({ processing });
    },
    setShowAvatarModal: (showAvatarModal) => {
        set({ showAvatarModal });
    },
    setSelectedAvatarFile: (selectedAvatarFile) => {
        set({ selectedAvatarFile });
    },
    setSelectedAvatarPreview: (selectedAvatarPreview) => {
        set({ selectedAvatarPreview });
    },
    reset: () => {
        set({
            formData: { ...initialFormData },
            validationErrors: {},
            processing: false,
            showAvatarModal: false,
            selectedAvatarFile: null,
            selectedAvatarPreview: null,
        });
    },
}));

export default function CreateUser() {
    const formData = useCreateUserPageStore((state) => state.formData);
    const validationErrors = useCreateUserPageStore(
        (state) => state.validationErrors,
    );
    const processing = useCreateUserPageStore((state) => state.processing);
    const showAvatarModal = useCreateUserPageStore(
        (state) => state.showAvatarModal,
    );
    const selectedAvatarFile = useCreateUserPageStore(
        (state) => state.selectedAvatarFile,
    );
    const selectedAvatarPreview = useCreateUserPageStore(
        (state) => state.selectedAvatarPreview,
    );
    const setFormData = useCreateUserPageStore((state) => state.setFormData);
    const setValidationErrors = useCreateUserPageStore(
        (state) => state.setValidationErrors,
    );
    const setProcessing = useCreateUserPageStore(
        (state) => state.setProcessing,
    );
    const setShowAvatarModal = useCreateUserPageStore(
        (state) => state.setShowAvatarModal,
    );
    const setSelectedAvatarFile = useCreateUserPageStore(
        (state) => state.setSelectedAvatarFile,
    );
    const setSelectedAvatarPreview = useCreateUserPageStore(
        (state) => state.setSelectedAvatarPreview,
    );
    const resetStore = useCreateUserPageStore((state) => state.reset);

    const getInitials = useInitials();

    useEffect(() => {
        resetStore();
    }, [resetStore]);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (selectedAvatarPreview) {
                URL.revokeObjectURL(selectedAvatarPreview);
            }
        };
    }, [selectedAvatarPreview]);

    const handleAvatarChange = (file: File) => {
        // Revoke old URL if exists
        if (selectedAvatarPreview) {
            URL.revokeObjectURL(selectedAvatarPreview);
        }

        // Create preview URL and store file
        const previewUrl = URL.createObjectURL(file);
        setSelectedAvatarFile(file);
        setSelectedAvatarPreview(previewUrl);
        setShowAvatarModal(false);
        toast.success('Avatar selected. Click "Create User" to complete.');
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Clear previous errors
        setValidationErrors({});

        // Simple client-side validation
        const errors: Record<string, string> = {};

        // Name validation
        if (!formData.name || formData.name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password || formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        if (
            formData.password &&
            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
        ) {
            errors.password =
                'Password must contain uppercase, lowercase, and number';
        }
        if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Passwords must match';
        }

        // If there are errors, show them
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix the validation errors');
            setProcessing(false);

            return;
        }

        const id = toast.loading('Creating user...');

        // Use FormData to support file upload
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name.trim());
        formDataObj.append('email', formData.email.trim());
        formDataObj.append('password', formData.password);
        formDataObj.append(
            'password_confirmation',
            formData.password_confirmation,
        );
        formDataObj.append('role', formData.role || 'user');
        formDataObj.append('status', formData.status || 'enable');

        // Append avatar if selected
        if (selectedAvatarFile) {
            formDataObj.append('avatar', selectedAvatarFile);
        }

        router.post(users.store.url(), formDataObj, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User created successfully', { id });
                setFormData({ ...initialFormData });
                setValidationErrors({});
                setSelectedAvatarFile(null);
                if (selectedAvatarPreview) {
                    URL.revokeObjectURL(selectedAvatarPreview);
                }
                setSelectedAvatarPreview(null);
            },
            onError: (errors) => {
                setValidationErrors(errors);
                toast.error('Failed to create user', { id });
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleCancel = () => {
        window.history.back();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />

            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancel}
                            className="size-10"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Create User
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Add a new user to the system
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <UserPlus className="size-5 text-muted-foreground" />
                            <CardTitle>User Information</CardTitle>
                        </div>
                        <CardDescription>
                            Fill in the details below to create a new user
                            account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="size-24 overflow-hidden rounded-full">
                                    <AvatarImage
                                        src={selectedAvatarPreview || undefined}
                                        alt={formData.name || 'New User'}
                                    />
                                    <AvatarFallback className="rounded-lg bg-neutral-200 text-3xl text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(
                                            formData.name || 'New User',
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {formData.name || 'New User'}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowAvatarModal(true);
                                        }}
                                    >
                                        <CameraIcon className="mr-2 size-4" />
                                        {selectedAvatarFile
                                            ? 'Change Picture'
                                            : 'Upload Picture'}
                                    </Button>
                                    {selectedAvatarFile && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {selectedAvatarFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Name */}
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

                                {/* Email */}
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

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
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
                                        placeholder="••••••••"
                                    />
                                    <InputError
                                        message={validationErrors.password}
                                    />
                                    {!validationErrors.password && (
                                        <p className="text-xs text-muted-foreground">
                                            Must be at least 8 characters with
                                            uppercase, lowercase, and number
                                        </p>
                                    )}
                                </div>

                                {/* Password Confirmation */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                password_confirmation:
                                                    e.target.value,
                                            });
                                        }}
                                        placeholder="••••••••"
                                    />
                                    <InputError
                                        message={
                                            validationErrors.password_confirmation
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Role */}
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
                                                <ChessKingIcon className="size-4" />
                                                User
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                <UserIcon className="size-4" />
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={validationErrors.role}
                                    />
                                </div>

                                {/* Status */}
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
                                                <CheckIcon className="size-4" />
                                                Enabled
                                            </SelectItem>
                                            <SelectItem value="disable">
                                                <XIcon className="size-4" />
                                                Disabled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={validationErrors.status}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 border-t pt-6">
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <LoaderCircleIcon className="size-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 size-4" />
                                            Create User
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <AvatarUploader
                open={showAvatarModal}
                onOpenChange={setShowAvatarModal}
                userName={formData.name || 'New User'}
                currentAvatar={selectedAvatarPreview}
                onAvatarChange={handleAvatarChange}
                canDelete={false}
            />
        </AppLayout>
    );
}
