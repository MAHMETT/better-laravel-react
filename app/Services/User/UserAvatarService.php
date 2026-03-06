<?php

namespace App\Services\User;

use App\Models\Media;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UserAvatarService
{
    /**
     * Delete user's avatar from database and storage.
     * Handles both the media record and the physical files.
     */
    public function deleteAvatar(User $user): void
    {
        if (! $user->avatar) {
            return;
        }

        $media = $user->avatarMedia;

        if (! $media) {
            // Clear the avatar reference from user if media doesn't exist
            $user->avatar = null;
            $user->saveQuietly();

            return;
        }

        // Store disk and path info before deleting media record
        $disk = $media->disk;
        $path = $media->path;
        $thumbnailPath = $media->getThumbnailPath();

        // Delete the media record from database
        $media->delete();

        // Clear the avatar reference from user
        $user->avatar = null;
        $user->saveQuietly();

        // Delete physical files
        $this->deleteAvatarFiles($disk, $path, $thumbnailPath);
    }

    /**
     * Delete avatar files from storage.
     * Handles both original and thumbnail files.
     */
    protected function deleteAvatarFiles(string $disk, string $path, ?string $thumbnailPath): void
    {
        $storage = Storage::disk($disk);

        try {
            // Delete original file
            if ($storage->exists($path)) {
                $storage->delete($path);
            }

            // Delete thumbnail file if exists
            if ($thumbnailPath && $storage->exists($thumbnailPath)) {
                $storage->delete($thumbnailPath);
            }
        } catch (\Exception $e) {
            // Log error but don't fail the operation
            Log::warning('Failed to delete avatar files', [
                'disk' => $disk,
                'path' => $path,
                'thumbnail_path' => $thumbnailPath,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
