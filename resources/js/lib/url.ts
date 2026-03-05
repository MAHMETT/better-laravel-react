export function normalizeUrl(url?: string | null): string {
    if (!url) return '';
    return url.trim();
}

export function isExternalUrl(url?: string | null): boolean {
    const value = normalizeUrl(url);
    if (!value) return false;

    return /^(https?:|mailto:|tel:)/i.test(value);
}

export function isInternalUrl(url?: string | null): boolean {
    const value = normalizeUrl(url);
    if (!value) return false;

    return !isExternalUrl(value);
}

export function getLinkTarget(url?: string | null): '_blank' | '_self' {
    return isExternalUrl(url) ? '_blank' : '_self';
}
