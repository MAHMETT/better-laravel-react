# MVC Architecture Documentation

## Overview

This application follows the **Model-View-Controller (MVC)** architectural pattern, implemented with **Laravel 12** (backend) and **React 19 with Inertia.js v2** (frontend). This creates a modern SPA-like experience while maintaining Laravel's server-side rendering capabilities.

## Architecture Stack

| Layer       | Technology              | Location                    |
| ----------- | ----------------------- | --------------------------- |
| **Model**   | Laravel Eloquent        | `app/Models/`               |
| **View**    | React + Inertia         | `resources/js/pages/`       |
| **Controller** | Laravel Controllers  | `app/Http/Controllers/`     |
| **Routes**  | Laravel Routes          | `routes/web.php`            |
| **Requests**| Form Request Validation | `app/Http/Requests/`        |
| **Services**| Business Logic          | `app/Services/`             |

---

## Model (M)

Models represent your data structure and business logic. They handle database interactions using Eloquent ORM.

### Location

```
app/Models/
```

### Example Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'status',
        'published_at',
        'user_id',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

### Best Practices

1. **Use Relationships**: Define clear relationship methods
2. **Use Scopes**: Create query scopes for reusable logic
3. **Use Accessors/Mutators**: Transform attributes when getting/setting
4. **Use Factories**: Create factories for testing and seeding
5. **Eager Loading**: Use `with()` to prevent N+1 queries

---

## View (V)

Views are React components rendered through Inertia.js. They receive data as props from controllers.

### Location

```
resources/js/pages/          # Page components
resources/js/components/     # Reusable components
```

### Example Page Component

```tsx
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Post {
    id: number;
    title: string;
    slug: string;
}

interface Props extends PageProps {
    posts: Post[];
}

export default function PostsIndex({ posts }: Props) {
    return (
        <>
            <Head title="Posts" />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Posts</h1>
                <div className="grid gap-4">
                    {posts.map((post) => (
                        <div key={post.id} className="p-4 border rounded">
                            <h2>{post.title}</h2>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
```

### Inertia Features

#### Link Component

```tsx
import { Link } from '@inertiajs/react';

<Link href={route('posts.show', post)}>View Post</Link>
<Link href={route('posts.index', { page: 2 })}>Page 2</Link>
```

#### useForm Hook

```tsx
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm({
    title: '',
    content: '',
});

function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route('posts.store'));
}
```

---

## Controller (C)

Controllers handle incoming requests, interact with models/services, and return Inertia responses.

### Location

```
app/Http/Controllers/
```

### Example Controller

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostStoreRequest;
use App\Models\Post;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        $posts = Post::with('author')->latest()->paginate(12);

        return Inertia::render('posts/index', [
            'posts' => $posts,
        ]);
    }

    public function store(PostStoreRequest $request)
    {
        Post::create($request->validated());

        return redirect()->route('posts.index');
    }
}
```

### Best Practices

1. **Use Form Requests**: Keep validation out of controllers
2. **Use Services**: Move business logic to service classes
3. **Keep controllers thin**: Only handle HTTP concerns
4. **Use type hints**: For parameters and return types

---

## MediaService with Image Conversion

The `MediaService` provides advanced file upload capabilities including automatic image format conversion.

### Configuration

Set the default image conversion format in your `.env` file:

```env
# Image conversion format: none, webp, avif, jpg, png, gif, bmp
CONVERT_IMAGE=webp
```

### MediaUploadOptions

```php
use App\Services\Media\MediaUploadOptions;

// Convert to WebP
$options = new MediaUploadOptions(
    convertFormat: 'webp',
    collection: 'avatars',
    resizeDimensions: [400, 400, 'fit']
);

// No conversion
$options = new MediaUploadOptions(
    convertFormat: null
);
```

### Usage Examples

```php
use App\Services\Media\MediaService;

$service = app(MediaService::class);

// Upload with global default conversion (from .env)
$media = $service->upload($request->file('image'), auth()->id());

// Upload with explicit conversion
$options = new MediaUploadOptions(convertFormat: 'avif');
$media = $service->upload($request->file('image'), auth()->id(), $options);

// Replace existing media
$existingMedia = $service->find('uuid-here');
$newMedia = $service->uploadOrUpdate(
    $request->file('new-image'),
    auth()->id(),
    $existingMedia,
    $options
);
```

### Supported Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| WebP | `webp` | General web use |
| AVIF | `avif` | Maximum compression |
| JPEG | `jpg` | Universal compatibility |
| PNG | `png` | Lossless, transparency |

### Metadata

Converted images store conversion information:

```json
{
    "original_width": 1920,
    "original_height": 1080,
    "original_format": "png",
    "converted_from": "png",
    "converted_to": "webp",
    "converted_path": "media/avatars/2026/02/uuid-image.webp"
}
```

---

## Complete Flow Example

### 1. Route

```php
// routes/web.php
Route::middleware(['auth'])->group(function () {
    Route::resource('posts', PostController::class);
});
```

### 2. Form Request

```php
// app/Http/Requests/PostStoreRequest.php
public function rules(): array
{
    return [
        'title' => ['required', 'string', 'max:255'],
        'content' => ['required', 'string'],
    ];
}
```

### 3. Controller

```php
public function store(PostStoreRequest $request)
{
    Post::create($request->validated());
    return redirect()->route('posts.index');
}
```

### 4. React View

```tsx
import { useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        title: '',
        content: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('posts.store'));
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
            />
            {errors.title && <span>{errors.title}</span>}
            <button type="submit">Create</button>
        </form>
    );
}
```

---

## Related Documentation

- [MediaService Usage](./MediaServiceUsage.md)
