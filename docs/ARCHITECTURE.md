# Architecture Guide

> **Stack:** Laravel 12 + Inertia.js v2 + React 19 + Zustand + TanStack Query

This document defines the core architecture for building scalable, high-performance web applications.

## 1. State Management Strategy

We categorize data into three distinct layers to ensure a "Single Source of Truth" and zero redundant renders.

| Layer               | Tool               | Responsibility                                                                             |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| **Server State**    | **TanStack Query** | Asynchronous data from APIs. Handles caching, background revalidation, and loading states. |
| **Client UI State** | **Zustand**        | Global ephemeral state (Sidebars, Modals, Themes, Auth context).                           |
| **Initial Props**   | **Inertia.js**     | Critical SSR data for first-paint and SEO metadata.                                        |

## 2. Architectural Pillars

### Pillar #1: Optimized Networking (Axios Interceptors)

- **Singleton Instance:** All requests must pass through a pre-configured Axios instance (`resources/js/lib/api.ts`).
- **Global Interceptors:** Handle 401 (Unauthorized), 422 (Validation), and 500 errors globally.
- **Auto-CSRF:** CSRF tokens are automatically attached to all requests.

**Usage:**
```typescript
import { api } from '@/lib';

// GET request
const response = await api.get('/users');

// POST request
const user = await api.post('/users', { name: 'John' });
```

### Pillar #2: Strong Type Systems

- **API Responses:** Every API response has a corresponding TypeScript interface in `resources/js/types/`.
- **Inertia Shared Props:** Define global types for shared Inertia data.

**Example:**
```typescript
// resources/js/types/api/users.ts
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    status: 'enable' | 'disable';
}

export interface UsersResponse {
    users: User[];
    total: number;
}
```

### Pillar #3: Smart Invalidation

Every `POST/PUT/DELETE` operation triggers automatic query invalidation via the `useApiMutation` hook.

```typescript
import { useApiMutation } from '@/hooks';

const mutation = useApiMutation(
    ['users', 'create'],
    (data) => api.post('/users', data),
    {
        onSuccess: () => {
            // Additional logic after invalidation
        },
    }
);
```

## 3. Technical Standards

### A. Global UI Store (Zustand)

Standardizes UI behavior across the entire application using high-performance selectors.

```typescript
import { useGlobalUIStore } from '@/stores';

const sidebarOpen = useGlobalUIStore.use.sidebarOpen();
const setSidebarOpen = useGlobalUIStore.use.setSidebarOpen();
```

**Available stores:**
- `global-ui-store` - Sidebar, modals, theme
- `user-filters` - User list filters
- `avatar-upload` - Avatar upload state
- `admin-user-log-store` - Admin activity log filters
- `self-user-log-store` - Self activity log filters

### B. Universal Data Hook (TanStack Query)

Abstraction layer for all data fetching with automatic caching and background updates.

```typescript
import { useApiQuery } from '@/hooks';

const { data, isLoading, error } = useApiQuery(
    ['users', userId],
    () => api.get(`/users/${userId}`).then(res => res.data),
    { staleTime: 5 * 60 * 1000 }
);
```

**Query Keys:**
- Use array format: `['resource', 'action', id]`
- Example: `['users', 'list']`, `['users', 'show', 1]`

### C. Mutation Hook with Auto-Invalidation

```typescript
import { useApiMutation } from '@/hooks';

const deleteUser = useApiMutation(
    ['users', 'delete'],
    (id) => api.delete(`/users/${id}`)
);
```

## 4. Performance Checklist

1. **Persistent Layouts:** Prevent component unmounting during navigation.
2. **Partial Reloads:** Use Inertia `only` for targeted prop updates.
3. **Debounced Fetching:** Minimum 300ms delay for search-triggered network calls.
4. **Code Splitting:** Dynamic page imports via Vite.
5. **Stale Time:** 5-minute default stale time for queries.
6. **GC Time:** 10-minute cache retention.

## 5. File Structure

```
resources/js/
├── api/                    # API functions (optional, can use api directly)
├── components/             # React components
├── hooks/                  # Custom hooks
│   ├── use-api-mutation.ts
│   ├── use-api-query.ts
│   └── ...
├── layouts/                # Layout components
├── lib/                    # Utilities
│   ├── api.ts             # Axios instance
│   └── ...
├── pages/                  # Inertia pages
├── providers/              # React providers
│   └── tanstack-query-provider.tsx
├── stores/                 # Zustand stores
│   ├── global-ui-store.ts
│   └── ...
└── types/                  # TypeScript types
    ├── api/               # API response types
    └── models/            # Model types
```

## 6. Best Practices

### DO:
- Use `useApiQuery` for all data fetching
- Use `useApiMutation` for mutations
- Use Zustand for global UI state
- Define types in `resources/js/types/`
- Use selectors with Zustand to prevent re-renders

### DON'T:
- Use `useState` for global state
- Make direct `fetch` or `axios` calls
- Store server state in Zustand
- Skip error handling in mutations

## 7. Migration Guide

### From useState to Zustand:

**Before:**
```typescript
const [sidebarOpen, setSidebarOpen] = useState(true);
```

**After:**
```typescript
const sidebarOpen = useGlobalUIStore.use.sidebarOpen();
const setSidebarOpen = useGlobalUIStore.use.setSidebarOpen();
```

### From useEffect fetching to TanStack Query:

**Before:**
```typescript
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    api.get('/users').then(res => {
        setUsers(res.data);
        setLoading(false);
    });
}, []);
```

**After:**
```typescript
const { data: users, isLoading } = useApiQuery(
    ['users', 'list'],
    () => api.get('/users').then(res => res.data)
);
```
