import { useCallback, useEffect, useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import {
    AVATAR_ALLOWED_TYPES,
    AVATAR_MAX_SIZE,
    AVATAR_MIN_DIMENSION,
    validateAvatarDimensions,
    validateAvatarFile,
} from '@/schemas/avatar';
import type { AvatarValidationError } from '@/schemas/avatar';
import { useAvatarUploadStore } from '@/stores/avatar-upload';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface PhotoUploadProps {
    currentAvatar?: string | null;
    userName: string;
    onUpload: (file: File) => void;
    onDelete?: () => void;
    canDelete?: boolean;
    isDeleting?: boolean;
}

export function PhotoUpload({
    currentAvatar,
    userName,
    onUpload,
    onDelete,
    canDelete = false,
    isDeleting = false,
}: PhotoUploadProps) {
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        isOpen,
        previewImage,
        selectedFile,
        validationErrors,
        isDragOver,
        isProcessing,
        open,
        close,
        setPreviewImage,
        setSelectedFile,
        setValidationErrors,
        clearValidationErrors,
        setIsDragOver,
        reset,
    } = useAvatarUploadStore();

    useEffect(() => {
        if (!isOpen) {
            const timeout = setTimeout(reset, 300);
            return () => {
                clearTimeout(timeout);
            };
        }
        return undefined;
    }, [isOpen, reset]);

    const handleFileSelect = useCallback(
        (file: File) => {
            clearValidationErrors();

            const errors = validateAvatarFile(file);
            if (errors.length > 0) {
                setValidationErrors(errors);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const dimensionErrors = validateAvatarDimensions(
                        img.width,
                        img.height,
                    );
                    if (dimensionErrors.length > 0) {
                        setValidationErrors(dimensionErrors);
                        return;
                    }

                    setPreviewImage(e.target?.result as string);
                    setSelectedFile(file);
                };
                img.onerror = () => {
                    setValidationErrors([
                        {
                            field: 'general',
                            message:
                                'Failed to load image. File may be corrupted.',
                        },
                    ]);
                };
                img.src = e.target?.result as string;
            };
            reader.onerror = () => {
                setValidationErrors([
                    {
                        field: 'general',
                        message: 'Failed to read file. Please try again.',
                    },
                ]);
            };
            reader.readAsDataURL(file);
        },
        [
            clearValidationErrors,
            setPreviewImage,
            setSelectedFile,
            setValidationErrors,
        ],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect],
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(true);
        },
        [setIsDragOver],
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(false);
        },
        [setIsDragOver],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(false);

            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
                handleFileSelect(file);
            } else {
                setValidationErrors([
                    { field: 'fileType', message: 'Please drop an image file' },
                ]);
            }
        },
        [handleFileSelect, setIsDragOver, setValidationErrors],
    );

    const handleConfirm = useCallback(() => {
        if (selectedFile) {
            onUpload(selectedFile);
        }
    }, [selectedFile, onUpload]);

    const handleClose = useCallback(() => {
        close();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [close]);

    const handleRemove = useCallback(() => {
        if (onDelete) {
            onDelete();
        }
    }, [onDelete]);

    const getErrorForField = (field: AvatarValidationError['field']) =>
        validationErrors.find((e) => e.field === field)?.message;

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-start gap-6">
                    <div className="group relative">
                        <Avatar className="h-24 w-24 overflow-hidden rounded-full border-2 border-muted transition-colors group-hover:border-primary">
                            <AvatarImage
                                src={currentAvatar ?? undefined}
                                alt={`${userName}'s profile picture`}
                            />
                            <AvatarFallback className="text-2xl font-semibold">
                                {getInitials(userName)}
                            </AvatarFallback>
                        </Avatar>

                        <button
                            type="button"
                            onClick={open}
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            aria-label="Change profile picture"
                        >
                            <Upload className="h-6 w-6 text-white" />
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col justify-center gap-2">
                        <div>
                            <h3 className="font-medium">{userName}</h3>
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
                                onClick={open}
                            >
                                <Upload className="mr-2 size-4" />
                                {currentAvatar
                                    ? 'Change Picture'
                                    : 'Upload Picture'}
                            </Button>

                            {currentAvatar && canDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemove}
                                    disabled={isDeleting}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    {isDeleting ? 'Removing...' : 'Remove'}
                                </Button>
                            )}

                            {currentAvatar && !canDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const link =
                                            document.createElement('a');
                                        link.href = currentAvatar;
                                        link.download = 'profile-picture';
                                        link.click();
                                    }}
                                >
                                    Download
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {getErrorForField('general') && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle className="size-4 flex-shrink-0" />
                        <span>{getErrorForField('general')}</span>
                    </div>
                )}
            </div>

            <Dialog
                open={isOpen}
                onOpenChange={(open) => !open && handleClose()}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>
                            Choose a profile picture. JPEG, PNG, GIF, or WebP.
                            Max {AVATAR_MAX_SIZE / 1024 / 1024}MB.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-6 py-4">
                        <div className="relative">
                            <Avatar className="h-32 w-32 overflow-hidden rounded-full border-4 border-muted">
                                <AvatarImage
                                    src={
                                        previewImage ||
                                        currentAvatar ||
                                        undefined
                                    }
                                    alt={`${userName}'s profile picture preview`}
                                />
                                <AvatarFallback className="text-4xl">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                                aria-label="Upload new avatar"
                            >
                                <Upload className="h-10 w-10 text-white" />
                            </button>
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors duration-200 ${
                                isDragOver
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
                            } `}
                        >
                            <label
                                htmlFor="avatar-file-input"
                                className="flex cursor-pointer flex-col items-center gap-3"
                            >
                                <div className="flex items-center justify-center rounded-full bg-muted p-3">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        JPEG, PNG, GIF, or WebP (max{' '}
                                        {AVATAR_MAX_SIZE / 1024 / 1024}MB)
                                    </p>
                                </div>
                            </label>
                        </div>

                        {validationErrors.length > 0 && (
                            <div className="w-full space-y-2">
                                {(getErrorForField('fileSize') ||
                                    getErrorForField('fileType') ||
                                    getErrorForField('dimensions')) && (
                                    <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="mt-0.5 size-4 flex-shrink-0" />
                                        <div className="space-y-1">
                                            {getErrorForField('fileSize') && (
                                                <p>
                                                    {getErrorForField(
                                                        'fileSize',
                                                    )}
                                                </p>
                                            )}
                                            {getErrorForField('fileType') && (
                                                <p>
                                                    {getErrorForField(
                                                        'fileType',
                                                    )}
                                                </p>
                                            )}
                                            {getErrorForField('dimensions') && (
                                                <p>
                                                    {getErrorForField(
                                                        'dimensions',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <Input
                            id="avatar-file-input"
                            ref={fileInputRef}
                            type="file"
                            accept={AVATAR_ALLOWED_TYPES.join(',')}
                            onChange={handleInputChange}
                            className="hidden"
                        />

                        <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                            <CheckCircle className="mt-0.5 size-4 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="font-medium">
                                    Tips for best results:
                                </p>
                                <ul className="list-inside list-disc space-y-0.5 text-xs">
                                    <li>Use a square image for best results</li>
                                    <li>
                                        Minimum size: {AVATAR_MIN_DIMENSION}x
                                        {AVATAR_MIN_DIMENSION}px
                                    </li>
                                    <li>Clear, well-lit photos work best</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!selectedFile || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
