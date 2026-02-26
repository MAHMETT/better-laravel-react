<?php

namespace App\Enums;

enum MediaType: string
{
    case IMAGE = 'image';
    case VIDEO = 'video';
    case AUDIO = 'audio';
    case DOCUMENT = 'document';
    case ARCHIVE = 'archive';
    case OTHER = 'other';

    public static function fromMime(string $mime): self
    {
        return match (true) {
            str_starts_with($mime, 'image/') => self::IMAGE,
            str_starts_with($mime, 'video/') => self::VIDEO,
            str_starts_with($mime, 'audio/') => self::AUDIO,
            str_ends_with($mime, 'pdf') => self::DOCUMENT,
            str_contains($mime, 'word'), str_contains($mime, 'document') => self::DOCUMENT,
            str_contains($mime, 'spreadsheet'), str_contains($mime, 'excel') => self::DOCUMENT,
            str_contains($mime, 'presentation'), str_contains($mime, 'powerpoint') => self::DOCUMENT,
            in_array($mime, ['application/zip', 'application/x-rar-compressed', 'application/x-tar']) => self::ARCHIVE,
            default => self::OTHER,
        };
    }
}
