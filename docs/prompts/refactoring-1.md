# 🚀 Global Code Improvement & Refactoring Workflow

**Objective:** Refactor the codebase to be enterprise-grade, type-safe, reusable, and performant, utilizing the modern stack (React 19, Vite 7, Tailwind 4, Bun, Radix UI).

## 1. Core Principles & Standards

- **Type Safety:** Eliminate `any`. Use **ArkType** for runtime validation and TypeScript interfaces for all Inertia props.
- **Component Architecture:** Follow **Atomic Design**. Logic-heavy components go in `features/`, pure UI primitives go in `components/ui/`.
- **React 19 Patterns:** Use `useActionState`, `useOptimistic`, and the **React Compiler** (no manual `useMemo`/`useCallback` unless necessary).
- **Styling:** Use **Tailwind 4** engine. Use `cn()` utility (clsx + tailwind-merge) for all dynamic classes.
- **State Management:** **Zustand** for global UI state; **Inertia `useForm**` for server-side state.

---

## 2. Refactoring Execution Steps

### Phase 1: Infrastructure & Utilities

1. **Utility Setup:** Create `resources/js/lib/utils.ts` to export a `cn` function using `clsx` and `tailwind-merge`.
2. **Theme Provider:** Ensure `next-themes` is integrated for dark/light mode consistency across Radix primitives.
3. **Base Types:** Create `resources/js/types/index.d.ts` to define global `User`, `PageProps`, and `Pagination` types.

### Phase 2: UI Primitive Standardization (Radix + CVA)

1. Refactor all raw HTML elements to **Radix UI** primitives.
2. Implement **Class Variance Authority (CVA)** for components with multiple states (Buttons, Badges, Inputs).
3. Ensure all interactive elements have proper `aria-labels` and focus states for accessibility.

### Phase 3: Modernizing Forms (React 19 + Inertia)

1. Replace standard state-based forms with **Inertia `useForm**`.
2. Integrate **ArkType** schemas for client-side validation logic.
3. Implement **Sonner** for toast notifications on `onSuccess` and `onError` hooks.
4. Apply **Optimistic UI** updates for simple toggles (e.g., "mark as read").

### Phase 4: Performance & Scalability

1. **Code Splitting:** Ensure heavy libraries (like `react-easy-crop`) are imported dynamically.
2. **Zustand Optimization:** Use selectors in Zustand to prevent unnecessary re-renders.
3. **Vite 7 Optimization:** Ensure `@tailwindcss/vite` is correctly configured for the fastest HMR.

---

## 3. Implementation Instructions for AI

> **Action:** Analyze the current file and apply the following refactoring pattern:

### A. Component Template

```tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type typeName } from 'arktype';

const componentVariants = cva('base-styles', {
    variants: {
        intent: { primary: '...', secondary: '...' },
        size: { sm: '...', md: '...' },
    },
    defaultVariants: { intent: 'primary', size: 'md' },
});

export const Component = ({ className, intent, size, ...props }: Props) => (
    <div
        className={cn(componentVariants({ intent, size }), className)}
        {...props}
    />
);
```

### B. Clean Controller & Inertia Props (Laravel)

- Use **Spatie Laravel Data** or **API Resources** to ensure the frontend receives clean, camelCase JSON.
- Strictly define types for the `usePage<PageProps>().props` object.

---

## 4. Verification Checklist

- [ ] No TypeScript errors in the terminal (`bun x tsc`).
- [ ] ESLint passes with `eslint-config-prettier`.
- [ ] Components are responsive and accessible (keyboard navigable).
- [ ] Form submissions handle "Processing" and "Disabled" states correctly.
- [ ] Shared data (auth, flash) is typed and globally accessible.
