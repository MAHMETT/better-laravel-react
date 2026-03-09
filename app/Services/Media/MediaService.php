<?php

namespace App\Services\Media;

use App\Enums\MediaType;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use Throwable;

class MediaService
{
    protected const AVATAR_DISK = 'public';

    protected const AVATAR_DIRECTORY_TEMPLATE = 'users/%d/avatar';

    protected const AVATAR_ORIGINAL_FILENAME = 'original.webp';

    protected const AVATAR_THUMBNAIL_PREFIX = 'thumbnail_';

    protected const AVATAR_THUMBNAIL_WIDTH = 200;

    protected const AVATAR_THUMBNAIL_HEIGHT = 200;

    protected const AVATAR_ORIGINAL_QUALITY = 90;

    protected const AVATAR_THUMBNAIL_QUALITY = 80;

    protected const AVATAR_ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    protected const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

    protected array $globalAllowedMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-rar-compressed',
        'video/mp4',
        'video/mpeg',
        'audio/mpeg',
        'audio/wav',
    ];

    protected int $globalMaxSize = 10 * 1024 * 1024;

    protected ?string $convertFormat;

    public function __construct()
    {
        $this->convertFormat = config('app.convert_image') ?? env('CONVERT_IMAGE', 'none');
        $this->convertFormat = $this->convertFormat === 'none' ? null : $this->convertFormat;
    }

    public function upload(UploadedFile|array $files, int $userId, ?MediaUploadOptions $options = null): Media|array
    {
        $options ??= new MediaUploadOptions;

        if (is_array($files)) {
            return array_map(fn ($file) => $this->uploadSingle($file, $userId, $options), $files);
        }

        return $this->uploadSingle($files, $userId, $options);
    }

    /**
     * Upload a new file or replace an existing media file.
     * When replacing, deletes the old file and creates a new media record.
     */
    public function uploadOrUpdate(UploadedFile $file, int $userId, ?Media $existingMedia, ?MediaUploadOptions $options = null): Media
    {
        $options ??= new MediaUploadOptions;

        return DB::transaction(function () use ($file, $userId, $existingMedia, $options) {
            if ($existingMedia) {
                $this->deleteMediaFiles($existingMedia);
            }

            return $this->uploadSingle($file, $userId, $options);
        });
    }

    /**
     * Replace a user's avatar with deterministic original and thumbnail paths.
     * Ensures a single active avatar media record and removes stale avatar files.
     */
    public function replaceUserAvatar(User $user, UploadedFile $file): Media
    {
        $avatarOptions = new MediaUploadOptions(
            disk: self::AVATAR_DISK,
            collection: 'avatars',
            allowedMimes: self::AVATAR_ALLOWED_MIME_TYPES,
            maxSize: self::AVATAR_MAX_SIZE,
        );

        $this->validateFile($file, $avatarOptions);

        return DB::transaction(function () use ($file, $user) {
            /** @var User $lockedUser */
            $lockedUser = User::query()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $existingAvatarMedia = $lockedUser->avatar
                ? Media::query()->whereKey($lockedUser->avatar)->lockForUpdate()->first()
                : null;

            $oldOriginalPath = $existingAvatarMedia?->path;
            $oldThumbnailPath = $this->extractThumbnailPath($existingAvatarMedia);

            $storedAvatar = $this->storeAvatarVariants($file, $lockedUser->id);

            if ($existingAvatarMedia) {
                $existingAvatarMedia->fill([
                    'name' => $storedAvatar['name'],
                    'path' => $storedAvatar['path'],
                    'disk' => self::AVATAR_DISK,
                    'type' => $storedAvatar['type'],
                    'extension' => $storedAvatar['extension'],
                    'size' => $storedAvatar['size'],
                    'uploaded_by' => $lockedUser->id,
                    'collection' => 'avatars',
                    'metadata' => $storedAvatar['metadata'],
                ])->save();

                $avatarMedia = $existingAvatarMedia;
            } else {
                $avatarMedia = Media::create([
                    'name' => $storedAvatar['name'],
                    'path' => $storedAvatar['path'],
                    'disk' => self::AVATAR_DISK,
                    'type' => $storedAvatar['type'],
                    'extension' => $storedAvatar['extension'],
                    'size' => $storedAvatar['size'],
                    'uploaded_by' => $lockedUser->id,
                    'collection' => 'avatars',
                    'metadata' => $storedAvatar['metadata'],
                ]);
            }

            $lockedUser->avatar = $avatarMedia->id;
            $lockedUser->save();

            $this->deleteOldAvatarPathsIfChanged(
                oldOriginalPath: $oldOriginalPath,
                oldThumbnailPath: $oldThumbnailPath,
                newOriginalPath: $storedAvatar['path'],
                newThumbnailPath: $storedAvatar['metadata']['thumbnail_path'],
            );

            $this->deleteOrphanAvatarMedia(
                userId: $lockedUser->id,
                keepMediaId: $avatarMedia->id,
            );

            return $avatarMedia;
        });
    }

    /**
     * Delete a user's avatar media and all stale avatar files.
     */
    public function deleteUserAvatar(User $user): void
    {
        DB::transaction(function () use ($user) {
            /** @var User $lockedUser */
            $lockedUser = User::withTrashed()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedUser) {
                return;
            }

            $avatarMedia = Media::query()
                ->where('uploaded_by', $lockedUser->id)
                ->where('collection', 'avatars')
                ->get();

            foreach ($avatarMedia as $media) {
                $this->deleteMediaFiles($media);
                $media->delete();
            }

            if ($lockedUser->avatar !== null) {
                $lockedUser->avatar = null;
                $lockedUser->saveQuietly();
            }
        });
    }

    protected function uploadSingle(UploadedFile $file, int $userId, MediaUploadOptions $options): Media
    {
        $this->validateFile($file, $options);

        return DB::transaction(function () use ($file, $userId, $options) {
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $options->convertFormat ?? $file->extension();
            $fileName = $this->generateAvatarFileName($extension);

            $directory = $options->directory ?? $this->avatarDirectory($userId, $options);
            $path = $file->storeAs($directory, $fileName, $options->disk);

            $metadata = $options->extraMetadata;
            $mime = $file->getMimeType();
            $type = MediaType::fromMime($mime);
            $fileSize = $file->getSize();

            if ($type === MediaType::IMAGE) {
                $imageProcessingResult = $this->processImage($file, $path, $options);
                $metadata = array_merge($metadata, $imageProcessingResult);

                // Handle format conversion
                if ($options->convertFormat || $this->convertFormat) {
                    $targetFormat = $options->convertFormat ?? $this->convertFormat;
                    $conversionResult = $this->convertImageFormat($path, $targetFormat, $options);
                    $metadata = array_merge($metadata, $conversionResult);
                    // Update path to converted path
                    if (isset($conversionResult['converted_path'])) {
                        $path = $conversionResult['converted_path'];
                        $fileSize = $this->resolveStoredFileSize(
                            disk: $options->disk,
                            path: $path,
                            fallbackSize: $fileSize,
                        );
                    }
                    // Update MIME type and extension based on conversion
                    if (isset($conversionResult['converted_to'])) {
                        $mime = $this->getMimeTypeFromFormat($conversionResult['converted_to']);
                        $extension = $conversionResult['converted_to'];
                    }
                }
            }

            return Media::create([
                'name' => $originalName,
                'path' => $path,
                'disk' => $options->disk,
                'type' => $mime,
                'extension' => $extension,
                'size' => $fileSize,
                'uploaded_by' => $userId,
                'collection' => $options->collection,
                'metadata' => $metadata,
            ]);
        });
    }

    protected function validateFile(UploadedFile $file, MediaUploadOptions $options): void
    {
        $allowed = $options->allowedMimes ?: $this->globalAllowedMimes;
        if (! in_array($file->getMimeType(), $allowed)) {
            $allowedTypes = implode(', ', array_map(fn ($type) => strtoupper(str_replace('image/', '', $type)), $allowed));
            throw new \InvalidArgumentException("File type not allowed: {$file->getMimeType()}. Allowed types: {$allowedTypes}");
        }

        $maxSize = $options->maxSize ?? $this->globalMaxSize;
        if ($file->getSize() > $maxSize) {
            $maxSizeMB = $maxSize / 1024 / 1024;
            $currentSizeMB = $file->getSize() / 1024 / 1024;
            throw new \InvalidArgumentException("File size exceeds maximum allowed ({$maxSizeMB}MB). Current: {$currentSizeMB}MB");
        }

        // For avatar uploads, validate image dimensions
        if ($options->collection === 'avatars' && str_starts_with($file->getMimeType(), 'image/')) {
            $imageSize = getimagesize($file->getRealPath());

            if ($imageSize === false) {
                throw new \InvalidArgumentException('Unable to read image dimensions. File may be corrupted.');
            }

            $width = $imageSize[0];
            $height = $imageSize[1];

            $minDimension = 100;
            $maxDimension = 4096;

            if ($width < $minDimension || $height < $minDimension) {
                throw new \InvalidArgumentException("Image dimensions too small: {$width}x{$height}px. Minimum required: {$minDimension}x{$minDimension}px");
            }

            if ($width > $maxDimension || $height > $maxDimension) {
                throw new \InvalidArgumentException("Image dimensions too large: {$width}x{$height}px. Maximum allowed: {$maxDimension}x{$maxDimension}px");
            }
        }
    }

    protected function generateSecureFileName(string $originalName, string $extension): string
    {
        $safeName = Str::slug($originalName) ?: 'file';

        return now()->timestamp.'_'.Str::uuid().'_'.$safeName.'.'.$extension;
    }

    protected function generateAvatarFileName(string $extension): string
    {
        return 'avatar_'.Str::uuid()->toString().'.'.$extension;
    }

    /**
     * @return array{directory: string, original: string, thumbnail: string}
     */
    protected function avatarPaths(int $userId, ?string $thumbnailFileName = null): array
    {
        $directory = sprintf(self::AVATAR_DIRECTORY_TEMPLATE, $userId);
        $thumbnailFileName ??= self::AVATAR_THUMBNAIL_PREFIX.Str::uuid()->toString().'.webp';

        return [
            'directory' => trim($directory, '/'),
            'original' => trim($directory, '/').'/'.self::AVATAR_ORIGINAL_FILENAME,
            'thumbnail' => trim($directory, '/').'/'.$thumbnailFileName,
        ];
    }

    protected function avatarDirectory(int $userId, MediaUploadOptions $options): string
    {
        if ($options->directory) {
            return $options->directory;
        }

        $base = 'users/'.$userId.'/avatar/';

        if ($options->generateThumbnail) {
            return $base;
        }

        return $base;
    }

    protected function defaultDirectory(UploadedFile $file, ?string $collection): string
    {
        $base = 'media/';
        if ($collection) {
            $base .= $collection.'/';
        }

        return $base.date('Y/m');
    }

    protected function processImage(UploadedFile $file, string $path, MediaUploadOptions $options): array
    {
        $metadata = [];
        $fullPath = Storage::disk($options->disk)->path($path);
        $image = Image::read($fullPath);

        $metadata['original_width'] = $image->width();
        $metadata['original_height'] = $image->height();
        $metadata['original_format'] = $file->extension();

        if ($options->optimizeImage) {
            $image->save($fullPath, 80);
        }

        if ($options->resizeDimensions) {
            [$width, $height, $method] = array_pad($options->resizeDimensions, 3, 'fit');
            $method === 'fit' ? $image->cover($width, $height) : $image->resize($width, $height);
            $image->save($fullPath);
        }

        if ($options->generateThumbnail) {
            [$thumbWidth, $thumbHeight] = $options->thumbnailDimensions;
            $thumbPath = str_replace(basename($path), 'thumbnail_'.basename($path), $path);
            $thumbFullPath = Storage::disk($options->disk)->path($thumbPath);
            $thumb = Image::read($fullPath)->cover($thumbWidth, $thumbHeight);
            $thumb->save($thumbFullPath);
            $metadata['thumbnail_path'] = $thumbPath;
        }

        return $metadata;
    }

    /**
     * Convert image to a different format (webp, avif, jpg, png, etc.).
     * Deletes the original file and returns updated path and metadata.
     */
    protected function convertImageFormat(string $path, string $targetFormat, MediaUploadOptions $options): array
    {
        $metadata = [];
        $fullPath = Storage::disk($options->disk)->path($path);
        $image = Image::read($fullPath);

        // Get new extension
        $newExtension = strtolower($targetFormat);
        $newMimeType = $this->getMimeTypeFromFormat($newExtension);

        // Generate new file path with new extension
        $originalPathInfo = pathinfo($path);
        $newPath = $originalPathInfo['dirname'].'/'.$originalPathInfo['filename'].'.'.$newExtension;
        $newFullPath = Storage::disk($options->disk)->path($newPath);

        // Save in new format
        $image->save($newFullPath);

        // Delete original file if different
        if ($fullPath !== $newFullPath) {
            Storage::disk($options->disk)->delete($path);

            // Update thumbnail path if exists
            if (! empty($metadata['thumbnail_path'])) {
                $oldThumbPath = $metadata['thumbnail_path'];
                $newThumbPath = dirname($oldThumbPath).'/'.pathinfo($newPath, PATHINFO_FILENAME).'.'.pathinfo($oldThumbPath, PATHINFO_EXTENSION);
                $metadata['thumbnail_path'] = $newThumbPath;
            }
        }

        $metadata['converted_from'] = $originalPathInfo['extension'];
        $metadata['converted_to'] = $newExtension;
        $metadata['converted_path'] = $newPath;

        return $metadata;
    }

    /**
     * Get MIME type from format extension.
     */
    protected function getMimeTypeFromFormat(string $extension): string
    {
        return match (strtolower($extension)) {
            'webp' => 'image/webp',
            'avif' => 'image/avif',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'bmp' => 'image/bmp',
            default => 'image/jpeg',
        };
    }

    /**
     * @return array{
     *     name: string,
     *     path: string,
     *     type: string,
     *     extension: string,
     *     size: int,
     *     metadata: array{
     *         original_width: int,
     *         original_height: int,
     *         original_format: string,
     *         thumbnail_path: string,
     *         thumbnail_width: int,
     *         thumbnail_height: int,
     *         thumbnail_size: int
     *     }
     * }
     */
    protected function storeAvatarVariants(UploadedFile $file, int $userId): array
    {
        $paths = $this->avatarPaths($userId);
        $disk = Storage::disk(self::AVATAR_DISK);
        $disk->makeDirectory($paths['directory']);

        try {
            $originalImage = Image::read($file->getRealPath());
        } catch (Throwable $exception) {
            throw new \RuntimeException('The uploaded avatar image is corrupted or unreadable.', previous: $exception);
        }

        $originalWidth = $originalImage->width();
        $originalHeight = $originalImage->height();

        $originalFullPath = $disk->path($paths['original']);
        $thumbnailFullPath = $disk->path($paths['thumbnail']);

        $originalImage->save($originalFullPath, self::AVATAR_ORIGINAL_QUALITY);

        $thumbnailImage = Image::read($file->getRealPath())->cover(
            self::AVATAR_THUMBNAIL_WIDTH,
            self::AVATAR_THUMBNAIL_HEIGHT,
        );
        $thumbnailImage->save($thumbnailFullPath, self::AVATAR_THUMBNAIL_QUALITY);

        try {
            $disk->setVisibility($paths['original'], 'public');
            $disk->setVisibility($paths['thumbnail'], 'public');
        } catch (Throwable) {
            // Some drivers may not support explicit visibility updates.
        }

        $fallbackOriginalSize = max(0, (int) ($file->getSize() ?? 0));
        $originalSize = $this->resolveStoredFileSize(
            disk: self::AVATAR_DISK,
            path: $paths['original'],
            fallbackSize: $fallbackOriginalSize,
        );
        $thumbnailSize = $this->resolveStoredFileSize(
            disk: self::AVATAR_DISK,
            path: $paths['thumbnail'],
            fallbackSize: 0,
        );

        return [
            'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'path' => $paths['original'],
            'type' => 'image/webp',
            'extension' => 'webp',
            'size' => $originalSize,
            'metadata' => [
                'original_width' => $originalWidth,
                'original_height' => $originalHeight,
                'original_format' => strtolower($file->extension()),
                'thumbnail_path' => $paths['thumbnail'],
                'thumbnail_width' => self::AVATAR_THUMBNAIL_WIDTH,
                'thumbnail_height' => self::AVATAR_THUMBNAIL_HEIGHT,
                'thumbnail_size' => $thumbnailSize,
            ],
        ];
    }

    protected function resolveStoredFileSize(string $disk, string $path, int $fallbackSize): int
    {
        try {
            $storedSize = Storage::disk($this->resolveDiskName($disk))->size($path);

            return is_int($storedSize) && $storedSize > 0 ? $storedSize : $fallbackSize;
        } catch (Throwable) {
            return $fallbackSize;
        }
    }

    protected function extractThumbnailPath(?Media $media): ?string
    {
        if (! $media || ! is_array($media->metadata)) {
            return null;
        }

        $thumbnailPath = $media->metadata['thumbnail_path'] ?? null;

        return is_string($thumbnailPath) && $thumbnailPath !== ''
            ? $thumbnailPath
            : null;
    }

    protected function deleteOldAvatarPathsIfChanged(
        ?string $oldOriginalPath,
        ?string $oldThumbnailPath,
        string $newOriginalPath,
        string $newThumbnailPath,
    ): void {
        $disk = Storage::disk(self::AVATAR_DISK);

        if (
            is_string($oldOriginalPath) &&
            $oldOriginalPath !== '' &&
            $oldOriginalPath !== $newOriginalPath &&
            $oldOriginalPath !== $newThumbnailPath
        ) {
            $disk->delete($oldOriginalPath);
        }

        if (
            is_string($oldThumbnailPath) &&
            $oldThumbnailPath !== '' &&
            $oldThumbnailPath !== $newOriginalPath &&
            $oldThumbnailPath !== $newThumbnailPath
        ) {
            $disk->delete($oldThumbnailPath);
        }
    }

    protected function deleteOrphanAvatarMedia(int $userId, string $keepMediaId): void
    {
        $orphanMedia = Media::query()
            ->where('uploaded_by', $userId)
            ->where('collection', 'avatars')
            ->where('id', '!=', $keepMediaId)
            ->get();

        foreach ($orphanMedia as $media) {
            $this->deleteMediaFiles($media);
            $media->delete();
        }
    }

    /**
     * Delete media files (image and thumbnail) from storage.
     */
    protected function deleteMediaFiles(Media $media): void
    {
        try {
            Storage::disk($this->resolveDiskName($media->disk))->delete($media->path);
        } catch (Throwable) {
            // File may already be deleted; ignore to keep deletion idempotent.
        }

        if (is_array($media->metadata) && ! empty($media->metadata['thumbnail_path'])) {
            try {
                Storage::disk($this->resolveDiskName($media->disk))->delete($media->metadata['thumbnail_path']);
            } catch (Throwable) {
                // File may already be deleted; ignore to keep deletion idempotent.
            }
        }
    }

    public function delete(Media|string $media): bool
    {
        $media = $this->resolveMedia($media);
        if (! $media) {
            return false;
        }

        DB::transaction(function () use ($media) {
            $this->deleteMediaFiles($media);
            $media->delete();
        });

        return true;
    }

    public function bulkDelete(array $ids): int
    {
        $count = 0;
        foreach ($ids as $id) {
            if ($this->delete($id)) {
                $count++;
            }
        }

        return $count;
    }

    public function getUrl(Media $media, bool $signed = false, ?\DateTimeInterface $expiration = null): string
    {
        $disk = $this->resolveDiskName($media->disk);

        if ($signed) {
            return Storage::disk($disk)->temporaryUrl($media->path, $expiration ?? now()->addHours(24));
        }

        return Storage::disk($disk)->url($media->path);
    }

    public function update(Media $media, array $data): Media
    {
        $fillable = ['name', 'alt', 'title', 'collection', 'metadata'];
        $updateData = array_intersect_key($data, array_flip($fillable));
        $media->update($updateData);

        return $media;
    }

    public function find(string $uuid): ?Media
    {
        return Media::whereUuid($uuid)->first();
    }

    public function getByUser(int $userId, ?string $collection = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Media::where('uploaded_by', $userId);
        if ($collection) {
            $query->where('collection', $collection);
        }

        return $query->latest()->get();
    }

    public function getByCollection(string $collection): \Illuminate\Database\Eloquent\Collection
    {
        return Media::where('collection', $collection)->latest()->get();
    }

    protected function resolveMedia(Media|string $media): ?Media
    {
        return is_string($media) ? $this->find($media) : $media;
    }

    protected function resolveDiskName(string $disk): string
    {
        if (config()->has("filesystems.disks.{$disk}")) {
            return $disk;
        }

        return $disk === 'private' ? 'local' : $disk;
    }
}
