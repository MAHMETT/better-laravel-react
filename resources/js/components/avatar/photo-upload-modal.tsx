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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import {
    createCroppedImageFile,
    revokeObjectUrl,
} from '@/lib/image-processing';
import type { AvatarValidationError } from '@/schemas/avatar';
import {
    AVATAR_ALLOWED_TYPES,
    AVATAR_MAX_SIZE,
    AVATAR_MIN_DIMENSION,
    getAvatarValidationErrorMessage,
    validateAvatarFile,
    validateAvatarImageSource,
} from '@/schemas/avatar';
import {
    selectPhotoUploadCrop,
    selectPhotoUploadCroppedAreaPixels,
    selectPhotoUploadCroppedImageFile,
    selectPhotoUploadCroppedPreviewUrl,
    selectPhotoUploadHasUnsavedChanges,
    selectPhotoUploadIsDragOver,
    selectPhotoUploadIsProcessing,
    selectPhotoUploadMode,
    selectPhotoUploadSelectedFile,
    selectPhotoUploadShowCancelConfirm,
    selectPhotoUploadShowDeleteConfirm,
    selectPhotoUploadSourceImageUrl,
    selectPhotoUploadValidationErrors,
    selectPhotoUploadZoom,
    usePhotoUploadModalStore,
} from '@/stores/photo-upload-modal';
import {
    AlertCircle,
    Camera,
    CheckCircle,
    Download,
    Trash2,
    Upload,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { toast } from 'sonner';

export interface PhotoUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAvatar?: string | null;
    userName: string;
    userId?: number;
    onUpload: (file: File) => void;
    onDelete?: () => void;
    isUploading?: boolean;
    isDeleting?: boolean;
    canDelete?: boolean;
}

