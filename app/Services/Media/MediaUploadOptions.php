<?php

namespace App\Services\Media;

class MediaUploadOptions
{
    public function __construct(
        public string $disk = 'public',
        public ?string $directory = null,
        public array $allowedMimes = [],
        public ?int $maxSize = null, // dalam bytes, null berarti pake default global
        public bool $optimizeImage = true,
        public ?array $resizeDimensions = null, // [width, height, method: 'fit'|'resize']
        public bool $generateThumbnail = false,
        public ?array $thumbnailDimensions = [200, 200],
        public ?string $collection = null,
        public array $extraMetadata = [],
    ) {
    }
}