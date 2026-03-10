import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';

interface ProfileSettingsState {
    showAvatarModal: boolean;
    isUploading: boolean;
    setShowAvatarModal: (show: boolean) => void;
    setIsUploading: (uploading: boolean) => void;
    reset: () => void;
}

const initialState: Omit<
    ProfileSettingsState,
    'setShowAvatarModal' | 'setIsUploading' | 'reset'
> = {
    showAvatarModal: false,
    isUploading: false,
};

const useProfileSettingsStoreBase = create<ProfileSettingsState>()((set) => ({
    ...initialState,
    
    setShowAvatarModal: (showAvatarModal) => {
        set({ showAvatarModal });
    },
    
    setIsUploading: (isUploading) => {
        set({ isUploading });
    },
    
    reset: () => {
        set(initialState);
    },
}));

export const useProfileSettingsStore = createSelectors(useProfileSettingsStoreBase);