export function PhotoUploadModal({
    open,
    onOpenChange,
    currentAvatar,
    userName,
    onUpload,
    onDelete,
    isUploading = false,
    isDeleting = false,
    canDelete = false,
}: PhotoUploadModalProps) {
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mode = usePhotoUploadModalStore(selectPhotoUploadMode);
    const selectedFile = usePhotoUploadModalStore(
        selectPhotoUploadSelectedFile,
    );
    const sourceImageUrl = usePhotoUploadModalStore(
        selectPhotoUploadSourceImageUrl,
    );
    const croppedPreviewUrl = usePhotoUploadModalStore(
        selectPhotoUploadCroppedPreviewUrl,
    );
    const croppedImageFile = usePhotoUploadModalStore(
        selectPhotoUploadCroppedImageFile,
    );
    const crop = usePhotoUploadModalStore(selectPhotoUploadCrop);
    const zoom = usePhotoUploadModalStore(selectPhotoUploadZoom);
    const croppedAreaPixels = usePhotoUploadModalStore(
        selectPhotoUploadCroppedAreaPixels,
    );
    const validationErrors = usePhotoUploadModalStore(
        selectPhotoUploadValidationErrors,
    );
    const isDragOver = usePhotoUploadModalStore(selectPhotoUploadIsDragOver);
    const isProcessing = usePhotoUploadModalStore(
        selectPhotoUploadIsProcessing,
    );
    const hasUnsavedChanges = usePhotoUploadModalStore(
        selectPhotoUploadHasUnsavedChanges,
    );
    const showDeleteConfirm = usePhotoUploadModalStore(
        selectPhotoUploadShowDeleteConfirm,
    );
    const showCancelConfirm = usePhotoUploadModalStore(
        selectPhotoUploadShowCancelConfirm,
    );

    const setMode = usePhotoUploadModalStore((state) => state.setMode);
    const setSelectedFile = usePhotoUploadModalStore(
        (state) => state.setSelectedFile,
    );
    const setSourceImageUrl = usePhotoUploadModalStore(
        (state) => state.setSourceImageUrl,
    );
    const setCroppedPreviewUrl = usePhotoUploadModalStore(
        (state) => state.setCroppedPreviewUrl,
    );
    const setCroppedImageFile = usePhotoUploadModalStore(
        (state) => state.setCroppedImageFile,
    );
    const setCroppedAreaPixels = usePhotoUploadModalStore(
        (state) => state.setCroppedAreaPixels,
    );
    const setCrop = usePhotoUploadModalStore((state) => state.setCrop);
    const setZoom = usePhotoUploadModalStore((state) => state.setZoom);
    const setValidationErrors = usePhotoUploadModalStore(
        (state) => state.setValidationErrors,
    );
    const clearValidationErrors = usePhotoUploadModalStore(
        (state) => state.clearValidationErrors,
    );
    const setIsDragOver = usePhotoUploadModalStore(
        (state) => state.setIsDragOver,
    );
    const setIsProcessing = usePhotoUploadModalStore(
        (state) => state.setIsProcessing,
    );
    const setHasUnsavedChanges = usePhotoUploadModalStore(
        (state) => state.setHasUnsavedChanges,
    );
    const setShowDeleteConfirm = usePhotoUploadModalStore(
        (state) => state.setShowDeleteConfirm,
    );
    const setShowCancelConfirm = usePhotoUploadModalStore(
        (state) => state.setShowCancelConfirm,
    );
    const resetStore = usePhotoUploadModalStore((state) => state.reset);

    const clearTransientImageState = useCallback(() => {
        revokeObjectUrl(usePhotoUploadModalStore.getState().sourceImageUrl);
        revokeObjectUrl(usePhotoUploadModalStore.getState().croppedPreviewUrl);

        setSourceImageUrl(null);
        setCroppedPreviewUrl(null);
        setSelectedFile(null);
        setCroppedImageFile(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    }, [
        setCroppedAreaPixels,
        setCroppedImageFile,
        setCroppedPreviewUrl,
        setCrop,
        setSelectedFile,
        setSourceImageUrl,
        setZoom,
    ]);

    const applyValidationErrors = useCallback(
        (errors: AvatarValidationError[]) => {
            setValidationErrors(errors);
            if (errors.length > 0) {
                toast.error(errors[0].message);
            }
        },
        [setValidationErrors],
    );

    const resetAndClose = useCallback(() => {
        clearTransientImageState();
        clearValidationErrors();
        setHasUnsavedChanges(false);
        setShowCancelConfirm(false);
        setShowDeleteConfirm(false);
        resetStore();
        onOpenChange(false);
    }, [
        clearTransientImageState,
        clearValidationErrors,
        onOpenChange,
        resetStore,
        setHasUnsavedChanges,
        setShowCancelConfirm,
        setShowDeleteConfirm,
    ]);

    useEffect(() => {
        if (!open) {
            clearTransientImageState();
            clearValidationErrors();
            resetStore();
        }
    }, [open, clearTransientImageState, clearValidationErrors, resetStore]);

    useEffect(() => {
        return () => {
            revokeObjectUrl(usePhotoUploadModalStore.getState().sourceImageUrl);
            revokeObjectUrl(
                usePhotoUploadModalStore.getState().croppedPreviewUrl,
            );
        };
    }, []);

    const invalidateCroppedPreview = useCallback(() => {
        revokeObjectUrl(usePhotoUploadModalStore.getState().croppedPreviewUrl);
        setCroppedPreviewUrl(null);
        setCroppedImageFile(null);
        setHasUnsavedChanges(true);
    }, [setCroppedImageFile, setCroppedPreviewUrl, setHasUnsavedChanges]);

    const handleFileSelect = useCallback(
        async (file: File) => {
            clearValidationErrors();
            invalidateCroppedPreview();

            const fileErrors = validateAvatarFile(file);
            if (fileErrors.length > 0) {
                clearTransientImageState();
                applyValidationErrors(fileErrors);
                return;
            }

            const imageErrors = await validateAvatarImageSource(file);
            if (imageErrors.length > 0) {
                clearTransientImageState();
                applyValidationErrors(imageErrors);
                return;
            }

            revokeObjectUrl(usePhotoUploadModalStore.getState().sourceImageUrl);

            const objectUrl = URL.createObjectURL(file);
            setSelectedFile(file);
            setSourceImageUrl(objectUrl);
            setMode('edit');
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setHasUnsavedChanges(true);
        },
        [
            applyValidationErrors,
            clearTransientImageState,
            clearValidationErrors,
            invalidateCroppedPreview,
            setCrop,
            setHasUnsavedChanges,
            setMode,
            setSelectedFile,
            setSourceImageUrl,
            setZoom,
        ],
    );

    const handleGeneratePreview = useCallback(async () => {
        if (!sourceImageUrl || !croppedAreaPixels) {
            const errors: AvatarValidationError[] = [
                {
                    field: 'general',
                    message:
                        'Move and zoom the image before generating preview.',
                },
            ];
            applyValidationErrors(errors);
            return;
        }

        setIsProcessing(true);
        clearValidationErrors();

        try {
            const croppedFile = await createCroppedImageFile(
                sourceImageUrl,
                croppedAreaPixels,
                'image/webp',
            );

            const fileErrors = validateAvatarFile(croppedFile);
            if (fileErrors.length > 0) {
                applyValidationErrors(fileErrors);
                setCroppedImageFile(null);
                return;
            }

            const imageErrors = await validateAvatarImageSource(croppedFile);
            if (imageErrors.length > 0) {
                applyValidationErrors(imageErrors);
                setCroppedImageFile(null);
                return;
            }

            revokeObjectUrl(
                usePhotoUploadModalStore.getState().croppedPreviewUrl,
            );

            const previewUrl = URL.createObjectURL(croppedFile);
            setCroppedImageFile(croppedFile);
            setCroppedPreviewUrl(previewUrl);
            setHasUnsavedChanges(true);
        } catch {
            applyValidationErrors([
                {
                    field: 'general',
                    message:
                        'Failed to generate crop preview. Please try again.',
                },
            ]);
        } finally {
            setIsProcessing(false);
        }
    }, [
        applyValidationErrors,
        clearValidationErrors,
        croppedAreaPixels,
        setCroppedImageFile,
        setCroppedPreviewUrl,
        setHasUnsavedChanges,
        setIsProcessing,
        sourceImageUrl,
    ]);

    const handleInputChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];

            if (file) {
                await handleFileSelect(file);
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [handleFileSelect],
    );

    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragOver(true);
        },
        [setIsDragOver],
    );

    const handleDragLeave = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragOver(false);
        },
        [setIsDragOver],
    );

    const handleDrop = useCallback(
        async (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragOver(false);

            const file = event.dataTransfer.files?.[0];
            if (!file) {
                return;
            }

            await handleFileSelect(file);
        },
        [handleFileSelect, setIsDragOver],
    );

    const handleSave = useCallback(() => {
        if (!croppedImageFile) {
            applyValidationErrors([
                {
                    field: 'general',
                    message:
                        'Generate preview first so you can confirm the final crop.',
                },
            ]);
            return;
        }

        onUpload(croppedImageFile);
        resetAndClose();
    }, [applyValidationErrors, croppedImageFile, onUpload, resetAndClose]);

    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            setShowCancelConfirm(true);
            return;
        }

        resetAndClose();
    }, [hasUnsavedChanges, resetAndClose, setShowCancelConfirm]);

    const handleCropComplete = useCallback(
        (_area: Area, areaPixels: Area) => {
            setCroppedAreaPixels(areaPixels);
        },
        [setCroppedAreaPixels],
    );

    const handleDeleteClick = useCallback(() => {
        setShowDeleteConfirm(true);
    }, [setShowDeleteConfirm]);

    const confirmDelete = useCallback(() => {
        setShowDeleteConfirm(false);
        if (onDelete) {
            onDelete();
        }
    }, [onDelete, setShowDeleteConfirm]);

    const handleDownload = useCallback(() => {
        if (!currentAvatar) {
            return;
        }

        const link = document.createElement('a');
        link.href = currentAvatar;
        link.download = 'profile-picture.jpg';
        link.click();
    }, [currentAvatar]);

    const handleReplaceClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const errorMessage =
        validationErrors.length > 0 ? validationErrors[0].message : null;
    const displayPreview =
        croppedPreviewUrl ??
        (mode === 'edit' ? sourceImageUrl : null) ??
        currentAvatar ??
        undefined;
    const isEditing = mode === 'edit';
    const hasExistingAvatar = Boolean(currentAvatar);

    const fileTypeLabels = AVATAR_ALLOWED_TYPES.map((type) =>
        type.replace('image/', '').toUpperCase(),
    ).join(', ');

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        handleCancel();
                    }
                }}
            >
                <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Profile Photo' : 'Profile Photo'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Crop, zoom, and preview your final image before saving.'
                                : hasExistingAvatar
                                  ? 'View or replace your profile picture.'
                                  : 'Upload a profile picture to personalize your account.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-2 md:grid-cols-[220px_1fr]">
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="h-36 w-36 overflow-hidden rounded-full border-4 border-muted">
                                <AvatarImage
                                    src={displayPreview}
                                    alt={`${userName}'s profile picture`}
                                />
                                <AvatarFallback className="text-4xl">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>

                            {selectedFile && (
                                <div className="w-full rounded-md bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                    <p className="font-medium">
                                        {selectedFile.name}
                                    </p>
                                    <p>
                                        {Math.round(selectedFile.size / 1024)}{' '}
                                        KB
                                    </p>
                                </div>
                            )}

                            {croppedImageFile && (
                                <div className="flex w-full items-start gap-2 rounded-md bg-green-50 p-3 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                    <CheckCircle className="mt-0.5 size-4 flex-shrink-0" />
                                    <p>
                                        Preview ready. This is the image that
                                        will be uploaded.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {isEditing ? (
                                <>
                                    <div className="relative h-72 overflow-hidden rounded-lg border bg-muted/40">
                                        {sourceImageUrl ? (
                                            <Cropper
                                                image={sourceImageUrl}
                                                crop={crop}
                                                zoom={zoom}
                                                aspect={1}
                                                cropShape="round"
                                                showGrid={false}
                                                onCropChange={(nextCrop) => {
                                                    setCrop(nextCrop);
                                                    invalidateCroppedPreview();
                                                }}
                                                onZoomChange={(nextZoom) => {
                                                    setZoom(nextZoom);
                                                    invalidateCroppedPreview();
                                                }}
                                                onCropComplete={
                                                    handleCropComplete
                                                }
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                                Select an image to begin
                                                editing.
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Zoom</span>
                                            <span>
                                                {Math.round(zoom * 100)}%
                                            </span>
                                        </div>
                                        <Slider
                                            value={[zoom]}
                                            min={1}
                                            max={3}
                                            step={0.05}
                                            onValueChange={(
                                                value: number[],
                                            ) => {
                                                setZoom(value[0]);
                                                invalidateCroppedPreview();
                                            }}
                                        />
                                    </div>

                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={handleReplaceClick}
                                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                                            isDragOver
                                                ? 'border-primary bg-primary/5'
                                                : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
                                        }`}
                                    >
                                        <Upload className="size-5 text-muted-foreground" />
                                        <div className="text-xs">
                                            <p className="font-medium">
                                                Replace photo
                                            </p>
                                            <p className="text-muted-foreground">
                                                {fileTypeLabels} • max{' '}
                                                {AVATAR_MAX_SIZE / 1024 / 1024}
                                                MB
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleReplaceClick}
                                            disabled={
                                                isProcessing || isUploading
                                            }
                                        >
                                            <Camera className="mr-2 size-4" />
                                            Replace
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleGeneratePreview}
                                            disabled={
                                                isProcessing ||
                                                isUploading ||
                                                !sourceImageUrl
                                            }
                                        >
                                            {isProcessing ? (
                                                <Spinner className="mr-2 size-4" />
                                            ) : null}
                                            Update Preview
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={
                                                isProcessing ||
                                                isUploading ||
                                                !croppedImageFile
                                            }
                                        >
                                            {isUploading ? (
                                                <Spinner className="mr-2 size-4" />
                                            ) : null}
                                            Save
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDownload}
                                            disabled={!hasExistingAvatar}
                                        >
                                            <Download className="mr-2 size-4" />
                                            Download
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleReplaceClick}
                                        >
                                            <Camera className="mr-2 size-4" />
                                            Upload
                                        </Button>
                                        {canDelete && onDelete && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleDeleteClick}
                                                disabled={isDeleting}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                {isDeleting ? (
                                                    <Spinner className="mr-2 size-4" />
                                                ) : (
                                                    <Trash2 className="mr-2 size-4" />
                                                )}
                                                Delete
                                            </Button>
                                        )}
                                    </div>

                                    <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                        <p className="font-medium">
                                            Tips for best results:
                                        </p>
                                        <ul className="list-inside list-disc text-xs">
                                            <li>
                                                Use a square image for best
                                                results.
                                            </li>
                                            <li>
                                                Minimum size:{' '}
                                                {AVATAR_MIN_DIMENSION}x
                                                {AVATAR_MIN_DIMENSION}px.
                                            </li>
                                            <li>
                                                Upload clear, well-lit photos.
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            )}

                            {errorMessage && (
                                <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                    <AlertCircle className="mt-0.5 size-4 flex-shrink-0" />
                                    <div>
                                        <p>{errorMessage}</p>
                                        {getAvatarValidationErrorMessage(
                                            validationErrors,
                                            'fileType',
                                        ) && (
                                            <p className="text-xs">
                                                Only {fileTypeLabels} are
                                                supported.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept={AVATAR_ALLOWED_TYPES.join(',')}
                        onChange={(event) => {
                            void handleInputChange(event);
                        }}
                        className="hidden"
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete profile photo?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove your current profile photo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={showCancelConfirm}
                onOpenChange={setShowCancelConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your unsaved image edits will be removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep editing</AlertDialogCancel>
                        <AlertDialogAction onClick={resetAndClose}>
                            Discard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
