import type { Area } from 'react-easy-crop';

const DEFAULT_QUALITY = 0.92;

export async function createCroppedImageFile(
    sourceImageUrl: string,
    crop: Area,
    outputMimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/webp',
): Promise<File> {
    const image = await loadImage(sourceImageUrl);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Unable to initialize canvas context.');
    }

    canvas.width = crop.width;
    canvas.height = crop.height;

    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height,
    );

    const blob = await canvasToBlob(canvas, outputMimeType, DEFAULT_QUALITY);
    const extension = outputMimeType.split('/')[1];

    return new File([blob], `avatar-cropped.${extension}`, {
        type: outputMimeType,
        lastModified: Date.now(),
    });
}

export function revokeObjectUrl(url: string | null): void {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

function loadImage(sourceImageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            resolve(image);
        };
        image.onerror = () => {
            reject(new Error('Unable to load source image.'));
        };
        image.src = sourceImageUrl;
    });
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(
                        new Error('Failed to convert canvas to image blob.'),
                    );
                    return;
                }

                resolve(blob);
            },
            mimeType,
            quality,
        );
    });
}
