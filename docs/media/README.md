# Media Converter

A powerful client-side media conversion utility using FFmpeg WASM. Supports converting images and videos to various formats with configurable presets.

## Features

- **Client-side conversion** - No server required, runs entirely in the browser
- **Image conversion** - Convert between JPEG, PNG, WebP, AVIF, GIF, BMP, TIFF
- **Video conversion** - Convert between MP4, WebM, AVI, MOV, MKV, GIF
- **Presets** - Pre-configured conversion settings for common use cases
- **Progress tracking** - Real-time conversion progress updates
- **Toast notifications** - Loading, success, and error feedback
- **URL conversion** - Convert media from URLs directly

## Installation

The utility is already installed as part of the project dependencies:

```bash
bun add @ffmpeg/ffmpeg @ffmpeg/util
```

## Quick Start

### Convert Image to WebP

```typescript
import { convertImage } from '@/lib/media-converter';

const file = // your image file
const result = await convertImage(file, 'webpHigh');

console.log(result.fileName);    // "photo.webp"
console.log(result.blob);       // Converted blob
```

### Convert Video to MP4

```typescript
import { convertVideo } from '@/lib/media-converter';

const file = // your video file
const result = await convertVideo(file, 'webMedium');
```

### Convert and Download

```typescript
import { convertAndDownloadMedia } from '@/lib/media-converter';

const file = // your media file
    await convertAndDownloadMedia(file, 'webpHigh');
```

## Presets

### Image Presets

| Preset       | Format | Quality | Use Case                  |
| ------------ | ------ | ------- | ------------------------- |
| `webpHigh`   | WebP   | 90%     | High quality web images   |
| `webpMedium` | WebP   | 70%     | Medium quality web images |
| `webpLow`    | WebP   | 50%     | Low bandwidth scenarios   |
| `jpegHigh`   | JPEG   | 90%     | High quality photos       |
| `jpegMedium` | JPEG   | 70%     | Standard photos           |
| `jpegLow`    | JPEG   | 50%     | Thumbnails                |
| `png`        | PNG    | 100%    | Lossless images           |
| `avifHigh`   | AVIF   | 90%     | Next-gen high quality     |
| `avifMedium` | AVIF   | 65%     | Next-gen standard         |
| `avifLow`    | AVIF   | 40%     | Next-gen low quality      |
| `thumbnail`  | WebP   | 70%     | 150x150 thumbnail         |
| `avatar`     | WebP   | 85%     | 512x512 avatar            |
| `cover`      | WebP   | 80%     | 1920x1080 cover image     |

### Video Presets

| Preset      | Format | Resolution | Bitrate | Use Case         |
| ----------- | ------ | ---------- | ------- | ---------------- |
| `webSmall`  | MP4    | 480p       | 1Mbps   | Mobile/web small |
| `webMedium` | MP4    | 720p       | 2.5Mbps | Web standard     |
| `webLarge`  | MP4    | 1080p      | 5Mbps   | Web HD           |
| `webUltra`  | MP4    | 4K         | 20Mbps  | Web 4K           |
| `gif`       | GIF    | 480p       | -       | Animated GIF     |
| `webmVP9`   | WebM   | 720p       | 2.5Mbps | Modern web       |
| `compress`  | MP4    | 360p       | 500kbps | Low bandwidth    |

## API Reference

### Core Functions

#### `convertMedia(options)`

Low-level conversion function with full control over conversion parameters.

```typescript
interface MediaConvertOptions {
    file: File;
    outputFormat: string;
    quality?: number; // 0-100
    width?: number;
    height?: number;
    frameRate?: number;
    videoBitrate?: string; // e.g., "1000k"
    audioBitrate?: string; // e.g., "128k"
    audioCodec?: string;
    videoCodec?: string;
    onProgress?: (progress: number) => void;
}

const result = await convertMedia({
    file: myFile,
    outputFormat: 'webp',
    quality: 85,
    width: 512,
    height: 512,
});
```

#### `convertVideo(file, preset)`

Convert a video file using a preset.

```typescript
import { convertVideo, VIDEO_PRESETS } from '@/lib/media-converter';

// Using preset name
const result = await convertVideo(videoFile, 'webMedium');

// Using custom preset
const result = await convertVideo(videoFile, {
    name: 'Custom HD',
    format: 'mp4',
    videoBitrate: '3000k',
    audioBitrate: '192k',
    resolution: { width: 1280, height: 720 },
    frameRate: 30,
});
```

#### `convertImage(file, preset)`

Convert an image file using a preset.

