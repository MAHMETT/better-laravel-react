import type { StoreApi, UseBoundStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T }
    ? S & { use: { [K in keyof T]: () => T[K] } }
    : never;

/**
 * Auto-generates selectors for a Zustand store.
 *
 * @example
 * const useBearStoreBase = create<BearState>()((set) => ({
 *     bears: 0,
 *     increase: (by) => set((state) => ({ bears: state.bears + by })),
 * }));
 * const useBearStore = createSelectors(useBearStoreBase);
 *
 * // Usage:
 * const bears = useBearStore.use.bears();
 * const increase = useBearStore.use.increase();
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
    _store: S,
) => {
    const store = _store as WithSelectors<typeof _store>;
    store.use = {};
    for (const k of Object.keys(store.getState())) {
        (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
    }

    return store;
};
