<?php

namespace Tests\Unit\Models;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaTest extends TestCase
{
    public function test_thumbnail_url_is_used_when_thumbnail_path_exists(): void
    {
        Storage::disk('public')->put('users/3/avatar/original.webp', 'original');
        Storage::disk('public')->put('users/3/avatar/thumbnail.webp', 'thumb');

        $media = new Media([
            'path' => 'users/3/avatar/original.webp',
            'disk' => 'public',
            'metadata' => [
                'thumbnail_path' => 'users/3/avatar/thumbnail.webp',
            ],
        ]);

        $this->assertStringContainsString('/storage/users/3/avatar/thumbnail.webp', $media->getThumbnailUrl());
    }

    public function test_thumbnail_url_falls_back_to_original_when_thumbnail_path_missing(): void
    {
        Storage::disk('public')->put('users/4/avatar/original.webp', 'original');

        $media = new Media([
            'path' => 'users/4/avatar/original.webp',
            'disk' => 'public',
            'metadata' => [],
        ]);

        $this->assertStringContainsString('/storage/users/4/avatar/original.webp', $media->getThumbnailUrl());
    }
}
