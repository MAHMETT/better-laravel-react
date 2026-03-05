# Zustand Store Refactoring Summary

## Overview

All Zustand stores have been refactored to use modern best practices based on the official Zustand documentation.

## Key Changes

### 1. Auto-Generated Selectors

All stores now use the `createSelectors` helper from `@/lib/zustand-selectors.ts`. This automatically generates selectors for all state properties and actions.

**Before:**
```typescript
// Old pattern with manual selectors
export const selectSearch = (state: UserFiltersState) => state.filters.search;
export const selectStatus = (state: UserFiltersState) => state.filters.status;

// Usage in components
const search = useUserFiltersStore(selectSearch);
const status = useUserFiltersStore(selectStatus);
```

**After:**
```typescript
// New pattern with auto-generated selectors
// Usage in components
const search = useUserFiltersStore.use.filters().search;
const setFilters = useUserFiltersStore.use.setFilters();
```

### 2. Removed `subscribeWithSelector` Middleware

The `subscribeWithSelector` middleware has been removed from all stores as it's only needed when using `subscribe` method, which wasn't being used.

### 3. Simplified Store Structure

- Removed manual selector exports
- Stores are now wrapped with `createSelectors`
- Cleaner, more maintainable code

## Updated Files

### Core Utilities
- ✅ `resources/js/lib/zustand-selectors.ts` - New selector generator utility

### Stores
- ✅ `resources/js/stores/user-filters.ts`
- ✅ `resources/js/stores/avatar-upload.ts`
- ✅ `resources/js/stores/photo-upload-modal.ts`
- ✅ `resources/js/stores/self-user-log-store.ts`
- ✅ `resources/js/stores/admin-user-log-store.ts`
- ✅ `resources/js/stores/index.ts`

## Migration Guide for Components

### Pattern 1: Simple State Access

**Before:**
```typescript
import { selectSearch, useUserFiltersStore } from '@/stores/user-filters';

const search = useUserFiltersStore(selectSearch);
```

**After:**
```typescript
import { useUserFiltersStore } from '@/stores/user-filters';

const filters = useUserFiltersStore.use.filters();
const search = filters.search;
```

### Pattern 2: Action Access

**Before:**
```typescript
import { useUserFiltersStore } from '@/stores/user-filters';

const setFilters = useUserFiltersStore((state) => state.setFilters);
```

**After:**
```typescript
import { useUserFiltersStore } from '@/stores/user-filters';

const setFilters = useUserFiltersStore.use.setFilters();
```

### Pattern 3: Multiple Selectors

**Before:**
```typescript
const search = useUserFiltersStore((state) => state.filters.search);
const status = useUserFiltersStore((state) => state.filters.status);
const role = useUserFiltersStore((state) => state.filters.role);
```

**After:**
```typescript
const filters = useUserFiltersStore.use.filters();
// Access filters.search, filters.status, filters.role
```

### Pattern 4: Shallow Comparison (for multiple values)

**Before:**
```typescript
import { shallow } from 'zustand/shallow';

const { search, status } = useUserFiltersStore(
    (state) => ({ search: state.filters.search, status: state.filters.status }),
    shallow,
);
```

**After:**
```typescript
// Just get the whole filters object
const filters = useUserFiltersStore.use.filters();
```

## Benefits

1. **Less Boilerplate** - No need to write manual selectors
2. **Type Safety** - Full TypeScript inference
3. **Consistency** - Same pattern across all stores
4. **Maintainability** - Easier to add new state properties
5. **Performance** - Same subscription optimization as manual selectors

## Files Requiring Updates

The following component files need to be updated to use the new selector pattern:

1. `resources/js/components/avatar/photo-upload-modal.tsx`
2. `resources/js/pages/admin/user-logs/index.tsx`
3. `resources/js/pages/admin/users/activity-logs.tsx`
4. `resources/js/pages/settings/login-activity.tsx`

## Example Migration

Here's a complete example of migrating a component:

**Before:**
```typescript
import {
    selectAdminUserLogFilters,
    selectAdminUserLogLoading,
    useAdminUserLogStore,
} from '@/stores/admin-user-log-store';

export default function ActivityLogs() {
    const filters = useAdminUserLogStore(selectAdminUserLogFilters);
    const isLoading = useAdminUserLogStore(selectAdminUserLogLoading);
    const setFilters = useAdminUserLogStore((state) => state.setFilters);
    
    return <div>...</div>;
}
```

**After:**
```typescript
import { useAdminUserLogStore } from '@/stores/admin-user-log-store';

export default function ActivityLogs() {
    const filters = useAdminUserLogStore.use.filters();
    const isLoading = useAdminUserLogStore.use.isLoading();
    const setFilters = useAdminUserLogStore.use.setFilters();
    
    return <div>...</div>;
}
```

## Additional Resources

- [Zustand Documentation - Auto Generating Selectors](./docs/zustand/auto-generating-selectors.md)
- [Zustand Documentation - Updating State](./docs/zustand/update-state.md)
- [Zustand Documentation - How to Reset State](./docs/zustand/how-to-reset-state.md)
