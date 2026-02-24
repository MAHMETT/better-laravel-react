import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Camera, Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAvatar = (file: File): string | null => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 2MB';
        }

        // Check file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return 'File type must be JPEG, PNG, GIF, WebP, or SVG';
        }

        return null;
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setAvatarError(null);

        if (file) {
            // Validate file
            const error = validateAvatar(file);
            if (error) {
                setAvatarError(error);
                e.target.value = '';
                setAvatarPreview(null);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(null);
        }
    };

    const currentAvatar = avatarPreview || auth.user.avatar;

    const [open, setOpen] = useState(false);

    console.log(auth.user);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
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
                                    <div className="grid gap-2">
                                        <Label>Avatar</Label>
                                        <p className="text-xs text-muted-foreground">
                                            JPEG, PNG, GIF, WebP, or SVG. Max
                                            size: 2MB
                                        </p>

                                        <div className="flex items-center gap-4">
                                            <Dialog
                                                open={open}
                                                onOpenChange={setOpen}
                                            >
                                                <DialogTrigger asChild>
                                                    <div className="group relative cursor-pointer">
                                                        <Avatar className="size-24 transition-all duration-200 group-hover:scale-105">
                                                            <AvatarImage
                                                                src={
                                                                    currentAvatar
                                                                }
                                                                alt={
                                                                    auth.user
                                                                        .name
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {auth.user.name
                                                                    ?.charAt(0)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        {/* Hover camera icon */}
                                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                            <Camera className="size-6 text-white" />
                                                        </div>
                                                    </div>
                                                </DialogTrigger>

                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Profile Picture
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    <div className="flex flex-col items-center gap-6">
                                                        {currentAvatar ? (
                                                            <>
                                                                {/* Preview large */}
                                                                <img
                                                                    src={
                                                                        currentAvatar
                                                                    }
                                                                    alt="Profile"
                                                                    className="h-64 w-64 rounded-full border object-cover"
                                                                />

                                                                <div className="flex gap-3">
                                                                    {/* Download */}
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            const link =
                                                                                document.createElement(
                                                                                    'a',
                                                                                );
                                                                            link.href =
                                                                                currentAvatar;
                                                                            link.download =
                                                                                'profile-picture';
                                                                            link.click();
                                                                        }}
                                                                    >
                                                                        <Download className="mr-2 size-4" />
                                                                        Download
                                                                    </Button>

                                                                    {/* Upload */}
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            fileInputRef.current?.click()
                                                                        }
                                                                    >
                                                                        <Upload className="mr-2 size-4" />
                                                                        Upload
                                                                        New
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* Empty State */}
                                                                <div className="flex h-64 w-64 items-center justify-center rounded-full border border-dashed text-muted-foreground">
                                                                    No profile
                                                                    picture
                                                                </div>

                                                                <Button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        fileInputRef.current?.click()
                                                                    }
                                                                >
                                                                    <Upload className="mr-2 size-4" />
                                                                    Upload
                                                                    Picture
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        {/* Hidden input */}
                                        <Input
                                            ref={fileInputRef}
                                            id="avatar"
                                            name="avatar"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                        {/* Frontend validation error */}
                                        {avatarError && (
                                            <InputError
                                                className="mt-2"
                                                message={avatarError}
                                            />
                                        )}
                                        {/* Backend validation error */}
                                        <InputError
                                            className="mt-2"
                                            message={errors.avatar}
                                        />
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
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link
                                                        has been sent to your
                                                        email address.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex items-center gap-4">
                                        <Button
                                            disabled={processing}
                                            data-test="update-profile-button"
                                        >
                                            Save
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">
                                                Saved
                                            </p>
                                        </Transition>
                                    </div>
                                </>
                            );
                        }}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
