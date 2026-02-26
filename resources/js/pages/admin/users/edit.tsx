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
import type { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    status: 'enable' | 'disable';
}

interface Props {
    user: User;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'user';
    status: 'enable' | 'disable';
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index.url(),
    },
    {
        title: 'Edit',
        href: users.edit.url({ user: { id: 0 } }),
    },
];

export default function EditUser({ user }: Props) {
    const page = usePage();
    const flash = page.props.flash as
        | { success?: string; error?: string }
        | undefined;
    const [formData, setFormData] = useState<FormData>({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
        status: user.status,
    });
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const [processing, setProcessing] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    // Show success messages from flash
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    // Track if form has changes
    const hasChanges =
        formData.name !== user.name ||
        formData.email !== user.email ||
        formData.role !== user.role ||
        formData.status !== user.status ||
        formData.password !== '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setValidationErrors({});

        // Prepare data for submission - only send changed fields
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

        // Only include password if changed
        if (formData.password && formData.password.length > 0) {
            dataToSubmit.password = formData.password;
            dataToSubmit.password_confirmation = formData.password_confirmation;
        }

        // Validate only sent fields
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

        // If no changes, don't submit
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

    const handleCancel = () =>
        window.history.back() ?? router.visit(users.index.url());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
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

                {/* Form */}
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
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
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
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="john@example.com"
                                    />
                                    <InputError
                                        message={validationErrors.email}
                                    />
                                </div>
                            </div>

                            {/* Password Section */}
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
                                            onClick={() =>
                                                setShowPasswordFields(true)
                                            }
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            New Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
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

                                    {/* Password Confirmation */}
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
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password_confirmation:
                                                        e.target.value,
                                                })
                                            }
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
                                {/* Role */}
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(v: 'admin' | 'user') =>
                                            setFormData({
                                                ...formData,
                                                role: v,
                                            })
                                        }
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

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(
                                            v: 'enable' | 'disable',
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                status: v,
                                            })
                                        }
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

                            {/* Actions */}
                            <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center">
                                <Button
                                    type="submit"
                                    disabled={processing || !hasChanges}
                                    className="w-full sm:w-auto"
                                >
                                    {processing ? (
                                        <>
                                            <svg
                                                className="mr-2 h-4 w-4 animate-spin"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <UserCog className="mr-2 h-4 w-4" />
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
            </div>
        </AppLayout>
    );
}