```typescript
import { convertImage, IMAGE_PRESETS } from '@/lib/media-converter';

// Using preset name
const result = await convertImage(imageFile, 'avatar');

// Using custom preset
const result = await convertImage(imageFile, {
    name: 'Custom Size',
    format: 'webp',
    quality: 80,
    width: 800,
    height: 600,
});
```

#### `convertVideoUrl(url, preset)`

Convert a video from a URL.

```typescript
const blob = await convertVideoUrl('/storage/videos/intro.mp4', 'webMedium');
```

#### `convertImageUrl(url, preset)`

Convert an image from a URL.

```typescript
const blob = await convertImageUrl('/storage/photos/avatar.png', 'avatar');
```

#### `downloadConverted(blob, fileName)`

Download the converted blob as a file.

```typescript
import { downloadConverted } from '@/lib/media-converter';

await downloadConverted(result.blob, 'my-image.webp');
```

#### `convertAndDownloadMedia(file, preset)`

Convert and download in one step.

```typescript
await convertAndDownloadMedia(myFile, 'webpHigh');
```

#### `convertAndDownloadUrl(url, preset)`

Convert from URL and download in one step.

```typescript
await convertAndDownloadUrl('/storage/photos/old-image.jpg', 'webpHigh');
```

### Utility Functions

#### `getMediaInfo(file)`

Get information about a media file.

```typescript
import { getMediaInfo } from '@/lib/media-converter';

const info = await getMediaInfo(myFile);
console.log(info.type); // "image/jpeg"
console.log(info.size); // "2.5 MB"
console.log(info.name); // "photo.jpg"
console.log(info.lastModified); // "2024-01-15 10:30:00"
```

#### `isFFmpegLoaded()`

Check if FFmpeg is loaded.

```typescript
import { isFFmpegLoaded } from '@/lib/media-converter';

if (isFFmpegLoaded()) {
    // FFmpeg is ready
}
```

#### `isFFmpegLoading()`

Check if FFmpeg is currently loading.

```typescript
import { isFFmpegLoading } from '@/lib/media-converter';

if (isFFmpegLoading()) {
    // FFmpeg is loading, wait for it
}
```

## Usage Examples

### Profile Avatar Conversion

```typescript
import {
    convertImage,
    downloadConverted,
    IMAGE_PRESETS,
} from '@/lib/media-converter';

async function processAvatar(file: File) {
    // Convert to WebP avatar format
    const result = await convertImage(file, 'avatar');

    // Download or use the blob
    await downloadConverted(result.blob, result.fileName);

    return result.blob;
}
```

### Batch Image Conversion

```typescript
import { convertImage } from '@/lib/media-converter';

async function batchConvert(files: File[], preset: string) {
    const results = await Promise.all(
        files.map((file) =>
            convertImage(file, preset as keyof typeof IMAGE_PRESETS),
        ),
    );

    return results;
}
```

### Video Compression

```typescript
import { convertVideo, VIDEO_PRESETS } from '@/lib/media-converter';

async function compressVideo(file: File) {
    const result = await convertVideo(file, 'compress');
    console.log(
        `Compressed from ${result.originalSize} to ${result.convertedSize}`,
    );
    return result.blob;
}
```

### Convert URL and Display

```typescript
import { convertImageUrl } from '@/lib/media-converter';

async function loadOptimizedImage(url: string) {
    const blob = await convertImageUrl(url, 'webpMedium');

    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url;

    return img;
}
```

## Error Handling

All functions include built-in toast notifications for:

- Loading states
- Progress updates
- Success messages with file size savings
- Error messages with details

You can also catch errors manually:

```typescript
try {
    const result = await convertImage(file, 'webpHigh');
} catch (error) {
    console.error('Conversion failed:', error);
    // Handle error appropriately
}
```

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 14.1+
- Edge 80+

Note: FFmpeg WASM requires SharedArrayBuffer which requires:

- Cross-Origin Isolation headers (COOP/COEP)
- Secure context (HTTPS)

## Performance Tips

1. **Use presets** - Presets are optimized for common use cases
2. **Resize first** - Reduce dimensions before conversion for faster processing
3. **Progressive loading** - FFmpeg loads once and stays in memory
4. **Chunked files** - For very large files, consider using FileStream APIs

## Troubleshooting

### "SharedArrayBuffer is not defined"

Ensure your server sends these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Conversion fails silently

Check the browser console for FFmpeg logs.

### Slow performance

- Use smaller presets for initial testing
- Ensure device has sufficient memory
- Consider using web workers for background processing
