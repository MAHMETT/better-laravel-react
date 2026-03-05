import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';
import type { Area, Point } from 'react-easy-crop';
import type { AvatarValidationError } from '@/schemas/avatar';

export type PhotoUploadMode = 'view' | 'edit';

interface PhotoUploadModalState {
    mode: PhotoUploadMode;
    selectedFile: File | null;
    sourceImageUrl: string | null;
    croppedPreviewUrl: string | null;
    croppedImageFile: File | null;
    croppedAreaPixels: Area | null;
    crop: Point;
    zoom: number;
    validationErrors: AvatarValidationError[];
    isDragOver: boolean;
    isProcessing: boolean;
    hasUnsavedChanges: boolean;
    showDeleteConfirm: boolean;
    showCancelConfirm: boolean;
    setMode: (mode: PhotoUploadMode) => void;
    setSelectedFile: (file: File | null) => void;
    setSourceImageUrl: (url: string | null) => void;
    setCroppedPreviewUrl: (url: string | null) => void;
    setCroppedImageFile: (file: File | null) => void;
    setCroppedAreaPixels: (area: Area | null) => void;
    setCrop: (crop: Point) => void;
    setZoom: (zoom: number) => void;
    setValidationErrors: (errors: AvatarValidationError[]) => void;
    clearValidationErrors: () => void;
    setIsDragOver: (isDragOver: boolean) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
    setShowDeleteConfirm: (showDeleteConfirm: boolean) => void;
    setShowCancelConfirm: (showCancelConfirm: boolean) => void;
    reset: () => void;
}

const initialState: Omit<
    PhotoUploadModalState,
    | 'setMode'
    | 'setSelectedFile'
    | 'setSourceImageUrl'
    | 'setCroppedPreviewUrl'
    | 'setCroppedImageFile'
    | 'setCroppedAreaPixels'
    | 'setCrop'
    | 'setZoom'
    | 'setValidationErrors'
    | 'clearValidationErrors'
    | 'setIsDragOver'
    | 'setIsProcessing'
    | 'setHasUnsavedChanges'
    | 'setShowDeleteConfirm'
    | 'setShowCancelConfirm'
    | 'reset'
> = {
    mode: 'view',
    selectedFile: null,
    sourceImageUrl: null,
    croppedPreviewUrl: null,
    croppedImageFile: null,
    croppedAreaPixels: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    validationErrors: [],
    isDragOver: false,
    isProcessing: false,
    hasUnsavedChanges: false,
    showDeleteConfirm: false,
    showCancelConfirm: false,
};

const usePhotoUploadModalStoreBase = create<PhotoUploadModalState>()((set) => ({
    ...initialState,

    setMode: (mode) => set({ mode }),
    setSelectedFile: (selectedFile) => set({ selectedFile }),
    setSourceImageUrl: (sourceImageUrl) => set({ sourceImageUrl }),
    setCroppedPreviewUrl: (croppedPreviewUrl) => set({ croppedPreviewUrl }),
    setCroppedImageFile: (croppedImageFile) => set({ croppedImageFile }),
    setCroppedAreaPixels: (croppedAreaPixels) => set({ croppedAreaPixels }),
    setCrop: (crop) => set({ crop }),
    setZoom: (zoom) => set({ zoom }),
    setValidationErrors: (validationErrors) => set({ validationErrors }),
    clearValidationErrors: () => set({ validationErrors: [] }),
    setIsDragOver: (isDragOver) => set({ isDragOver }),
    setIsProcessing: (isProcessing) => set({ isProcessing }),
    setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
    setShowDeleteConfirm: (showDeleteConfirm) => set({ showDeleteConfirm }),
    setShowCancelConfirm: (showCancelConfirm) => set({ showCancelConfirm }),
    reset: () => set(initialState),
}));

export const usePhotoUploadModalStore = createSelectors(
    usePhotoUploadModalStoreBase,
);
