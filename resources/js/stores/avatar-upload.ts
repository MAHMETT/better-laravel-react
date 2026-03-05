import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';
import type { Area, Point } from 'react-easy-crop';
import type { AvatarValidationError } from '@/schemas/avatar';

interface AvatarUploadState {
    isOpen: boolean;
    previewImage: string | null;
    selectedFile: File | null;
    validationErrors: AvatarValidationError[];
    isDragOver: boolean;
    showCropDialog: boolean;
    crop: Point;
    zoom: number;
    croppedAreaPixels: Area | null;
    isProcessing: boolean;
    isUploading: boolean;
    open: () => void;
    close: () => void;
    setPreviewImage: (image: string | null) => void;
    setSelectedFile: (file: File | null) => void;
    setValidationErrors: (errors: AvatarValidationError[]) => void;
    addValidationError: (error: AvatarValidationError) => void;
    clearValidationErrors: () => void;
    setIsDragOver: (isDragOver: boolean) => void;
    setShowCropDialog: (show: boolean) => void;
    setCrop: (crop: Point) => void;
    setZoom: (zoom: number) => void;
    setCroppedAreaPixels: (area: Area | null) => void;
    setIsProcessing: (processing: boolean) => void;
    setIsUploading: (uploading: boolean) => void;
    reset: () => void;
}

const initialState: Omit<
    AvatarUploadState,
    | 'open'
    | 'close'
    | 'setPreviewImage'
    | 'setSelectedFile'
    | 'setValidationErrors'
    | 'addValidationError'
    | 'clearValidationErrors'
    | 'setIsDragOver'
    | 'setShowCropDialog'
    | 'setCrop'
    | 'setZoom'
    | 'setCroppedAreaPixels'
    | 'setIsProcessing'
    | 'setIsUploading'
    | 'reset'
> = {
    isOpen: false,
    previewImage: null,
    selectedFile: null,
    validationErrors: [],
    isDragOver: false,
    showCropDialog: false,
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedAreaPixels: null,
    isProcessing: false,
    isUploading: false,
};

const useAvatarUploadStoreBase = create<AvatarUploadState>()((set) => ({
    ...initialState,

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),

    setPreviewImage: (previewImage) => set({ previewImage }),
    setSelectedFile: (selectedFile) => set({ selectedFile }),

    setValidationErrors: (validationErrors) => set({ validationErrors }),

    addValidationError: (error) =>
        set((state) => ({
            validationErrors: [...state.validationErrors, error],
        })),

    clearValidationErrors: () => set({ validationErrors: [] }),

    setIsDragOver: (isDragOver) => set({ isDragOver }),

    setShowCropDialog: (showCropDialog) => set({ showCropDialog }),

    setCrop: (crop) => set({ crop }),

    setZoom: (zoom) => set({ zoom }),

    setCroppedAreaPixels: (croppedAreaPixels) => set({ croppedAreaPixels }),

    setIsProcessing: (isProcessing) => set({ isProcessing }),

    setIsUploading: (isUploading) => set({ isUploading }),

    reset: () => set(initialState),
}));

export const useAvatarUploadStore = createSelectors(useAvatarUploadStoreBase);
