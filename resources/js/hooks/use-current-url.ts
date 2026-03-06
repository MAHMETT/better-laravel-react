import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';

export type IsCurrentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl?: string,
) => boolean;

export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

export type IsActiveFn = (
    path: string,
    currentUrl?: string,
) => boolean;

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: IsCurrentUrlFn;
    whenCurrentUrl: WhenCurrentUrlFn;
    isActive: IsActiveFn;
};

export function useCurrentUrl(): UseCurrentUrlReturn {
    const page = usePage();
    const currentUrlPath = new URL(page.url, window?.location.origin).pathname;

    const isCurrentUrl: IsCurrentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
    ) => {
        const urlToCompare = currentUrl ?? currentUrlPath;
        const urlString = toUrl(urlToCheck);

        if (!urlString.startsWith('http')) {
            return urlString === urlToCompare;
        }

        try {
            const absoluteUrl = new URL(urlString);
            return absoluteUrl.pathname === urlToCompare;
        } catch {
            return false;
        }
    };

    const whenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => {
        return isCurrentUrl(urlToCheck) ? ifTrue : ifFalse;
    };

    const isActive: IsActiveFn = (
        path: string,
        currentUrl?: string,
    ): boolean => {
        const urlToCompare = currentUrl ?? currentUrlPath;
        // Normalize path to ensure it starts with /
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        // Check if current URL starts with the given path
        // Also ensure exact match for root path or when path ends with /
        if (normalizedPath === '/') {
            return urlToCompare === '/';
        }
        return (
            urlToCompare === normalizedPath ||
            urlToCompare.startsWith(`${normalizedPath}/`)
        );
    };

    return {
        currentUrl: currentUrlPath,
        isCurrentUrl,
        whenCurrentUrl,
        isActive,
    };
}
