<?php

namespace Tests\Unit\Media;

use App\Services\Media\MediaService;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaServiceTest extends TestCase
{
    public function test_avatar_paths_use_deterministic_original_and_thumbnail_files(): void
    {
        $service = new class extends MediaService
        {
            public function pathsForUser(int $userId): array
            {
                return $this->avatarPaths($userId);
            }
        };

        $paths = $service->pathsForUser(7);

        $this->assertSame('users/7/avatar', $paths['directory']);
        $this->assertSame('users/7/avatar/original.webp', $paths['original']);
        $this->assertMatchesRegularExpression(
            '/^users\/7\/avatar\/thumbnail_[a-f0-9-]{36}\.webp$/',
            $paths['thumbnail'],
        );
    }

    public function test_it_returns_fallback_size_when_stored_file_size_lookup_fails(): void
    {
        $service = new class extends MediaService
        {
            public function resolveSize(string $disk, string $path, int $fallbackSize): int
            {
                return $this->resolveStoredFileSize($disk, $path, $fallbackSize);
            }
        };

        $resolvedSize = $service->resolveSize(
            disk: 'public',
            path: 'users/1/avatar/missing-file.webp',
            fallbackSize: 1024,
        );

        $this->assertSame(1024, $resolvedSize);
    }

    public function test_it_returns_actual_stored_size_when_file_exists(): void
    {
        Storage::disk('public')->put('users/1/avatar/existing-file.webp', 'abc123');

        $service = new class extends MediaService
        {
            public function resolveSize(string $disk, string $path, int $fallbackSize): int
            {
                return $this->resolveStoredFileSize($disk, $path, $fallbackSize);
            }
        };

        $resolvedSize = $service->resolveSize(
            disk: 'public',
            path: 'users/1/avatar/existing-file.webp',
            fallbackSize: 1024,
        );

        $this->assertSame(6, $resolvedSize);
    }
}
