# MediaService Documentation

## Overview

`MediaService` is a powerful and flexible service for handling file uploads, management, and retrieval in Laravel applications. It supports images, documents, videos, and more, with features like automatic image optimization, thumbnail generation, and grouping via collections. Built with clean architecture and type safety, it integrates seamlessly with Laravel’s storage system and provides a rich set of methods for common media operations.

## Prerequisites

- Laravel 10.x or 11.x
- PHP 8.2+
- [Intervention Image](https://image.intervention.io/v3) for image processing (optional but recommended)
- The `Media` model with the following fields (via migration): `uuid`, `name`, `path`, `disk`, `type`, `extension`, `size`, `uploaded_by`, `collection`, `metadata`, `alt`, `title`
- The `MediaType` enum and `MediaUploadOptions` class (provided below)

## Installation

1. Run the migration to add required columns to your `media` table.
2. Create the `MediaType` enum and `MediaUploadOptions` class as shown in the codebase.
3. Publish or create the `MediaService` class in `App\Services`.
4. Install Intervention Image if you need image processing:
    ```bash
    composer require intervention/image-laravel
    ```

## Core Classes

### MediaType Enum

Defines the type of media based on MIME type. Used internally for categorization.

### MediaUploadOptions

A DTO to configure upload behavior per request.

| Property              | Type   | Default     | Description                                             |
| --------------------- | ------ | ----------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `disk`                | string | `'public'`  | Storage disk to use.                                    |
| `directory`           | string | null        | `null`                                                  | Custom directory path. If null, auto-generated as `media/{collection}/Y/m`. |
| `allowedMimes`        | array  | `[]`        | Allowed MIME types. If empty, global list is used.      |
| `maxSize`             | int    | null        | `null`                                                  | Max file size in bytes. If null, global 10MB is used.                       |
| `optimizeImage`       | bool   | `true`      | Compress image to 80% quality.                          |
| `resizeDimensions`    | array  | null        | `null`                                                  | Example: `[1200, 800, 'fit']` where third param is `'fit'` or `'resize'`.   |
| `generateThumbnail`   | bool   | `false`     | Whether to create a thumbnail.                          |
| `thumbnailDimensions` | array  | `[200,200]` | Width and height for thumbnail.                         |
| `collection`          | string | null        | `null`                                                  | Group name for the media (e.g., 'avatars', 'posts').                        |
| `extraMetadata`       | array  | `[]`        | Additional data to store in the `metadata` JSON column. |

## Public Methods

### `upload(UploadedFile|array $files, int $userId, ?MediaUploadOptions $options = null): Media|array`

Uploads one or multiple files.

**Parameters:**

- `$files`: A single `UploadedFile` instance or an array of them.
- `$userId`: ID of the uploading user.
- `$options`: Optional configuration.

**Returns:**

- Single `Media` model for a single file.
- Array of `Media` models for multiple files.

**Example:**

```php
use App\Services\MediaService;
use App\Services\Media\MediaUploadOptions;

$service = app(MediaService::class);

// Single file with custom options
$options = new MediaUploadOptions(
    collection: 'post-images',
    generateThumbnail: true,
    resizeDimensions: [1200, 800, 'fit']
);
$media = $service->upload($request->file('image'), auth()->id(), $options);

// Multiple files (default options)
$mediaArray = $service->upload($request->file('images'), auth()->id());
```

### `delete(Media|string $media): bool`

Deletes a media file and its database record. Also removes any generated thumbnail.

**Parameters:**

- `$media`: Either a `Media` model instance or its UUID string.

**Returns:** `true` on success, `false` if media not found.

**Example:**

```php
$service->delete($media);          // by model
$service->delete('uuid-here');     // by UUID
```

### `bulkDelete(array $ids): int`

Deletes multiple media items by UUIDs or model instances.

**Parameters:**

- `$ids`: Array of UUID strings or `Media` models.

**Returns:** Number of successfully deleted items.

**Example:**

```php
$deletedCount = $service->bulkDelete(['uuid1', 'uuid2']);
```

### `getUrl(Media $media, bool $signed = false, ?DateTimeInterface $expiration = null): string`

Returns the public URL of the media file.

**Parameters:**

- `$media`: The media model.
- `$signed`: If `true`, generates a temporary signed URL.
- `$expiration`: Expiration time for signed URL (default 24 hours).

**Returns:** URL string.

**Example:**

```php
$url = $service->getUrl($media);                         // public
$tempUrl = $service->getUrl($media, true, now()->addHours(1)); // signed, 1 hour
```

### `update(Media $media, array $data): Media`

Updates media metadata. Allowed fields: `name`, `alt`, `title`, `collection`, `metadata`.

**Parameters:**

- `$media`: The media model.
- `$data`: Associative array with fields to update.

**Returns:** Updated media model.

**Example:**

```php
$media = $service->update($media, [
    'alt' => 'New alt text',
    'title' => 'New title'
]);
```

### `find(string $uuid): ?Media`

Finds a media record by UUID.

**Parameters:**

- `$uuid`: The media UUID.

**Returns:** Media model or `null`.

**Example:**

```php
$media = $service->find('some-uuid');
```

### `getByUser(int $userId, ?string $collection = null): Collection`

Retrieves all media uploaded by a specific user, optionally filtered by collection.

**Parameters:**

- `$userId`: User ID.
- `$collection`: Collection name to filter.

**Returns:** Collection of Media models, latest first.

**Example:**

```php
$allUserMedia = $service->getByUser(1);
$postImages = $service->getByUser(1, 'post-images');
```

### `getByCollection(string $collection): Collection`

Retrieves all media belonging to a collection (across all users).

**Parameters:**

- `$collection`: Collection name.

**Returns:** Collection of Media models, latest first.

**Example:**

```php
$banners = $service->getByCollection('banners');
```

## Error Handling

The service throws `InvalidArgumentException` for validation failures (unsupported file type, file too large). Always wrap calls in try-catch blocks when user input is involved:

```php
use Illuminate\Http\UploadedFile;
use InvalidArgumentException;

try {
    $media = $service->upload($file, auth()->id());
} catch (InvalidArgumentException $e) {
    return back()->withErrors(['file' => $e->getMessage()]);
}
```

## Common Usage Examples

### Upload an avatar with thumbnail

```php
$options = new MediaUploadOptions(
    collection: 'avatars',
    generateThumbnail: true,
    thumbnailDimensions: [100, 100],
    resizeDimensions: [400, 400, 'fit']
);
$media = $service->upload($request->file('avatar'), auth()->id(), $options);
```

### Upload multiple documents without image processing

```php
$options = new MediaUploadOptions(
    allowedMimes: ['application/pdf', 'application/msword'],
    maxSize: 20 * 1024 * 1024, // 20MB
    optimizeImage: false        // no image processing needed
);
$mediaItems = $service->upload($request->file('documents'), auth()->id(), $options);
```

### Retrieve media for a specific post

```php
$postMedia = $service->getByCollection('post-' . $post->id);
```

### Delete old media when updating

```php
$oldMedia = $service->find($oldUuid);
if ($oldMedia) {
    $service->delete($oldMedia);
}
$newMedia = $service->upload($newFile, auth()->id());
```

## Notes

- Image processing requires Intervention Image. If not installed, set `optimizeImage` and `generateThumbnail` to `false`.
- The service uses database transactions to ensure consistency.
- All file names are sanitized and made unique using timestamp + UUID.
- The `metadata` JSON column stores extra info like original dimensions and thumbnail path.
- For security, always validate user permissions before calling `delete` or `update`.
