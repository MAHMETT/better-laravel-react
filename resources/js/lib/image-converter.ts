/**
 * Client-side image converter using Canvas API
 * Works completely offline without external dependencies
 */

interface ConvertToWebPOptions {
    file: File;
    quality?: number;
    onProgress?: (progress: number) => void;
}

interface ConvertToWebPResult {
    blob: Blob;
    fileName: string;
    originalSize: number;
    convertedSize: number;
}

interface ConvertImageOptions {
    file: File;
    quality?: number;
    format?: 'image/webp' | 'image/jpeg' | 'image/png';
    maxWidth?: number;
    maxHeight?: number;
    maintainAspectRatio?: boolean;
}

interface ConvertImageResult {
    blob: Blob;
    fileName: string;
    originalSize: number;
    convertedSize: number;
    width: number;
    height: number;
}

/**
 * Convert a File to WebP format using Canvas API (100% offline)
 */
export async function convertImageToWebP({
    file,
    quality = 90,
    onProgress,
}: ConvertToWebPOptions): Promise<ConvertToWebPResult> {
    try {
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        const originalSize = file.size;

        onProgress?.(10);

        // Create an Image object
        const img = await createImageFromFile(file);

        onProgress?.(50);

        // Convert to WebP using canvas
        const webpBlob = await canvasToBlob(img, 'image/webp', quality / 100);

        onProgress?.(90);

        const convertedSize = webpBlob.size;
        const fileName = file.name.replace(/\.[^/.]+$/, '.webp');

        onProgress?.(100);

        return {
            blob: webpBlob,
            fileName,
            originalSize,
            convertedSize,
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to convert image';
        throw new Error(message, { cause: error });
    }
}

/**
 * Convert an image URL to WebP format (100% offline client-side)
 */
export async function convertImageUrlToWebP(
    imageUrl: string,
    quality = 90,
): Promise<Blob> {
    try {
        // Fetch the image
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();

        if (!blob.type.startsWith('image/')) {
            throw new Error('URL does not point to an image');
        }

        const file = new File([blob], 'image', { type: blob.type });
        const result = await convertImageToWebP({ file, quality });

        return result.blob;
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to convert image';
        throw new Error(message, { cause: error });
    }
}

/**
 * Convert image file to any format (100% offline client-side)
 */
export async function convertImage({
    file,
    quality = 90,
    format = 'image/webp',
    maxWidth,
    maxHeight,
    maintainAspectRatio = true,
}: ConvertImageOptions): Promise<ConvertImageResult> {
    try {
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        const originalSize = file.size;

        // Create an Image object
        const img = await createImageFromFile(file);

        // Calculate dimensions
        const { width, height } = calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight,
            maintainAspectRatio,
        );

        // Convert using canvas
        const blob = await canvasToBlob(img, format, quality / 100, width, height);

        const extension = format.split('/')[1];
        const fileName = `${file.name.replace(/\.[^/.]+$/, '')}.${extension}`;

        return {
            blob,
            fileName,
            originalSize,
            convertedSize: blob.size,
            width,
            height,
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to convert image';
        throw new Error(message, { cause: error });
    }
}

/**
 * Compress an image file (100% offline client-side)
 */
export async function compressImage(
    file: File,
    quality: number = 80,
    maxSizeInKB?: number,
): Promise<Blob> {
    try {
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        const img = await createImageFromFile(file);

        // If max size is specified, iteratively reduce quality
        if (maxSizeInKB) {
            const maxBytes = maxSizeInKB * 1024;
            let currentQuality = quality / 100;
            let blob = await canvasToBlob(img, 'image/jpeg', currentQuality);

            // Reduce quality until we're under the size limit
            while (blob.size > maxBytes && currentQuality > 0.1) {
                currentQuality -= 0.1;
                blob = await canvasToBlob(img, 'image/jpeg', currentQuality);
            }

            return blob;
        }

        // Simple compression
        return await canvasToBlob(img, 'image/jpeg', quality / 100);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to compress image';
        throw new Error(message, { cause: error });
    }
}

/**
 * Resize an image (100% offline client-side)
 */
export async function resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean = true,
): Promise<Blob> {
    try {
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        const img = await createImageFromFile(file);

        const { width, height } = calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight,
            maintainAspectRatio,
        );

        return await canvasToBlob(img, file.type, 1, width, height);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to resize image';
        throw new Error(message, { cause: error });
    }
}

/**
 * Create an Image object from a File
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));

        const url = URL.createObjectURL(file);
        img.src = url;

        // Clean up object URL after image loads
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
    });
}

/**
 * Convert an Image to Blob using Canvas API
 */
function canvasToBlob(
    img: HTMLImageElement,
    format: string = 'image/webp',
    quality: number = 0.9,
    width?: number,
    height?: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Set dimensions
            canvas.width = width || img.width;
            canvas.height = height || img.height;

            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob from canvas'));
                    }
                },
                format,
                quality,
            );
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number,
    maintainAspectRatio: boolean = true,
): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (maxWidth && width > maxWidth) {
        if (maintainAspectRatio) {
            height = Math.round((height * maxWidth) / width);
        }
        width = maxWidth;
    }

    if (maxHeight && height > maxHeight) {
        if (maintainAspectRatio) {
            width = Math.round((width * maxHeight) / height);
        }
        height = maxHeight;
    }

    return { width, height };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if WebP format is supported
 */
export function isWebPSupported(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get supported image formats
 */
export function getSupportedFormats(): string[] {
    const formats: string[] = [];
    const testFormats = [
        'image/webp',
        'image/jpeg',
        'image/png',
    ];

    const canvas = document.createElement('canvas');

    for (const format of testFormats) {
        const dataUrl = canvas.toDataURL(format);
        if (dataUrl.indexOf(`data:${format}`) === 0) {
            formats.push(format);
        }
    }

    return formats;
}
