# Laravel React Starter Kit

A modern, production-ready starter kit built with **Laravel 12**, **Inertia.js v2**, **React 19**, and **TypeScript**. Features a streamlined developer experience with Zustand state management, admin panel, activity logging, and optional visitor management system.

## Features

### Core Stack

- **Backend**: Laravel 12 (PHP 8.5.3)
- **Frontend**: React 19 + Inertia.js v2
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **TypeScript**: Strict typing with centralized types
- **State Management**: Zustand
- **Testing**: PHPUnit v11

### Key Features

#### 🏗️ Zustand State Management
Global state management using Zustand stores with selectors for optimal performance. Used across authentication, user filters, activity logs, and visitor analytics.

```typescript
import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand-selectors';

const useStore = createSelectors(create((set) => ({
  // state
})));
```

#### 📦 Reusable Types & Props
Centralized TypeScript types in `resources/js/types/` ensuring type safety across the application.

```typescript
// resources/js/types/index.ts
export type { User, Roles, UserStatus } from './models';
export type { BreadcrumbItem, NavItem } from './navigation';
```

#### 📸 Profile Photo Upload
Users can upload and manage profile photos with automatic thumbnail generation and media storage.

- Avatar upload with validation
- Thumbnail generation
- Media service integration
- Delete avatar functionality

#### 👥 Admin User Management
Complete user management system with admin-only access.

- CRUD operations for users
- Soft deletes with 30-day retention
- User status toggle (enable/disable)
- Role assignment (admin/user)
- Bulk actions support

#### 📊 Activity Logs
Comprehensive activity tracking system for monitoring user actions.

- Login/logout tracking
- User action history
- Filterable logs by user, action type, date
- Admin and self-view modes

#### 🚶 Visitor Management
Available in `visitor-management` branch. Complete visitor tracking and analytics system.

- Visitor check-in/check-out
- Analytics dashboard with charts
- Live activity feed
- Regional distribution tracking
- Export capabilities

#### 🎞️ Media Service
Centralized media handling service for file uploads.

- Image upload with validation
- Document upload support
- Thumbnail generation
- Metadata storage
- Disk management (public/private)

#### 🔐 Role System
Two-tier role system with middleware protection.

- **admin**: Full access to admin panel and user management
- **user**: Standard user access

## Installation

### Quick Start

Clone the repository and initialize a fresh project:

```bash
# Clone the repository
git clone https://github.com/your-org/laravel-react-starter-kit.git my-project

# Enter directory
cd my-project

# Remove git history
rm -rf .git

# Initialize new repository
git init
git add .
git commit -m "Initial commit"
```

### Branch Selection

Choose the branch that fits your project needs:

```bash
# Core starter kit (recommended for most projects)
git checkout main

# With visitor management system
git checkout visitor-management
```

**Available branches:**

| Branch | Description |
|--------|-------------|
| `main` | Core starter kit with admin panel, activity logs, media service |
| `visitor-management` | Includes all features + visitor analytics dashboard |

### TUI Installation Script

Interactive terminal installer for quick project setup:

```bash
# Run the installer
php artisan install:starter
```

**Installer options:**

1. **Project name** – Set your project/folder name
2. **Branch selection** – Choose between `main` or `visitor-management`
3. **Runtime selection** – Select package manager:
   - `npm`
   - `pnpm`
   - `yarn`
   - `bun`

**Optional automated steps:**

- [ ] Run `composer install`
- [ ] Install Node dependencies
- [ ] Run database migrations
- [ ] Generate application key
- [ ] Seed database (optional)

**Example with flags:**

```bash
# Non-interactive installation
php artisan install:starter \
  --name=my-project \
  --branch=main \
  --runtime=bun \
  --with-deps \
  --with-migrations \
  --with-seed
```

### Manual Installation

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=your_database
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Install Node dependencies (choose your runtime)
npm install
# or
pnpm install
# or
yarn install
# or
bun install

# Build assets
npm run build
# or
pnpm build
# or
yarn build
# or
bun run build
```

## Development

### Starting the Application

**Laravel development server:**

```bash
php artisan serve
```

**Frontend development server:**

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### Production Build

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/UserTest.php

# Run with coverage
php artisan test --coverage
```

### Code Formatting

```bash
# Format PHP files
vendor/bin/pint

# Format frontend files
npm run format
# or
pnpm format
# or
yarn format
# or
bun run format
```

## Project Structure

```
laravel-react-starter-kit/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/          # Admin controllers
│   │   │   └── Settings/       # Settings controllers
│   │   ├── Middleware/         # Custom middleware
│   │   └── Requests/           # Form request validation
│   ├── Models/                 # Eloquent models
│   ├── Observers/              # Model observers
│   ├── Jobs/                   # Queued jobs
│   └── Services/               # Business logic services
│       └── User/               # User-specific services
│
├── resources/js/
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn UI components
│   │   └── avatar/             # Avatar components
│   ├── hooks/                  # Custom React hooks
│   ├── layouts/                # Layout components
│   ├── lib/                    # Utilities & helpers
│   ├── pages/                  # Inertia page components
│   │   ├── admin/              # Admin pages
│   │   ├── auth/               # Auth pages
│   │   └── settings/           # Settings pages
│   ├── routes/                 # Wayfinder route functions
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types
│
├── routes/
│   ├── admin.php               # Admin routes
│   ├── web.php                 # Web routes
│   └── console.php             # Console commands
│
├── database/
│   ├── factories/              # Model factories
│   ├── migrations/             # Database migrations
│   └── seeders/                # Database seeders
│
└── storage/
    └── app/
        └── public/             # Public storage (avatars, media)
```

### Key Directories

| Directory | Description |
|-----------|-------------|
| `resources/js/types/` | Centralized TypeScript types and interfaces |
| `resources/js/stores/` | Zustand state management stores |
| `resources/js/components/ui/` | Reusable Shadcn UI components |
| `app/Services/` | Business logic and service classes |
| `app/Observers/` | Model event observers |
| `app/Jobs/` | Queued background jobs |

## Environment Variables

Required environment variables in `.env`:

```env
APP_NAME="Your App"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

## Testing

```bash
# Run all tests
php artisan test

# Run feature tests
php artisan test tests/Feature/

# Run unit tests
php artisan test tests/Unit/

# Run with specific filter
php artisan test --filter=UserTest
```

## Security

- **Authentication**: Laravel Fortify with 2FA support
- **Authorization**: Role-based middleware (`role:admin`, `role:user`)
- **Validation**: Form Request classes for all inputs
- **CSRF Protection**: Enabled by default
- **Password Policy**: Strong password requirements in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

For issues, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/your-org/laravel-react-starter-kit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/laravel-react-starter-kit/discussions)
- **Documentation**: This README and inline code comments

---

Built with ❤️ using Laravel, Inertia.js, and React
