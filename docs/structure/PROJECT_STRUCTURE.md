# Project Structure Documentation

## 📋 Overview

This is a **Laravel 12 + React 19 + Inertia v2** full-stack application using **TypeScript**, **Tailwind CSS v4**, and **Bun** runtime. The project follows a modular architecture with clear separation of concerns.

---

## 🏗️ Root Directory Structure

```
better-laravel-react/
├── app/                      # Laravel backend (PHP)
├── bootstrap/                # Application bootstrap files
├── config/                   # Laravel configuration files
├── database/                 # Migrations, factories, seeders
├── docs/                     # Project documentation
├── public/                   # Public assets (entry point)
├── resources/                # Frontend resources (JS, CSS, views)
├── routes/                   # Laravel route definitions
├── storage/                  # File storage, logs, cache
├── tests/                    # PHPUnit tests
├── vendor/                   # Composer dependencies (auto-generated)
│
├── artisan                   # Laravel CLI
├── composer.json             # PHP dependencies
├── package.json              # Node.js/Bun dependencies
├── phpunit.xml               # PHPUnit configuration
├── pint.json                 # Laravel Pint (code formatter) config
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite bundler configuration
└── README.md                 # Project readme
```

---

## 📂 Backend Structure (`app/`)

### Directory Layout

```
app/
├── Actions/                  # Action classes (business logic)
│   └── Fortify/             # Authentication actions
│       ├── CreateNewUser.php
│       ├── ResetUserPassword.php
│       ├── UpdateUserPassword.php
│       └── UpdateUserProfileInformation.php
│
├── Concerns/                 # PHP traits (reusable logic)
│
├── Enums/                    # PHP enumerations
│
├── Http/                     # HTTP layer
│   ├── Controllers/         # Request handlers
│   │   ├── Admin/          # Admin panel controllers
│   │   │   ├── AdminUserLogController.php
│   │   │   └── UserController.php
│   │   ├── Settings/       # Settings controllers
│   │   │   ├── PasswordController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── TwoFactorAuthenticationController.php
│   │   │   └── UserSelfLogController.php
│   │   └── Controller.php  # Base controller
│   │
│   ├── Middleware/         # HTTP middleware
│   │   ├── EnsureUserRoleIs.php
│   │   ├── HandleAppearance.php
│   │   └── HandleInertiaRequests.php
│   │
│   └── Requests/           # Form request validation
│
├── Models/                  # Eloquent models
│   ├── Media.php           # Media/file model
│   ├── User.php            # User model
│   └── UserLog.php         # User activity log model
│
├── Providers/               # Service providers
│   ├── AppServiceProvider.php
│   └── FortifyServiceProvider.php
│
├── Services/                # Business logic services
│   ├── Auth/               # Authentication services
│   └── Media/              # Media management services
│       ├── MediaService.php
│       └── MediaUploadOptions.php
│
└── Support/                 # Support classes
```

### Key Backend Patterns

#### Models
- Located in `app/Models/`
- Use Eloquent ORM
- Include factories and seeders in `database/`
- Define relationships with type hints

#### Controllers
- Organized by feature (Admin, Settings)
- Use Form Request classes for validation
- Return Inertia responses
- Follow resource controller pattern where applicable

#### Services
- Contain complex business logic
- Keep controllers thin
- Example: `MediaService` handles file uploads with image conversion

---

## 🎨 Frontend Structure (`resources/js/`)

### Directory Layout

