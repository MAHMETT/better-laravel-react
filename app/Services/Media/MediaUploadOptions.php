<?php

namespace App\Services\Media;

class MediaUploadOptions
{
    public function __construct(
        public string $disk = 'public',
        public ?string $directory = null,
        public array $allowedMimes = [],
        public ?int $maxSize = null,
        public bool $optimizeImage = true,
        public ?array $resizeDimensions = null,
        public bool $generateThumbnail = false,
        public ?array $thumbnailDimensions = [200, 200],
        public ?string $collection = null,
        public array $extraMetadata = [],
        public ?string $convertFormat = null,
    ) {}
}
