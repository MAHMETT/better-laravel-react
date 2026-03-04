import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import type { AvatarValidationError } from '@/schemas/avatar';
import { useAvatarUploadStore } from '@/stores/avatar-upload';
import { AlertCircle, Camera, CheckCircle, Upload } from 'lucide-react';
import { useCallback, useRef } from 'react';
import type { Area } from 'react-easy-crop';
import { ImageCropDialog } from './image-crop-dialog';

interface AvatarUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAvatar?: string | null;
    userName: string;
    onAvatarSelect: (file: File, croppedData?: { blob: Blob; cropData: Area }) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 10 * 1024; // 10KB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MIN_DIMENSION = 100;
const MAX_DIMENSION = 4096;

export function AvatarUploadModal({
    open,
    onOpenChange,
    currentAvatar,
    userName,
    onAvatarSelect,
}: AvatarUploadModalProps) {
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewImage = useAvatarUploadStore((state) => state.previewImage);
    const selectedFile = useAvatarUploadStore((state) => state.selectedFile);
    const avatarValidationErrors = useAvatarUploadStore(
        (state) => state.validationErrors,
    );
    const isDragOver = useAvatarUploadStore((state) => state.isDragOver);
    const showCropDialog = useAvatarUploadStore((state) => state.showCropDialog);
    const crop = useAvatarUploadStore((state) => state.crop);
    const zoom = useAvatarUploadStore((state) => state.zoom);
    const croppedAreaPixels = useAvatarUploadStore(
        (state) => state.croppedAreaPixels,
    );
    const isProcessing = useAvatarUploadStore((state) => state.isProcessing);
    const setPreviewImage = useAvatarUploadStore((state) => state.setPreviewImage);
    const setSelectedFile = useAvatarUploadStore((state) => state.setSelectedFile);
    const setValidationErrors = useAvatarUploadStore(
        (state) => state.setValidationErrors,
    );
    const setIsDragOver = useAvatarUploadStore((state) => state.setIsDragOver);
    const setShowCropDialog = useAvatarUploadStore(
        (state) => state.setShowCropDialog,
    );
    const setCrop = useAvatarUploadStore((state) => state.setCrop);
    const setZoom = useAvatarUploadStore((state) => state.setZoom);
    const setCroppedAreaPixels = useAvatarUploadStore(
        (state) => state.setCroppedAreaPixels,
    );
    const setIsProcessing = useAvatarUploadStore((state) => state.setIsProcessing);
    const resetState = useAvatarUploadStore((state) => state.reset);

    const validateFile = useCallback((file: File): AvatarValidationError[] => {
        const errors: AvatarValidationError[] = [];

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            errors.push({
                field: 'fileSize',
                message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            });
        }

        if (file.size < MIN_FILE_SIZE) {
            errors.push({ field: 'fileSize', message: 'File is too small' });
        }

        // Check file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            errors.push({
                field: 'fileType',
                message: 'File type must be JPEG, PNG, GIF, or WebP',
            });
        }

        return errors;
    }, []);

    const validateImageDimensions = useCallback((image: HTMLImageElement): AvatarValidationError | null => {
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
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        setValidationErrors([]);
        setPreviewImage(null);
        setSelectedFile(null);

        // Validate file
        const errors = validateFile(file);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Create preview and validate dimensions
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const dimensionError = validateImageDimensions(img);
                if (dimensionError) {
                    setValidationErrors([dimensionError]);
                    return;
                }

                setPreviewImage(e.target?.result as string);
                setSelectedFile(file);
                setShowCropDialog(true);
            };
            img.onerror = () => {
                setValidationErrors([
                    {
                        field: 'general',
                        message: 'Failed to load image. File may be corrupted.',
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
    }, [setPreviewImage, setSelectedFile, setShowCropDialog, setValidationErrors, validateFile, validateImageDimensions]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, [setIsDragOver]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, [setIsDragOver]);

    const handleDrop = useCallback((e: React.DragEvent) => {
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
    }, [handleFileSelect, setIsDragOver, setValidationErrors]);

    const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, [setCroppedAreaPixels]);

    const createCroppedImage = useCallback(async (): Promise<Blob> => {
        if (!previewImage || !croppedAreaPixels) {
            throw new Error('No image to crop');
        }

        const image = new Image();
        image.src = previewImage;
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
            croppedAreaPixels.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    throw new Error('Canvas to Blob failed');
                }
                resolve(blob);
            }, 'image/webp', 0.9);
        });
    }, [previewImage, croppedAreaPixels]);

    const handleConfirmCrop = useCallback(async () => {
        if (!selectedFile || !croppedAreaPixels) {
            return;
        }

        setIsProcessing(true);

        try {
            const croppedBlob = await createCroppedImage();
            const croppedFile = new File([croppedBlob], selectedFile.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
            });

            onAvatarSelect(croppedFile, { blob: croppedBlob, cropData: croppedAreaPixels });
            // Close modal and reset state
            setPreviewImage(null);
            setSelectedFile(null);
            setValidationErrors([]);
            setShowCropDialog(false);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
            onOpenChange(false);
        } catch {
            setValidationErrors([
                {
                    field: 'general',
                    message: 'Failed to process image. Please try again.',
                },
            ]);
        } finally {
            setIsProcessing(false);
        }
    }, [createCroppedImage, croppedAreaPixels, onAvatarSelect, onOpenChange, selectedFile, setCroppedAreaPixels, setCrop, setIsProcessing, setPreviewImage, setSelectedFile, setShowCropDialog, setValidationErrors, setZoom]);

    const handleClose = useCallback(() => {
        resetState();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onOpenChange(false);
    }, [onOpenChange, resetState]);

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            Update Profile Picture
                        </DialogTitle>
                        <DialogDescription>
                            Choose a profile picture. JPEG, PNG, GIF, or WebP. Max 5MB.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-6 py-6">
                        {/* Current Avatar Preview */}
                        <div className="relative">
                            <Avatar className="h-32 w-32 overflow-hidden rounded-full border-4 border-muted">
                                <AvatarImage
                                    src={previewImage || currentAvatar || undefined}
                                    alt={userName}
                                />
                                <AvatarFallback className="text-4xl">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>

                            {/* Upload overlay on hover */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 hover:opacity-100"
                                aria-label="Upload new avatar"
                            >
                                <Camera className="h-10 w-10 text-white" />
                            </button>
                        </div>

                        {/* Drag & Drop Zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors duration-200
                                ${isDragOver
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
                                }
                            `}
                            role="button"
                            tabIndex={0}
                            aria-label="Upload image by clicking or dragging"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    fileInputRef.current?.click();
                                }
                            }}
                        >
                            <div className="flex items-center justify-center rounded-full bg-muted p-3">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    JPEG, PNG, GIF, or WebP (max 5MB)
                                </p>
                            </div>
                        </div>

                        {/* Validation Errors */}
                        {avatarValidationErrors.length > 0 && (
                            <div className="w-full space-y-2">
                                {avatarValidationErrors
                                    .filter((error) => error.field === 'fileSize')
                                    .map((error) => (
                                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="size-4 flex-shrink-0" />
                                        <span>{error.message}</span>
                                    </div>
                                ))}
                                {avatarValidationErrors
                                    .filter((error) => error.field === 'fileType')
                                    .map((error) => (
                                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="size-4 flex-shrink-0" />
                                        <span>{error.message}</span>
                                    </div>
                                ))}
                                {avatarValidationErrors
                                    .filter((error) => error.field === 'dimensions')
                                    .map((error) => (
                                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="size-4 flex-shrink-0" />
                                        <span>{error.message}</span>
                                    </div>
                                ))}
                                {avatarValidationErrors
                                    .filter((error) => error.field === 'general')
                                    .map((error) => (
                                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="size-4 flex-shrink-0" />
                                        <span>{error.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* File Input */}
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleInputChange}
                            className="hidden"
                        />

                        {/* Tips */}
                        <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                            <CheckCircle className="mt-0.5 size-4 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="font-medium">Tips for best results:</p>
                                <ul className="list-inside list-disc space-y-0.5 text-xs">
                                    <li>Use a square image for best results</li>
                                    <li>Minimum size: {MIN_DIMENSION}x{MIN_DIMENSION}px</li>
                                    <li>Clear, well-lit photos work best</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Crop Dialog */}
            <ImageCropDialog
                open={showCropDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowCropDialog(false);
                        setPreviewImage(null);
                        setSelectedFile(null);
                    }
                }}
                image={previewImage || ''}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                onConfirm={handleConfirmCrop}
                isProcessing={isProcessing}
            />
        </>
    );
}
