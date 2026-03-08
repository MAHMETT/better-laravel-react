// Credit: https://usehooks-ts.com/
import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

interface ClipboardState {
    copiedText: CopiedValue;
    setCopiedText: (copiedText: CopiedValue) => void;
}

function createClipboardStore() {
    return createStore<ClipboardState>((set) => ({
        copiedText: null,
        setCopiedText: (copiedText) => {
            set({ copiedText });
        },
    }));
}

export function useClipboard(): UseClipboardReturn {
    const store = useMemo(() => createClipboardStore(), []);
    const copiedText = useStore(store, (state) => state.copiedText);
    const setCopiedText = useStore(store, (state) => state.setCopiedText);

    const copy: CopyFn = useCallback(
        async (text) => {
            if (!navigator?.clipboard) {
                return false;
            }

            try {
                await navigator.clipboard.writeText(text);
                setCopiedText(text);

                return true;
            } catch {
                setCopiedText(null);

                return false;
            }
        },
        [setCopiedText],
    );

    return [copiedText, copy];
}
