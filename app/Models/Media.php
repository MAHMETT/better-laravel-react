<?php

namespace App\Models;

use App\Concerns\HasUUID;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory, HasUUID;

    protected $fillable = [
        'name',
        'path',
        'disk',
        'type',
        'extension',
        'size',
        'uploaded_by',
        'collection',
        'metadata',
        'alt',
        'title',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the user who uploaded this media.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the URL for the media file.
     */
    public function getUrl(bool $thumbnail = false): string
    {
        $path = $thumbnail ? $this->getThumbnailPath() ?? $this->path : $this->path;

        return Storage::disk($this->resolvedDiskName())->url($path);
    }

    /**
     * Get the original file URL.
     */
    public function getOriginalUrl(): string
    {
        return $this->getUrl();
    }

    /**
     * Get the thumbnail URL, falling back to original when missing.
     */
    public function getThumbnailUrl(): string
    {
        return $this->getUrl(thumbnail: true);
    }

    /**
     * Get thumbnail path from metadata when available.
     */
    public function getThumbnailPath(): ?string
    {
        if (! is_array($this->metadata)) {
            return null;
        }

        $thumbnailPath = $this->metadata['thumbnail_path'] ?? null;

        return is_string($thumbnailPath) && $thumbnailPath !== ''
            ? $thumbnailPath
            : null;
    }

    protected function resolvedDiskName(): string
    {
        if (config()->has("filesystems.disks.{$this->disk}")) {
            return $this->disk;
        }

        return $this->disk === 'private' ? 'local' : $this->disk;
    }
}
