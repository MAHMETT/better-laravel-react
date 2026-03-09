import { AvatarUploader } from '@/components/avatar';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit, update } from '@/routes/profile';
import { send } from '@/routes/verification';
import { useProfileSettingsStore } from '@/stores/profile-settings';
import type { BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Camera, Check } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit(),
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
    const showAvatarModal = useProfileSettingsStore.use.showAvatarModal();
    const isUploading = useProfileSettingsStore.use.isUploading();
    const setShowAvatarModal =
        useProfileSettingsStore.getState().setShowAvatarModal;
    const setIsUploading = useProfileSettingsStore.getState().setIsUploading;

    useEffect(() => {
        useProfileSettingsStore.getState().reset();
    }, []);

    const handleAvatarUpload = (file: File) => {
        setIsUploading(true);
        const toastId = toast.loading('Updating profile picture...');

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('name', auth.user.name);
        formData.append('email', auth.user.email);

        router.patch(update().url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile picture updated successfully', {
                    id: toastId,
                });
                setShowAvatarModal(false);
            },
            onError: (errors: Record<string, string>) => {
                toast.error(
                    errors.avatar || 'Failed to update profile picture',
                    { id: toastId },
                );
            },
            onFinish: () => {
                setIsUploading(false);
            },
        });
    };

    const currentAvatar =
        auth.user.avatar ?? auth.user.avatar_thumbnail_url ?? undefined;
    const currentAvatarOriginal =
        auth.user.avatar_original ??
        auth.user.avatar_original_url ??
        currentAvatar ??
        undefined;

    const getInitials = useInitials();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name, email address, and profile picture"
                    />

                    <Form
                        method="patch"
                        action={update().url}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                        encType="multipart/form-data"
                    >
                        {({ processing, recentlySuccessful, errors }) => {
                            return (
                                <>
                                    <div className="grid gap-4">
                                        <Label>Profile Picture</Label>

                                        <div className="flex items-start gap-6">
                                            <Avatar className="size-24 overflow-hidden rounded-full">
                                                <AvatarImage
                                                    src={currentAvatar}
                                                    alt={auth.user.name}
                                                />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-3xl text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(
                                                        auth.user.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>

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
                                                        onClick={() => {
                                                            setShowAvatarModal(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <Camera className="mr-2 size-4" />
                                                        {currentAvatar
                                                            ? 'Edit Picture'
                                                            : 'Upload Picture'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {errors.avatar && (
                                            <InputError
                                                message={errors.avatar}
                                            />
                                        )}
                                    </div>

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
                                                        <Check className="size-4" />
                                                        A new verification link
                                                        has been sent to your
                                                        email address.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex items-center gap-4 border-t pt-6">
                                        <Button
                                            type="submit"
                                            disabled={processing || isUploading}
                                            data-test="update-profile-button"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
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

                <AvatarUploader
                    open={showAvatarModal}
                    onOpenChange={setShowAvatarModal}
                    currentAvatar={currentAvatarOriginal}
                    userName={auth.user.name}
                    onAvatarChange={handleAvatarUpload}
                    isUploading={isUploading}
                    canDownload={true}
                    canDelete={false}
                />
            </SettingsLayout>
        </AppLayout>
    );
}
