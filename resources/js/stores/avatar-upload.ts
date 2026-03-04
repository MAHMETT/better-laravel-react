import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Area, Point } from 'react-easy-crop';
import type { AvatarValidationError } from '@/schemas/avatar';

export interface AvatarUploadState {
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

const initialState = {
    isOpen: false,
    previewImage: null,
    selectedFile: null,
    validationErrors: [] as AvatarValidationError[],
    isDragOver: false,
    showCropDialog: false,
    crop: { x: 0, y: 0 } as Point,
    zoom: 1,
    croppedAreaPixels: null,
    isProcessing: false,
    isUploading: false,
};

export const useAvatarUploadStore = create<AvatarUploadState>()(
    subscribeWithSelector((set) => ({
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
    })),
);

export const selectIsOpen = (state: AvatarUploadState) => state.isOpen;
export const selectPreviewImage = (state: AvatarUploadState) =>
    state.previewImage;
export const selectSelectedFile = (state: AvatarUploadState) =>
    state.selectedFile;
export const selectValidationErrors = (state: AvatarUploadState) =>
    state.validationErrors;
export const selectShowCropDialog = (state: AvatarUploadState) =>
    state.showCropDialog;
export const selectIsProcessing = (state: AvatarUploadState) =>
    state.isProcessing;
export const selectIsUploading = (state: AvatarUploadState) =>
    state.isUploading;
export const selectCrop = (state: AvatarUploadState) => state.crop;
export const selectZoom = (state: AvatarUploadState) => state.zoom;
export const selectCroppedAreaPixels = (state: AvatarUploadState) =>
    state.croppedAreaPixels;