```
resources/js/
├── app.tsx                   # Client-side entry point
├── ssr.tsx                   # Server-side rendering entry
│
├── components/               # React components
│   ├── ui/                  # Base UI components (shadcn/radix)
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── icon.tsx
│   │   ├── index.ts         # Barrel exports
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── placeholder-pattern.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   ├── table.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   └── tooltip.tsx
│   │
│   ├── activity-logs/       # Activity log components
│   ├── avatar/              # Avatar-related components
│   ├── users/               # User management components
│   │
│   └── *.tsx                # Common app components
│       ├── alert-error.tsx
│       ├── app-content.tsx
│       ├── app-header.tsx
│       ├── app-logo-icon.tsx
│       ├── app-logo.tsx
│       ├── app-shell.tsx
│       ├── app-sidebar-header.tsx
│       ├── app-sidebar.tsx
│       ├── appearance-tabs.tsx
│       ├── breadcrumbs.tsx
│       ├── delete-user.tsx
│       ├── heading.tsx
│       ├── input-error.tsx
│       ├── nav-footer.tsx
│       ├── nav-main.tsx
│       ├── nav-user.tsx
│       ├── text-link.tsx
│       ├── two-factor-recovery-codes.tsx
│       ├── two-factor-setup-modal.tsx
│       ├── user-info.tsx
│       └── user-menu-content.tsx
│
├── layouts/                  # Layout components
│   ├── app-layout.tsx       # Main app layout with sidebar
│   ├── auth-layout.tsx      # Authentication layout
│   ├── app/                 # App sub-layouts
│   └── settings/            # Settings sub-layouts
│
├── pages/                    # Inertia page components
│   ├── admin/               # Admin panel pages
│   │   ├── users/
│   │   └── activity-logs/
│   ├── auth/                # Authentication pages
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── verify-email.tsx
│   │   └── two-factor-challenge.tsx
│   ├── settings/            # Settings pages
│   │   ├── profile.tsx
│   │   ├── password.tsx
│   │   ├── appearance.tsx
│   │   └── login-activity.tsx
│   ├── dashboard.tsx        # Dashboard page
│   └── welcome.tsx          # Landing page
│
├── hooks/                    # Custom React hooks
│   ├── index.ts             # Barrel exports
│   ├── use-appearance.tsx   # Theme/dark mode
│   ├── use-clipboard.ts     # Clipboard operations
│   ├── use-current-url.ts   # Current URL helper
│   ├── use-initials.tsx     # User initials generator
│   ├── use-mobile-navigation.ts
│   ├── use-mobile.tsx       # Mobile detection
│   └── use-two-factor-auth.ts
│
├── stores/                   # Zustand state management
│   ├── index.ts             # Barrel exports
│   ├── admin-user-log-store.ts
│   ├── avatar-upload.ts
│   ├── photo-upload-modal.ts
│   ├── self-user-log-store.ts
│   └── user-filters.ts
│
├── schemas/                  # Arktype validation schemas
│   ├── index.ts             # Barrel exports
│   ├── auth.ts              # Auth-related schemas
│   ├── avatar.ts            # Avatar validation
│   └── validate.ts          # Validation utilities
│
├── lib/                      # Utilities and helpers
│   └── utils.ts             # General utilities (cn, etc.)
│
├── configs/                  # Configuration files
│   └── sidebar.config.ts    # Sidebar navigation config
│
└── types/                    # TypeScript type definitions
    ├── global.d.ts          # Global type declarations
    └── *.ts                 # Feature-specific types
```

### Frontend Patterns

#### Components
- **UI Components** (`components/ui/`): Base components from shadcn/radix, no business logic
- **Feature Components** (`components/avatar/`, `components/users/`): Grouped by feature
- **Common Components** (`components/*.tsx`): Shared app-wide components

#### Pages
- One-to-one mapping with routes
- Use `<Head>` for page metadata
- Receive data as Inertia props
- Wrap in layouts

#### State Management
- **Zustand** for global state
- Auto-generated selectors pattern
- Stores are thin with clear responsibilities

#### Validation
- **Arktype** for client-side validation
- Schemas in `schemas/`
- Form Request classes for server-side validation

---

## 🛣️ Routing Structure (`routes/`)

### Route Files

```
routes/
├── web.php                   # Main web routes
├── admin.php                 # Admin panel routes
├── settings.php              # User settings routes
├── user.php                  # User-specific routes
└── console.php               # Console commands
```

### Route Organization

#### `web.php` - Main Routes
```php
// Public routes
Route::inertia('/', 'welcome', [...])->name('home');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// Include route files
require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/user.php';
```

#### `admin.php` - Admin Routes
- Middleware: `['auth', 'role:admin']`
- User management CRUD
- Activity logs
- Soft delete operations

#### `settings.php` - Settings Routes
- Middleware: `['auth']`
- Profile management
- Password updates
- Two-factor authentication
- Appearance settings

---

## 🗄️ Database Structure (`database/`)

```
database/
├── factories/               # Model factories for testing
│   ├── UserFactory.php
│   └── ...
│
├── migrations/              # Database migrations
│   ├── 2024_01_01_000000_create_users_table.php
│   └── ...
│
├── seeders/                 # Database seeders
│   ├── DatabaseSeeder.php
│   └── ...
│
└── database.sqlite          # SQLite database file
```

---

## ⚙️ Configuration Structure (`config/`)

