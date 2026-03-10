import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';
import type { Area } from 'react-easy-crop';
import type { AvatarValidationError } from '@/schemas/avatar';

type AvatarUploaderStep = 'select' | 'crop' | 'preview';

interface AvatarUploaderState {
    // Modal state
    open: boolean;
    showDeleteDialog: boolean;
    isConfirmingDelete: boolean;
    
    // File state
    selectedFile: File | null;
    sourceImageUrl: string | null;
    croppedPreviewUrl: string | null;
    
    // Crop state
    step: AvatarUploaderStep;
    crop: { x: number; y: number };
    zoom: number;
    croppedAreaPixels: Area | null;
    
    // UI state
    validationErrors: AvatarValidationError[];
    isDragOver: boolean;
    isProcessing: boolean;
    
    // Actions
    setOpen: (open: boolean) => void;
    setShowDeleteDialog: (show: boolean) => void;
    setIsConfirmingDelete: (confirming: boolean) => void;
    setSelectedFile: (file: File | null) => void;
    setSourceImageUrl: (url: string | null) => void;
    setCroppedPreviewUrl: (url: string | null) => void;
    setStep: (step: AvatarUploaderStep) => void;
    setCrop: (crop: { x: number; y: number }) => void;
    setZoom: (zoom: number) => void;
    setCroppedAreaPixels: (area: Area | null) => void;
    setValidationErrors: (errors: AvatarValidationError[]) => void;
    setIsDragOver: (isDragOver: boolean) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    reset: () => void;
}

const initialState: Omit<
    AvatarUploaderState,
    | 'setOpen'
    | 'setShowDeleteDialog'
    | 'setIsConfirmingDelete'
    | 'setSelectedFile'
    | 'setSourceImageUrl'
    | 'setCroppedPreviewUrl'
    | 'setStep'
    | 'setCrop'
    | 'setZoom'
    | 'setCroppedAreaPixels'
    | 'setValidationErrors'
    | 'setIsDragOver'
    | 'setIsProcessing'
    | 'reset'
> = {
    open: false,
    showDeleteDialog: false,
    isConfirmingDelete: false,
    selectedFile: null,
    sourceImageUrl: null,
    croppedPreviewUrl: null,
    step: 'select',
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedAreaPixels: null,
    validationErrors: [],
    isDragOver: false,
    isProcessing: false,
};

const useAvatarUploaderStoreBase = create<AvatarUploaderState>()((set) => ({
    ...initialState,
    
    setOpen: (open) => {
        set({ open });
    },
    
    setShowDeleteDialog: (showDeleteDialog) => {
        set({ showDeleteDialog });
    },
    
    setIsConfirmingDelete: (isConfirmingDelete) => {
        set({ isConfirmingDelete });
    },
    
    setSelectedFile: (selectedFile) => {
        set({ selectedFile });
    },
    
    setSourceImageUrl: (sourceImageUrl) => {
        set({ sourceImageUrl });
    },
    
    setCroppedPreviewUrl: (croppedPreviewUrl) => {
        set({ croppedPreviewUrl });
    },
    
    setStep: (step) => {
        set({ step });
    },
    
    setCrop: (crop) => {
        set({ crop });
    },
    
    setZoom: (zoom) => {
        set({ zoom });
    },
    
    setCroppedAreaPixels: (croppedAreaPixels) => {
        set({ croppedAreaPixels });
    },
    
    setValidationErrors: (validationErrors) => {
        set({ validationErrors });
    },
    
    setIsDragOver: (isDragOver) => {
        set({ isDragOver });
    },
    
    setIsProcessing: (isProcessing) => {
        set({ isProcessing });
    },
    
    reset: () => {
        // Cleanup URLs before reset
        const state = useAvatarUploaderStoreBase.getState();
        if (state.sourceImageUrl) {
            URL.revokeObjectURL(state.sourceImageUrl);
        }
        if (state.croppedPreviewUrl) {
            URL.revokeObjectURL(state.croppedPreviewUrl);
        }
        
        set(initialState);
    },
}));

export const useAvatarUploaderStore = createSelectors(useAvatarUploaderStoreBase);
