/**
 * Client-side media converter using Canvas API
 * Works completely offline without external dependencies
 * Supports: Image conversion, compression, resizing
 * Note: Video conversion requires server-side processing
 */

import { toast } from 'sonner';

export interface MediaConvertOptions {
    file: File;
    outputFormat: string;
    quality?: number;
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
    onProgress?: (progress: number) => void;
}

export interface MediaConvertResult {
    blob: Blob;
    fileName: string;
    originalSize: number;
    convertedSize: number;
    outputFormat: string;
    originalFormat: string;
    width: number;
    height: number;
}

export interface VideoPreset {
    name: string;
    format: string;
    videoBitrate: string;
    audioBitrate: string;
    resolution?: { width: number; height: number };
    frameRate?: number;
}

export interface ImagePreset {
    name: string;
    format: string;
    quality: number;
    width?: number;
    height?: number;
}

export const IMAGE_PRESETS: Record<string, ImagePreset> = {
    webpHigh: {
        name: 'WebP High Quality',
        format: 'webp',
        quality: 90,
    },
    webpMedium: {
        name: 'WebP Medium Quality',
        format: 'webp',
        quality: 70,
    },
    webpLow: {
        name: 'WebP Low Quality',
        format: 'webp',
        quality: 50,
    },
    jpegHigh: {
        name: 'JPEG High Quality',
        format: 'jpg',
        quality: 90,
    },
    jpegMedium: {
        name: 'JPEG Medium Quality',
        format: 'jpg',
        quality: 70,
    },
    jpegLow: {
        name: 'JPEG Low Quality',
        format: 'jpg',
        quality: 50,
    },
    png: {
        name: 'PNG (Lossless)',
        format: 'png',
        quality: 100,
    },
    thumbnail: {
        name: 'Thumbnail (150x150)',
        format: 'webp',
        quality: 70,
        width: 150,
        height: 150,
    },
    avatar: {
        name: 'Avatar (512x512)',
        format: 'webp',
        quality: 85,
        width: 512,
        height: 512,
    },
    cover: {
        name: 'Cover (1920x1080)',
        format: 'webp',
        quality: 80,
        width: 1920,
        height: 1080,
    },
};

/**
 * Convert media file (100% offline client-side)
 * Currently supports images only. Video conversion requires server-side processing.
 */
export async function convertMedia({
    file,
    outputFormat,
    quality = 85,
    width,
    height,
    maintainAspectRatio = true,
    onProgress,
}: MediaConvertOptions): Promise<MediaConvertResult> {
    const toastId = toast.loading('Converting media...', {
        duration: 0,
    });

    try {
        onProgress?.(10);

        if (!file.type.startsWith('image/')) {
            throw new Error(
                'Video conversion is not supported client-side. Please use server-side conversion for videos.',
            );
        }

        const originalSize = file.size;
        const originalFormat = file.name.split('.').pop() || 'unknown';

        toast.loading('Loading image...', {
            id: toastId,
            duration: 0,
        });

        onProgress?.(30);

        // Create an Image object
        const img = await createImageFromFile(file);

        onProgress?.(50);

        // Calculate dimensions
        const { width: finalWidth, height: finalHeight } = calculateDimensions(
            img.width,
            img.height,
            width,
            height,
            maintainAspectRatio,
        );

        toast.loading('Converting format...', {
            id: toastId,
            duration: 0,
        });

        onProgress?.(70);

        // Convert using canvas
        const mimeType = getMimeType(outputFormat);
        const blob = await canvasToBlob(
            img,
            mimeType,
            quality / 100,
            finalWidth,
            finalHeight,
        );

        onProgress?.(90);

        const convertedSize = blob.size;
        const savings =
            ((originalSize - convertedSize) / originalSize) * 100;

        const fileName = file.name.replace(
            /\.[^/.]+$/,
            `.${outputFormat}`,
        );

        onProgress?.(100);

        const savingsText =
            savings > 0
                ? `Saved ${savings.toFixed(1)}%`
                : `+${Math.abs(savings).toFixed(1)}%`;

        toast.success(
            `Converted to ${outputFormat.toUpperCase()}! ${savingsText} (${formatBytes(convertedSize)})`,
            {
                id: toastId,
                duration: 3000,
            },
        );

        return {
            blob,
            fileName,
            originalSize,
            convertedSize,
            outputFormat,
            originalFormat,
            width: finalWidth,
            height: finalHeight,
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Conversion failed';
        toast.error(`Conversion failed: ${message}`, {
            id: toastId,
            duration: 5000,
        });
        throw error;
    }
}

/**
 * Convert image file using preset (100% offline client-side)
 */
export async function convertImage(
    file: File,
    preset: ImagePreset | keyof typeof IMAGE_PRESETS,
): Promise<MediaConvertResult> {
    const presetConfig =
        typeof preset === 'string' ? IMAGE_PRESETS[preset] : preset;

    if (!presetConfig) {
        throw new Error(`Unknown image preset: ${preset}`);
    }

    return convertMedia({
        file,
        outputFormat: presetConfig.format,
        quality: presetConfig.quality,
        width: presetConfig.width,
        height: presetConfig.height,
    });
}

/**
 * Convert image from URL (100% offline client-side)
 */
export async function convertImageUrl(
    imageUrl: string,
    preset: ImagePreset | keyof typeof IMAGE_PRESETS,
): Promise<Blob> {
    const toastId = toast.loading('Loading image...', { duration: 0 });

    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();

        if (!blob.type.startsWith('image/')) {
            throw new Error('URL does not point to an image');
        }

        const file = new File([blob], 'image', { type: blob.type });

        const result = await convertImage(file, preset);

        toast.success('Image converted!', { id: toastId, duration: 3000 });

        return result.blob;
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to convert image';
        toast.error(`Conversion failed: ${message}`, {
            id: toastId,
            duration: 5000,
        });
        throw error;
    }
}

