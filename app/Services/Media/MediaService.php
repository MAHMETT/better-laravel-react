<?php

namespace App\Services\Media;

use App\Enums\MediaType;
use App\Models\Media;
use App\Services\Media\MediaUploadOptions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class MediaService
{
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

    public function upload(UploadedFile|array $files, int $userId, ?MediaUploadOptions $options = null): Media|array
    {
        $options ??= new MediaUploadOptions();

        if (is_array($files)) {
            return array_map(fn($file) => $this->uploadSingle($file, $userId, $options), $files);
        }

        return $this->uploadSingle($files, $userId, $options);
    }

    protected function uploadSingle(UploadedFile $file, int $userId, MediaUploadOptions $options): Media
    {
        $this->validateFile($file, $options);

        return DB::transaction(function () use ($file, $userId, $options) {
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->extension();
            $fileName = $this->generateSecureFileName($originalName, $extension);

            $directory = $options->directory ?? $this->defaultDirectory($file, $options->collection);
            $path = $file->storeAs($directory, $fileName, $options->disk);

            $metadata = $options->extraMetadata;
            $mime = $file->getMimeType();
            $type = MediaType::fromMime($mime);

            if ($type === MediaType::IMAGE) {
                $metadata = array_merge($metadata, $this->processImage($file, $path, $options));
            }

            return Media::create([
                'name' => $originalName,
                'path' => $path,
                'disk' => $options->disk,
                'type' => $mime,
                'extension' => $extension,
                'size' => $file->getSize(),
                'uploaded_by' => $userId,
                'collection' => $options->collection,
                'metadata' => $metadata,
            ]);
        });
    }

    protected function validateFile(UploadedFile $file, MediaUploadOptions $options): void
    {
        $allowed = $options->allowedMimes ?: $this->globalAllowedMimes;
        if (!in_array($file->getMimeType(), $allowed)) {
            throw new \InvalidArgumentException("File type not allowed: {$file->getMimeType()}");
        }

        $maxSize = $options->maxSize ?? $this->globalMaxSize;
        if ($file->getSize() > $maxSize) {
            throw new \InvalidArgumentException("File size exceeds maximum allowed (" . ($maxSize / 1024 / 1024) . "MB)");
        }
    }

    protected function generateSecureFileName(string $originalName, string $extension): string
    {
        $safeName = Str::slug($originalName) ?: 'file';
        return now()->timestamp . '_' . Str::uuid() . '_' . $safeName . '.' . $extension;
    }

    protected function defaultDirectory(UploadedFile $file, ?string $collection): string
    {
        $base = 'media/';
        if ($collection) {
            $base .= $collection . '/';
        }
        return $base . date('Y/m');
    }

    protected function processImage(UploadedFile $file, string $path, MediaUploadOptions $options): array
    {
        $metadata = [];
        $fullPath = Storage::disk($options->disk)->path($path);
        $image = Image::read($fullPath);

        $metadata['original_width'] = $image->width();
        $metadata['original_height'] = $image->height();

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
            $thumbDir = dirname($fullPath) . '/thumbnails';
            if (!is_dir($thumbDir)) {
                mkdir($thumbDir, 0755, true);
            }
            $thumbPath = $thumbDir . '/' . basename($path);
            $thumb = Image::read($fullPath)->cover($thumbWidth, $thumbHeight);
            $thumb->save($thumbPath);
            $metadata['thumbnail_path'] = str_replace(Storage::disk($options->disk)->path(''), '', $thumbPath);
        }

        return $metadata;
    }

    public function delete(Media|string $media): bool
    {
        $media = $this->resolveMedia($media);
        if (!$media) {
            return false;
        }

        DB::transaction(function () use ($media) {
            Storage::disk($media->disk)->delete($media->path);

            if (!empty($media->metadata['thumbnail_path'])) {
                Storage::disk($media->disk)->delete($media->metadata['thumbnail_path']);
            }

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
        if ($signed) {
            return Storage::disk($media->disk)->temporaryUrl($media->path, $expiration ?? now()->addHours(24));
        }
        return Storage::disk($media->disk)->url($media->path);
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
}