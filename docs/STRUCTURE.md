# Project Structure Guide

## 📁 Overview

This project uses a **simple, flat structure** with logical grouping by concern. The structure is designed for readability and ease of maintenance.

## 📂 Directory Structure

```
resources/js/
├── app.tsx                 # Application entry point
├── ssr.tsx                 # Server-side rendering entry
│
├── components/             # React components
│   ├── ui/                 # Base UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ... (all UI components)
│   │
│   ├── avatar/             # Avatar-specific components
│   │   ├── avatar-upload-modal.tsx
│   │   └── image-crop-dialog.tsx
│   │
│   └── *.tsx               # Common app components
│       ├── app-header.tsx
│       ├── breadcrumbs.tsx
│       └── ...
│
├── pages/                  # Page components (Inertia)
│   ├── auth/               # Authentication pages
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── ...
│   │
│   └── settings/           # Settings pages
│       ├── profile.tsx
│       ├── appearance.tsx
│       └── ...
│
├── layouts/                # Layout components
│   ├── app-layout.tsx
│   ├── auth-layout.tsx
│   └── settings/
│       └── layout.tsx
│
├── hooks/                  # React hooks
│   ├── use-appearance.ts
│   ├── use-clipboard.ts
│   └── ...
│
├── lib/                    # Utilities
│   └── utils.ts
│
├── types/                  # TypeScript types
│   ├── auth.ts
│   ├── navigation.ts
│   └── ui.ts
│
├── configs/                # Configuration files
│   └── sidebar.config.ts
│
├── routes/                 # Route definitions (Wayfinder)
│   ├── login/
│   ├── register/
│   └── ...
│
└── actions/                # Wayfinder controller actions
    └── App/
        └── Http/
            └── Controllers/
```

## 📝 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | kebab-case | `app-header.tsx`, `input-error.tsx` |
| **UI Components** | lowercase | `button.tsx`, `avatar.tsx` |
| **Pages** | kebab-case | `forgot-password.tsx` |
| **Layouts** | kebab-case | `app-layout.tsx` |
| **Hooks** | camelCase + use prefix | `use-appearance.ts` |
| **Types** | lowercase | `auth.ts`, `navigation.ts` |
| **Utilities** | lowercase | `utils.ts` |

## 🔗 Imports

### Using Barrel Exports (Recommended)

```typescript
// UI Components
import { Button, Input, Card } from '@/components/ui';

// Hooks
import { useAppearance, useClipboard } from '@/hooks';

// Types
import type { User, Auth } from '@/types';

// Avatar components
import { AvatarUploadModal } from '@/components/avatar';
```

### Direct Imports

```typescript
// Also fine for specific imports
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
```

## 📦 Component Organization

### UI Components (`components/ui/`)
- Base, reusable UI components
- Mostly from shadcn/ui
- No business logic
- Pure presentation

### Common Components (`components/*.tsx`)
- App-specific components
- May contain business logic
- Used across multiple pages
- Examples: `app-header`, `breadcrumbs`, `delete-user`

### Feature Components (`components/avatar/`)
- Components specific to a feature
- Grouped when they work together
- Examples: avatar upload, crop dialog

### Pages (`pages/`)
- Inertia page components
- One per route
- Define layout usage
- Handle data props

## 🎯 Best Practices

### ✅ DO

- Keep components small and focused
- Use barrel exports for cleaner imports
- Group related components (like avatar)
- Extract reusable logic to hooks
- Keep types in `types/` folder
- Use descriptive component names

### ❌ DON'T

- Create deeply nested folders
- Over-engineer the structure
- Mix UI components with business logic
- Create unnecessary abstractions
- Import from deep relative paths (`../../../`)

## 📈 When to Create New Folders

### Create a subfolder when:

1. **5+ related files** - Group them (e.g., `avatar/`)
2. **Feature-specific** - Components only used together
3. **Better organization** - Makes navigation easier

### Keep flat when:

1. **Shared across features** - Keep in root `components/`
2. **Simple components** - No need to group
3. **Easy to find** - Alphabetical order works

## 🔄 Adding New Features

### 1. Create Page

```typescript
// pages/settings/new-feature.tsx
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function NewFeature() {
    return (
        <AppLayout>
            <Head title="New Feature" />
            {/* Page content */}
        </AppLayout>
    );
}
```

### 2. Create Components (if needed)

```
components/
└── new-feature/
    ├── feature-component.tsx
    └── another-component.tsx
```

### 3. Add Route

```typescript
// routes/new-feature/index.ts
export function show() {
    return {
        methods: ['GET'],
        url: '/new-feature',
    };
}
```

## 🛠️ Maintenance Tips

### Keep It Simple

- Don't refactor unless necessary
- Small improvements > big rewrites
- Test after any structural change

### Readability First

- Clear names > clever organization
- Flat structure > deep nesting
- Consistent patterns > perfect structure

### Incremental Improvements

- Fix naming as you go
- Extract components when they grow
- Add barrel exports for convenience

## 📚 Related Documentation

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
