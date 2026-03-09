import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import { formatBytes } from '@/lib/image-converter';
import type { AvatarValidationError } from '@/schemas/avatar';
import {
    AVATAR_ALLOWED_TYPES,
    AVATAR_MAX_SIZE,
    validateAvatarImageSource,
} from '@/schemas/avatar';
import { useAvatarUploaderStore } from '@/stores/avatar-uploader';
import { saveAs } from 'file-saver';
import {
    AlertCircle,
    Camera,
    CheckCircle,
    Download,
    Upload,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { toast } from 'sonner';
import { DeleteAvatarDialog } from './delete-avatar-dialog';
export interface AvatarUploaderProps {
    /** Current avatar URL */
    currentAvatar?: string | null;
    /** User's full name */
    userName: string;
    /** Callback when avatar is uploaded/selected */
    onAvatarChange: (file: File) => void | Promise<void>;
    /** Callback when avatar is deleted (optional) */
    onAvatarDelete?: () => void | Promise<void>;
    /** Whether upload is in progress */
    isUploading?: boolean;
    /** Whether deletion is in progress */
    isDeleting?: boolean;
    /** Show delete button */
    canDelete?: boolean;
    /** Modal open state */
    open: boolean;
    /** Modal open change handler */
    onOpenChange: (open: boolean) => void;
    /** Show download button (default: true) */
    canDownload?: boolean;
}

const MIN_DIMENSION = 100;
const MAX_DIMENSION = 4096;

export function AvatarUploader({
    currentAvatar,
    userName,
    onAvatarChange,
    onAvatarDelete,
    isUploading = false,
    isDeleting = false,
    canDelete = false,
    open,
    onOpenChange,
    canDownload = true,
}: AvatarUploaderProps) {
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use Zustand store
    const step = useAvatarUploaderStore.use.step();
    const selectedFile = useAvatarUploaderStore.use.selectedFile();
    const sourceImageUrl = useAvatarUploaderStore.use.sourceImageUrl();
    const croppedPreviewUrl = useAvatarUploaderStore.use.croppedPreviewUrl();
    const crop = useAvatarUploaderStore.use.crop();
    const zoom = useAvatarUploaderStore.use.zoom();
    const croppedAreaPixels = useAvatarUploaderStore.use.croppedAreaPixels();
    const validationErrors = useAvatarUploaderStore.use.validationErrors();
    const isDragOver = useAvatarUploaderStore.use.isDragOver();
    const isProcessing = useAvatarUploaderStore.use.isProcessing();

    const setOpen = useAvatarUploaderStore.use.setOpen();
    const setSelectedFile = useAvatarUploaderStore.use.setSelectedFile();
    const setSourceImageUrl = useAvatarUploaderStore.use.setSourceImageUrl();
    const setCroppedPreviewUrl =
        useAvatarUploaderStore.use.setCroppedPreviewUrl();
    const setStep = useAvatarUploaderStore.use.setStep();
    const setCrop = useAvatarUploaderStore.use.setCrop();
    const setZoom = useAvatarUploaderStore.use.setZoom();
    const setCroppedAreaPixels =
        useAvatarUploaderStore.use.setCroppedAreaPixels();
    const setValidationErrors =
        useAvatarUploaderStore.use.setValidationErrors();
    const setIsDragOver = useAvatarUploaderStore.use.setIsDragOver();
    const setIsProcessing = useAvatarUploaderStore.use.setIsProcessing();
    const reset = useAvatarUploaderStore.use.reset();

    const resetState = useCallback(() => {
        reset();
    }, [reset]);

    // Sync open state with store
    useEffect(() => {
        setOpen(open);
        return () => {
            // Cleanup on unmount
        };
    }, [open, setOpen]);

    // Reset when modal closes
    useEffect(() => {
        if (!open) {
            const timer = setTimeout(() => {
                resetState();
            }, 300);
            return () => clearTimeout(timer);
        }
        return () => {
            // Cleanup on unmount
        };
    }, [open, resetState]);

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
            if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
        };
    }, [sourceImageUrl, croppedPreviewUrl]);

    const validateFile = useCallback((file: File): AvatarValidationError[] => {
        const errors: AvatarValidationError[] = [];

        if (file.size > AVATAR_MAX_SIZE) {
            errors.push({
                field: 'fileSize',
                message: `File size must be less than ${AVATAR_MAX_SIZE / 1024 / 1024}MB`,
            });
        }

        if (
            !AVATAR_ALLOWED_TYPES.includes(
                file.type as (typeof AVATAR_ALLOWED_TYPES)[number],
            )
        ) {
            errors.push({
                field: 'fileType',
                message: `File type must be ${AVATAR_ALLOWED_TYPES.map((t) => t.split('/')[1].toUpperCase()).join(', ')}`,
            });
        }

        return errors;
    }, []);

    const validateImageDimensions = useCallback(
        (image: HTMLImageElement): AvatarValidationError | null => {
            if (image.width < MIN_DIMENSION || image.height < MIN_DIMENSION) {
                return {
                    field: 'dimensions',
                    message: `Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels`,
                };
            }

            if (image.width > MAX_DIMENSION || image.height > MAX_DIMENSION) {
                return {
                    field: 'dimensions',
                    message: `Image must be at most ${MAX_DIMENSION}x${MAX_DIMENSION} pixels`,
                };
            }

            return null;
        },
        [],
    );

    const handleFileSelect = useCallback(
        async (file: File) => {
            setValidationErrors([]);

            // Validate file
            const fileErrors = validateFile(file);
            if (fileErrors.length > 0) {
                setValidationErrors(fileErrors);
                toast.error(fileErrors[0].message);
                return;
            }

            // Validate image
            const imageErrors = await validateAvatarImageSource(file);
            if (imageErrors.length > 0) {
                setValidationErrors(imageErrors);
                toast.error(imageErrors[0].message);
                return;
            }

            // Create preview
            const objectUrl = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const dimensionError = validateImageDimensions(img);
                if (dimensionError) {
                    URL.revokeObjectURL(objectUrl);
                    setValidationErrors([dimensionError]);
                    toast.error(dimensionError.message);
                    return;
                }

                setSelectedFile(file);
                setSourceImageUrl(objectUrl);
                setStep('crop');
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                setValidationErrors([
                    {
                        field: 'general',
                        message: 'Failed to load image. File may be corrupted.',
                    },
                ]);
                toast.error('Failed to load image');
            };
            img.src = objectUrl;
        },
        [
            validateFile,
            validateImageDimensions,
            setSelectedFile,
            setSourceImageUrl,
            setStep,
            setValidationErrors,
        ],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [handleFileSelect],
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(true);
        },
        [setIsDragOver],
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
        },
        [setIsDragOver],
    );

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
                await handleFileSelect(file);
            } else {
                toast.error('Please drop an image file');
            }
        },
        [handleFileSelect, setIsDragOver],
    );

    const handleCropComplete = useCallback(
        (_area: Area, areaPixels: Area) => {
            setCroppedAreaPixels(areaPixels);
        },
        [setCroppedAreaPixels],
    );

    const handleGeneratePreview = useCallback(async () => {
        if (!sourceImageUrl || !croppedAreaPixels) {
            toast.error('Please adjust the crop first');
            return;
        }

        setIsProcessing(true);

        try {
            const image = new Image();
            image.src = sourceImageUrl;
            await new Promise((resolve) => {
                image.onload = resolve;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
            );

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => {
                        if (!b) reject(new Error('Canvas to Blob failed'));
                        else resolve(b);
                    },
                    'image/webp',
                    0.9,
                );
            });

            const previewUrl = URL.createObjectURL(blob);
            setCroppedPreviewUrl(previewUrl);
            setStep('preview');
        } catch {
            toast.error('Failed to generate preview');
        } finally {
            setIsProcessing(false);
        }
    }, [
        sourceImageUrl,
        croppedAreaPixels,
        setIsProcessing,
        setStep,
        setCroppedPreviewUrl,
    ]);

    const handleSave = useCallback(async () => {
        if (!croppedPreviewUrl) {
            toast.error('No image to save');
            return;
        }

        setIsProcessing(true);

        try {
            // Fetch the cropped preview and convert to File
            const response = await fetch(croppedPreviewUrl);
            const blob = await response.blob();
            const file = new File([blob], 'avatar.webp', {
                type: 'image/webp',
            });

            await onAvatarChange(file);
            onOpenChange(false);
            toast.success('Avatar updated successfully');
        } catch {
            toast.error('Failed to save avatar');
        } finally {
            setIsProcessing(false);
        }
    }, [croppedPreviewUrl, onAvatarChange, onOpenChange, setIsProcessing]);

    const handleDownload = useCallback(async () => {
        const avatarUrl = currentAvatar;

        if (!avatarUrl) {
            toast.error('No avatar available to download');
            return;
        }

        const toastId = toast.loading('Preparing download...', {
            description: 'Fetching your profile picture',
        });

        try {
            /**
             * Fetch image
             */
            const response = await fetch(avatarUrl);

            if (!response.ok) {
                throw new Error(
                    `Download failed (${response.status} ${response.statusText})`,
                );
            }

            /**
             * Convert to blob
             */
            const blob = await response.blob();

            /**
             * Validate MIME type
             */
            if (!blob.type.startsWith('image/')) {
                throw new Error(`Invalid file type: ${blob.type || 'unknown'}`);
            }

            /**
             * Generate filename
             */
            const extension = blob.type.split('/')[1]?.toLowerCase() ?? 'jpg';

            const fileName = `profile-picture-${Date.now()}.${extension}`;

            /**
             * Trigger download
             */
            saveAs(blob, fileName);

            toast.success('Download complete', {
                id: toastId,
                duration: 3000,
                description: 'Check your downloads folder',
            });
        } catch (error) {
            console.error('Avatar download failed:', error);

            toast.error('Download failed', {
                id: toastId,
                duration: 5000,
                description:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                action: {
                    label: 'Retry',
                    onClick: () => handleDownload(),
                },
            });
        }
    }, [currentAvatar]);

    const showDeleteDialog = useAvatarUploaderStore.use.showDeleteDialog();
    const setShowDeleteDialog =
        useAvatarUploaderStore.use.setShowDeleteDialog();

    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, [setShowDeleteDialog]);

    const confirmDelete = useCallback(async () => {
        if (!onAvatarDelete) return;

        try {
            await onAvatarDelete();
            toast.success('Profile picture deleted successfully');
            setShowDeleteDialog(false);
            onOpenChange(false);
        } catch {
            toast.error('Failed to delete profile picture');
        }
    }, [onAvatarDelete, onOpenChange, setShowDeleteDialog]);

    const handleClose = useCallback(() => {
        if (step !== 'select') {
            const confirmed = window.confirm(
                'Discard changes? Your avatar will not be updated.',
            );
            if (!confirmed) return;
        }
        reset();
        onOpenChange(false);
    }, [step, reset, onOpenChange]);

    const displayImage =
        step === 'preview' && croppedPreviewUrl
            ? croppedPreviewUrl
            : step === 'crop' && sourceImageUrl
              ? sourceImageUrl
              : currentAvatar || undefined;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                        {step === 'select' &&
                            'Choose a profile picture. JPEG, PNG, GIF, or WebP. Max 5MB.'}
                        {step === 'crop' &&
                            'Adjust the crop and zoom to frame your image.'}
                        {step === 'preview' &&
                            'Review your cropped image before saving.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4 md:grid-cols-[200px_1fr]">
                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-40 w-40 overflow-hidden rounded-full border-4 border-muted">
                                <AvatarImage
                                    src={displayImage}
                                    alt={userName}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-4xl">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>

                            {step === 'select' && currentAvatar && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-200 hover:opacity-100"
                                    aria-label="Change profile picture"
                                >
                                    <Camera className="h-8 w-8 text-white" />
                                </button>
                            )}
                        </div>

                        {selectedFile && step !== 'preview' && (
                            <div className="w-full rounded-md bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                <p className="font-medium">
                                    {selectedFile.name}
                                </p>
                                <p>{formatBytes(selectedFile.size)}</p>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="space-y-4">
                        {step === 'select' && (
                            <>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                        isDragOver
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
                                    } cursor-pointer`}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' ||
                                            e.key === ' '
                                        ) {
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                >
                                    <div className="rounded-full bg-muted p-3">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            JPEG, PNG, GIF, or WebP (max 5MB)
                                        </p>
                                    </div>
                                </div>

                                {validationErrors.length > 0 && (
                                    <div className="space-y-2">
                                        {validationErrors.map((error, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                            >
                                                <AlertCircle className="size-4 flex-shrink-0" />
                                                <span>{error.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-start gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                    <CheckCircle className="mt-0.5 size-4 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            Tips for best results:
                                        </p>
                                        <ul className="list-inside list-disc space-y-0.5 text-xs">
                                            <li>
                                                Use a square image (at least{' '}
                                                {MIN_DIMENSION}x{MIN_DIMENSION}
                                                px)
                                            </li>
                                            <li>
                                                Clear, well-lit photos work best
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 'crop' && sourceImageUrl && (
                            <>
                                <div className="relative h-72 overflow-hidden rounded-lg border bg-muted/40">
                                    <Cropper
                                        image={sourceImageUrl}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        cropShape="round"
                                        showGrid={false}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={handleCropComplete}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Zoom</span>
                                        <span className="font-medium">
                                            {Math.round(zoom * 100)}%
                                        </span>
                                    </div>
                                    <Slider
                                        value={[zoom]}
                                        min={1}
                                        max={3}
                                        step={0.05}
                                        onValueChange={(value) => {
                                            setZoom(value[0]);
                                        }}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setStep('select')}
                                    >
                                        <X className="mr-2 size-4" />
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleGeneratePreview}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Spinner className="mr-2 size-4" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 size-4" />
                                                Generate Preview
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}

                        {step === 'preview' && (
                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                <CheckCircle className="size-16 text-green-600" />
                                <div className="text-center">
                                    <p className="text-lg font-medium">
                                        Preview Ready!
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Your avatar has been cropped and is
                                        ready to save.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setStep('crop')}
                                    >
                                        <Camera className="mr-2 size-4" />
                                        Recrop
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Input
                    ref={fileInputRef}
                    type="file"
                    accept={AVATAR_ALLOWED_TYPES.join(',')}
                    onChange={handleInputChange}
                    className="hidden"
                />

                <DialogFooter>
                    {step === 'select' && (
                        <div className="flex w-full items-center justify-between gap-2">
                            <div className="flex gap-2">
                                {canDownload && currentAvatar && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownload}
                                    >
                                        <Download className="mr-2 size-4" />
                                        Download
                                    </Button>
                                )}
                                {canDelete && onAvatarDelete && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <Spinner className="mr-2 size-4" />
                                        ) : null}
                                        Delete
                                    </Button>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep('crop')}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={isProcessing || isUploading}
                            >
                                {isProcessing || isUploading ? (
                                    <>
                                        <Spinner className="mr-2 size-4" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 size-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>

            {/* Delete Confirmation Dialog */}
            <DeleteAvatarDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                currentAvatar={currentAvatar}
                userName={userName}
                isDeleting={isDeleting}
                onConfirm={confirmDelete}
            />
        </Dialog>
    );
}