```
config/
├── app.php                  # Application config
├── auth.php                 # Authentication config
├── database.php             # Database config
├── filesystems.php          # File storage config
├── fortify.php              # Fortify config
├── inertia.php              # Inertia config
├── logging.php              # Logging config
├── mail.php                 # Email config
├── queue.php                # Queue config
├── services.php             # Third-party services
└── session.php              # Session config
```

---

## 🧪 Testing Structure (`tests/`)

```
tests/
├── Feature/                 # Feature/integration tests
│   └── *.php
│
├── Unit/                    # Unit tests
│   └── *.php
│
└── TestCase.php             # Base test case
```

### Running Tests

```bash
# All tests
bun run test

# Specific test file
php artisan test --compact tests/Feature/ExampleTest.php

# Filter by name
php artisan test --compact --filter=testName
```

---

## 📝 Documentation Structure (`docs/`)

```
docs/
├── structure/               # This documentation
├── prompts/                 # AI prompts
├── zustand/                 # Zustand documentation
├── ARKTYPE_VALIDATION.md    # Arktype validation guide
├── MediaServiceUsage.md     # Media service guide
├── MVCArchitecture.md       # MVC architecture guide
├── ROLLBACK_SUMMARY.md      # Rollback procedures
├── STRUCTURE.md             # Legacy structure docs
├── toast.md                 # Toast notifications
└── ZUSTAND_REFACTOR_SUMMARY.md
```

---

