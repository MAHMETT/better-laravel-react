import { Transition } from '@headlessui/react';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Camera, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { AvatarUploadModal } from '@/components/avatar/avatar-upload-modal';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit, update } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const [avatarUploadOpen, setAvatarUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarSelect = (file: File) => {
        // Create form data and submit
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('name', auth.user.name);
        formData.append('email', auth.user.email);

        setIsUploading(true);

        router.patch(update().url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile picture updated successfully');
                setAvatarUploadOpen(false);
            },
            onError: (errors: Record<string, string>) => {
                toast.error(errors.avatar || 'Failed to update profile picture');
            },
            onFinish: () => {
                setIsUploading(false);
            },
        });
    };

    const currentAvatar = auth.user.avatar;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name, email address, and profile picture"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                        encType="multipart/form-data"
                    >
                        {({ processing, recentlySuccessful, errors }) => {
                            return (
                                <>
                                    {/* Avatar Section */}
                                    <div className="grid gap-4">
                                        <Label>Profile Picture</Label>

                                        <div className="flex items-start gap-6">
                                            {/* Avatar Display */}
                                            <div className="group relative">
                                                <Avatar className="h-24 w-24 overflow-hidden rounded-full border-2 border-muted transition-colors group-hover:border-primary">
                                                    <AvatarImage
                                                        src={currentAvatar ?? undefined}
                                                        alt={auth.user.name}
                                                    />
                                                    <AvatarFallback className="text-2xl font-semibold">
                                                        {auth.user.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Change button overlay */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setAvatarUploadOpen(true)
                                                    }
                                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                                    aria-label="Change profile picture"
                                                >
                                                    <Camera className="h-6 w-6 text-white" />
                                                </button>
                                            </div>

                                            {/* Avatar Info & Actions */}
                                            <div className="flex flex-1 flex-col justify-center gap-2">
                                                <div>
                                                    <h3 className="font-medium">
                                                        {auth.user.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {currentAvatar
                                                            ? 'Click the image or button to change your profile picture'
                                                            : 'Add a profile picture to personalize your account'}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setAvatarUploadOpen(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <Camera className="mr-2 h-4 w-4" />
                                                        {currentAvatar
                                                            ? 'Change Picture'
                                                            : 'Upload Picture'}
                                                    </Button>

                                                    {currentAvatar && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const link =
                                                                    document.createElement(
                                                                        'a'
                                                                    );
                                                                link.href =
                                                                    currentAvatar;
                                                                link.download =
                                                                    'profile-picture';
                                                                link.click();
                                                            }}
                                                        >
                                                            Download
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* Upload status */}
                                                {isUploading && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <svg
                                                            className="h-4 w-4 animate-spin"
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
                                                        Uploading...
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Backend validation errors */}
                                        {errors.avatar && (
                                            <InputError message={errors.avatar} />
                                        )}
                                    </div>

                                    {/* Name Section */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>

                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.name}
                                        />
                                    </div>

                                    {/* Email Section */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.email}
                                        />
                                    </div>

                                    {/* Email Verification Notice */}
                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at ===
                                            null && (
                                            <div>
                                                <p className="-mt-4 text-sm text-muted-foreground">
                                                    Your email address is
                                                    unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                        <Check className="h-4 w-4" />
                                                        A new verification link
                                                        has been sent to your
                                                        email address.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    {/* Save Button */}
                                    <div className="flex items-center gap-4 border-t pt-6">
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing || isUploading
                                            }
                                            data-test="update-profile-button"
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
                                                'Save Changes'
                                            )}
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-muted-foreground">
                                                Saved successfully
                                            </p>
                                        </Transition>
                                    </div>
                                </>
                            );
                        }}
                    </Form>
                </div>

                <DeleteUser />

                {/* Avatar Upload Modal */}
                <AvatarUploadModal
                    open={avatarUploadOpen}
                    onOpenChange={setAvatarUploadOpen}
                    currentAvatar={currentAvatar}
                    userName={auth.user.name}
                    onAvatarSelect={handleAvatarSelect}
                />
            </SettingsLayout>
        </AppLayout>
    );
}
