import { type } from 'arktype';

export const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const AVATAR_MIN_DIMENSION = 100;
export const AVATAR_MAX_DIMENSION = 4096;
export const AVATAR_ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
] as const;

export type AvatarAllowedType = (typeof AVATAR_ALLOWED_TYPES)[number];

export interface AvatarValidationError {
    field: 'fileSize' | 'fileType' | 'dimensions' | 'general';
    message: string;
}

const avatarFileShapeSchema = type({
    name: 'string',
    size: 'number',
    type: 'string',
});

const imageDimensionsSchema = type({
    width: 'number',
    height: 'number',
});

export function validateAvatarFile(file: File): AvatarValidationError[] {
    const errors: AvatarValidationError[] = [];

    // Validate file basic properties
    const schemaResult = avatarFileShapeSchema({
        name: file.name,
        size: file.size,
        type: file.type,
    });

    if ('summary' in schemaResult) {
        return [
            {
                field: 'general',
                message:
                    'Invalid file payload. Please choose a different image.',
            },
        ];
    }

    // Check file size (5MB max)
    if (file.size > AVATAR_MAX_SIZE) {
        errors.push({
            field: 'fileSize',
            message: `File size must be less than ${AVATAR_MAX_SIZE / 1024 / 1024}MB. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        });
    }

    // Check file type
    if (!AVATAR_ALLOWED_TYPES.includes(file.type as AvatarAllowedType)) {
        const allowedTypes = AVATAR_ALLOWED_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ');
        errors.push({
            field: 'fileType',
            message: `File type must be ${allowedTypes}. Current: ${file.type || 'unknown'}`,
        });
    }

    return errors;
}

export function validateAvatarDimensions(
    width: number,
    height: number,
): AvatarValidationError[] {
    const errors: AvatarValidationError[] = [];

    const schemaResult = imageDimensionsSchema({ width, height });

    if ('summary' in schemaResult) {
        return [
            {
                field: 'dimensions',
                message: 'Unable to inspect image dimensions.',
            },
        ];
    }

    if (width < AVATAR_MIN_DIMENSION || height < AVATAR_MIN_DIMENSION) {
        errors.push({
            field: 'dimensions',
            message: `Image must be at least ${AVATAR_MIN_DIMENSION}x${AVATAR_MIN_DIMENSION} pixels. Current: ${width}x${height}px`,
        });
    }

    if (width > AVATAR_MAX_DIMENSION || height > AVATAR_MAX_DIMENSION) {
        errors.push({
            field: 'dimensions',
            message: `Image must be at most ${AVATAR_MAX_DIMENSION}x${AVATAR_MAX_DIMENSION} pixels. Current: ${width}x${height}px`,
        });
    }

    return errors;
}

export async function validateAvatarImageSource(
    file: File,
): Promise<AvatarValidationError[]> {
    const objectUrl = URL.createObjectURL(file);

    try {
        const dimensions = await new Promise<{ width: number; height: number }>(
            (resolve, reject) => {
                const image = new Image();

                image.onload = () => {
                    resolve({ width: image.width, height: image.height });
                };

                image.onerror = () => {
                    reject(new Error('corrupted-image'));
                };

                image.src = objectUrl;
            },
        );

        return validateAvatarDimensions(dimensions.width, dimensions.height);
    } catch (_error) {
        return [
            {
                field: 'general',
                message:
                    'Failed to read image. The file may be corrupted or unsupported.',
            },
        ];
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export function getAvatarValidationErrorMessage(
    errors: AvatarValidationError[],
    field: AvatarValidationError['field'],
): string | undefined {
    return errors.find((error) => error.field === field)?.message;
}