## 🔧 Configuration Files

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import wayfinder from '@laravel/vite-plugin-wayfinder';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        tailwindcss(),
        react(),
        wayfinder(),
    ],
});
```

### `tsconfig.json`
- Base URL: `.`
- Path alias: `@/*` → `./resources/js/*`
- JSX: `react-jsx`
- Strict mode: enabled

### `bootstrap/app.php`
Laravel 12 application configuration:
- Middleware registration
- Exception handling
- Routing setup

---

## 🎯 Key Architectural Patterns

### 1. MVC with Inertia
```
Controller → Inertia::render() → React Page Component
     ↓                                    ↓
  Model (Eloquent)                    UI Components
```

### 2. Form Requests
```php
// Validation in dedicated classes
public function store(PostStoreRequest $request)
{
    Post::create($request->validated());
}
```

### 3. Service Layer
```php
// Business logic in services
$media = app(MediaService::class)->upload($file, $userId);
```

### 4. Zustand State Management
```typescript
// Auto-generated selectors
const filters = useUserFiltersStore.use.filters();
const setFilters = useUserFiltersStore.use.setFilters();
```

### 5. Arktype Validation
```typescript
// Type-safe schemas
const result = validateForm(loginSchema, data);
```

---

## 📦 Dependencies

### Backend (PHP)
| Package | Version | Purpose |
|---------|---------|---------|
| laravel/framework | ^12.0 | Core framework |
| inertiajs/inertia-laravel | ^2.0 | Inertia server adapter |
| laravel/fortify | ^1.30 | Authentication backend |
| laravel/wayfinder | ^0.1.9 | TypeScript route generation |
| intervention/image-laravel | ^1.5 | Image processing |

### Frontend (Bun)
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI library |
| @inertiajs/react | ^2.3.7 | Inertia client |
| tailwindcss | ^4.0.0 | CSS framework |
| @radix-ui/react-* | ^1.x | UI primitives |
| zustand | ^5.0.11 | State management |
| arktype | ^2.1.29 | Validation |
| typescript | ^5.7.2 | Type safety |
| vite | ^7.0.4 | Build tool |

---

## 🚀 Development Commands

### Backend
```bash
# Install dependencies
composer install

# Run development server
php artisan serve

# Run migrations
php artisan migrate

# Run tests
php artisan test

# Format code
composer run lint
```

### Frontend
```bash
# Install dependencies
bun install

# Development server
bun run dev

# Production build
bun run build

# Type checking
bun run types

# Linting
bun run lint

# Format
bun run format
```

### Combined
```bash
# Full development environment
composer run dev

# With SSR
composer run dev:ssr
```

---

## 📋 Naming Conventions

### PHP Backend
| Type | Convention | Example |
|------|-----------|---------|
| Models | PascalCase | `User`, `UserLog` |
| Controllers | PascalCase + Controller suffix | `UserController` |
| Requests | PascalCase + Request suffix | `StoreUserRequest` |
| Services | PascalCase + Service suffix | `MediaService` |
| Actions | PascalCase | `CreateNewUser` |
| Enums | PascalCase | `UserRole`, `Status` |
| Migrations | snake_case + descriptive | `create_users_table` |

### TypeScript Frontend
| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case | `app-header.tsx` |
| UI Components | lowercase | `button.tsx` |
| Pages | kebab-case | `forgot-password.tsx` |
| Layouts | kebab-case | `app-layout.tsx` |
| Hooks | camelCase + `use` prefix | `use-appearance.ts` |
| Stores | kebab-case + `-store` | `user-filters.ts` |
| Schemas | kebab-case | `auth.ts` |
| Types | lowercase | `auth.ts`, `navigation.ts` |
| Utilities | lowercase | `utils.ts` |

---

## 🔐 Security Features

### Authentication (Fortify)
- Login/Registration
- Password reset
- Email verification
- Two-factor authentication (TOTP)
- Recovery codes

### Authorization
- Role-based middleware (`role:admin,user`)
- Custom `EnsureUserRoleIs` middleware
- Gates and policies support

### Middleware Stack
```php
// bootstrap/app.php
$middleware->web(append: [
    HandleAppearance::class,
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
]);

$middleware->alias([
    'role' => EnsureUserRoleIs::class,
]);
```

---

## 🎨 Styling System

### Tailwind CSS v4
- Uses `@tailwindcss/vite` plugin
- CSS-first configuration
- Utility-first approach

### Components
- **Radix UI**: Accessible primitives
- **shadcn/ui**: Pre-built components
- **Custom components**: App-specific UI

### Theme System
- Light/dark mode support
- `use-appearance` hook
- Persisted in cookies

---

## 📊 State Management

### Zustand Pattern
```typescript
import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';

const useStore = createSelectors(
    create((set) => ({
        // State
        filters: {},
        isLoading: false,
        
        // Actions
        setFilters: (filters) => set({ filters }),
    }))
);
```

### Usage
```typescript
// Access state
const filters = useStore.use.filters();

// Access actions
const setFilters = useStore.use.setFilters();
```

---

## ✅ Best Practices

### DO
- Use Form Request classes for validation
- Keep controllers thin, use services
- Use eager loading to prevent N+1 queries
- Write tests for features
- Use TypeScript strict mode
- Follow naming conventions
- Use barrel exports for cleaner imports
- Keep components small and focused

### DON'T
- Use `env()` outside config files
- Put business logic in controllers
- Skip validation on client or server
- Create deeply nested folder structures
- Use inline comments (use PHPDoc instead)
- Mix UI components with business logic
- Skip type declarations

---

## 🔄 File Flow Example

### User Profile Update Flow

1. **Route** (`routes/settings.php`)
   ```php
   Route::patch('settings/profile', [ProfileController::class, 'update']);
   ```

2. **Form Request** (`app/Http/Requests/UpdateProfileRequest.php`)
   ```php
   public function rules(): array {
       return ['name' => 'required|string|max:255'];
   }
   ```

3. **Controller** (`app/Http/Controllers/Settings/ProfileController.php`)
   ```php
   public function update(UpdateProfileRequest $request) {
       auth()->user()->update($request->validated());
       return redirect()->route('profile.edit');
   }
   ```

4. **React Page** (`resources/js/pages/settings/profile.tsx`)
   ```tsx
   const { data, setData, patch } = useForm({ name: '' });
   
   <Form onSubmit={(e) => {
       e.preventDefault();
       patch(route('profile.update'));
   }}>
   ```

5. **Validation** (`resources/js/schemas/auth.ts`)
   ```typescript
   export const profileSchema = type({
       name: 'string.min(2).max(255)',
   });
   ```

---

## 📚 Related Documentation

- [MVC Architecture](./MVCArchitecture.md)
- [Arktype Validation](./ARKTYPE_VALIDATION.md)
- [MediaService Usage](./MediaServiceUsage.md)
- [Zustand Refactor Summary](./ZUSTAND_REFACTOR_SUMMARY.md)
- [Laravel Documentation](https://laravel.com/docs/12.x)
- [Inertia.js Documentation](https://inertiajs.com/)
- [React Documentation](https://react.dev/)

---

**Last Updated:** 2026-03-05  
**Laravel Version:** 12.x  
**React Version:** 19.x  
**Inertia Version:** 2.x  
**Runtime:** Bun