/**
 * Compress an image (100% offline client-side)
 */
export async function compressImage(
    file: File,
    quality: number = 80,
    maxSizeInKB?: number,
): Promise<Blob> {
    const toastId = toast.loading('Compressing image...', {
        duration: 0,
    });

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

            toast.success(
                `Compressed to ${formatBytes(blob.size)} (${Math.round((blob.size / file.size) * 100)}% of original)`,
                {
                    id: toastId,
                    duration: 3000,
                },
            );

            return blob;
        }

        // Simple compression
        const blob = await canvasToBlob(img, 'image/jpeg', quality / 100);

        toast.success(`Compressed to ${formatBytes(blob.size)}`, {
            id: toastId,
            duration: 3000,
        });

        return blob;
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to compress image';
        toast.error(`Compression failed: ${message}`, {
            id: toastId,
            duration: 5000,
        });
        throw error;
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
    const toastId = toast.loading('Resizing image...', {
        duration: 0,
    });

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

        const blob = await canvasToBlob(img, file.type, 1, width, height);

        toast.success(
            `Resized to ${width}x${height} (${formatBytes(blob.size)})`,
            {
                id: toastId,
                duration: 3000,
            },
        );

        return blob;
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to resize image';
        toast.error(`Resize failed: ${message}`, {
            id: toastId,
            duration: 5000,
        });
        throw error;
    }
}

/**
 * Download converted media
 */
export async function downloadConverted(
    blob: Blob,
    fileName: string,
): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Convert and download in one step (100% offline client-side)
 */
export async function convertAndDownloadMedia(
    file: File,
    preset: ImagePreset | keyof typeof IMAGE_PRESETS,
): Promise<void> {
    const result = await convertImage(file, preset);
    await downloadConverted(result.blob, result.fileName);
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
 * Get MIME type from format
 */
function getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        avif: 'image/avif',
        gif: 'image/gif',
        bmp: 'image/bmp',
    };
    return mimeTypes[format.toLowerCase()] || 'image/jpeg';
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
 * Get media info
 */
export async function getMediaInfo(file: File): Promise<{
    type: string;
    size: string;
    name: string;
    lastModified: string;
    dimensions?: string;
}> {
    const info: {
        type: string;
        size: string;
        name: string;
        lastModified: string;
        dimensions?: string;
    } = {
        type: file.type || 'unknown',
        size: formatBytes(file.size),
        name: file.name,
        lastModified: new Date(file.lastModified).toLocaleString(),
    };

    // Get dimensions for images
    if (file.type.startsWith('image/')) {
        try {
            const img = await createImageFromFile(file);
            info.dimensions = `${img.width}x${img.height}`;
        } catch {
            // Ignore dimension errors
        }
    }

    return info;
}

/**
 * Check if format is supported for conversion
 */
export function isFormatSupported(format: string): boolean {
    const canvas = document.createElement('canvas');
    const mimeType = getMimeType(format);
    const dataUrl = canvas.toDataURL(mimeType);
    return dataUrl.indexOf(`data:${mimeType}`) === 0;
}

/**
 * Get all supported formats
 */
export function getSupportedFormats(): string[] {
    const formats: string[] = [];
    const testFormats = ['webp', 'jpeg', 'png', 'avif'];

    for (const format of testFormats) {
        if (isFormatSupported(format)) {
            formats.push(format);
        }
    }

    return formats;
}
