<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\Media\MediaService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class UserAvatarService
{
    public function __construct(
        protected MediaService $mediaService
    ) {}

    /**
     * Upload avatar for a user.
     * Delegates to MediaService for actual file handling.
     */
    public function uploadAvatar(User $user, UploadedFile $file): void
    {
        $this->mediaService->replaceUserAvatar($user, $file);
    }

    /**
     * Replace existing avatar with a new one.
     * Delegates to MediaService for actual file handling.
     */
    public function replaceAvatar(User $user, UploadedFile $file): void
    {
        $this->mediaService->replaceUserAvatar($user, $file);
    }

    /**
     * Delete user's avatar.
     * Handles both the media record and the physical files.
     */
    public function deleteAvatar(User $user): void
    {
        if (! $user->avatar) {
            return;
        }

        $this->mediaService->deleteUserAvatar($user);
    }

    /**
     * Validate avatar file before upload.
     *
     * @throws \InvalidArgumentException
     */
    public function validate(UploadedFile $file): void
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        $minSize = 10;

        $mimeType = $file->getMimeType();
        $size = $file->getSize();

        if (! in_array($mimeType, $allowedMimes)) {
            throw new \InvalidArgumentException(
                "Invalid file type: {$mimeType}. Allowed types: ".implode(', ', $allowedMimes)
            );
        }

        if ($size > $maxSize) {
            throw new \InvalidArgumentException(
                'File size exceeds maximum allowed (5MB). Current: '.round($size / 1024 / 1024, 2).'MB'
            );
        }

        if ($size < $minSize) {
            throw new \InvalidArgumentException(
                "File size is too small. Minimum: {$minSize} bytes"
            );
        }

        // Validate image dimensions
        if (str_starts_with($mimeType, 'image/')) {
            $imageSize = getimagesize($file->getRealPath());

            if ($imageSize === false) {
                throw new \InvalidArgumentException('Unable to read image dimensions. File may be corrupted.');
            }

            $width = $imageSize[0];
            $height = $imageSize[1];

            $minDimension = 100;
            $maxDimension = 4096;

            if ($width < $minDimension || $height < $minDimension) {
                throw new \InvalidArgumentException(
                    "Image dimensions too small: {$width}x{$height}px. Minimum required: {$minDimension}x{$minDimension}px"
                );
            }

            if ($width > $maxDimension || $height > $maxDimension) {
                throw new \InvalidArgumentException(
                    "Image dimensions too large: {$width}x{$height}px. Maximum allowed: {$maxDimension}x{$maxDimension}px"
                );
            }
        }
    }

    /**
     * Log avatar upload error.
     */
    public function logError(User $user, \Throwable $exception): void
    {
        Log::error('Avatar operation failed', [
            'user_id' => $user->id,
            'exception' => [
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
                'type' => get_class($exception),
            ],
        ]);
    }
}
