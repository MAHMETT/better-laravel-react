import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useAvatarUploaderStore } from '@/stores/avatar-uploader';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DeleteAvatarDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAvatar?: string | null;
    userName: string;
    isDeleting?: boolean;
    onConfirm: () => void | Promise<void>;
}

export function DeleteAvatarDialog({
    open,
    onOpenChange,
    currentAvatar,
    userName,
    isDeleting = false,
    onConfirm,
}: DeleteAvatarDialogProps) {
    const getInitials = useInitials();
    const isConfirming = useAvatarUploaderStore.use.isConfirmingDelete();
    const setIsConfirming = useAvatarUploaderStore.use.setIsConfirmingDelete();

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader className="text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
                    </div>
                    <AlertDialogTitle className="text-lg font-semibold">
                        Delete Profile Picture?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="pt-2 text-sm text-muted-foreground">
                        This will remove your current profile picture. This
                        action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Current Avatar Preview */}
                {currentAvatar && (
                    <div className="flex items-center justify-center py-4">
                        <div className="relative">
                            <Avatar className="size-20 overflow-hidden rounded-full border-2 border-muted">
                                <AvatarImage
                                    src={currentAvatar}
                                    alt={userName}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-2xl">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200">
                                <Trash2 className="size-8 text-white" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Warning Message */}
                <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                    <p className="font-medium">Warning:</p>
                    <p className="mt-1 text-xs">
                        Your profile will display initials instead of a photo
                        until you upload a new image.
                    </p>
                </div>

                <AlertDialogFooter className="gap-2 sm:gap-0">
                    <AlertDialogCancel
                        disabled={isDeleting || isConfirming}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting || isConfirming}
                        className="flex-1 gap-2 sm:flex-none"
                    >
                        {isDeleting || isConfirming ? (
                            <>
                                <svg
                                    className="size-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="size-4" />
                                Delete
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
