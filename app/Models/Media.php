<?php

namespace App\Models;

use App\Concerns\HasUUID;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasUUID;

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
        return $this->belongsTo(User::class);
    }

    /**
     * Get the URL for the media file.
     */
    public function getUrl(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
