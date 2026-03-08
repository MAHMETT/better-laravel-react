# 🏗️ Project Architecture & File Placement Workflow

**Objective:** Standardize the project structure to eliminate code duplication, ensure maximum reusability, and implement global state (Zustand) and notifications (Sonner) according to local documentation.

## 1. Directory Structure Standards

> **Action:** Organize all files according to this hierarchy. Do not create duplicate logic across folders.

```text
resources/js/
├── components/
│   ├── ui/             # Atomic Shadcn/Radix primitives (Button, Input, Toast)
│   ├── shared/         # Reusable business components (FileUploader, UserAvatar)
│   └── layouts/        # Inertia Persistent Layouts (Authenticated, Guest)
├── features/           # Domain-specific logic (e.g., features/auth, features/profile)
│   ├── components/     # Components used ONLY in this feature
│   ├── hooks/          # Feature-specific hooks
│   └── services/       # Feature-specific API/logic logic
├── hooks/              # Global reusable hooks (useMediaQuery, useDebounce)
├── lib/                # Third-party configs (, utils.ts, arktype.ts)
├── pages/              # Inertia Page entries (Keep these thin, import from features/)
├── stores/             # Zustand Global Stores (Refer to docs/zustand/*)
└── types/              # Global TypeScript definitions & Inertia Props

```

---

## 2. Rules for Reusability & Clean Code

- **DRY (Don't Repeat Yourself):** If a piece of logic or a UI pattern is used more than twice, move it to `components/shared/` or `hooks/`.
- **Single Source of Truth for Types:** Define models (e.g., `User`, `Product`) in `types/models.ts`. Do not redefine props locally in components.
- **Prop Forwarding:** All UI primitives in `components/ui/` must use `React.forwardRef` and spread `...props` to support Radix and Framer Motion.
- **Zustand Implementation:** _ Refer to `docs/zustand/_` for store patterns.
- Use **Selectors** to prevent unnecessary re-renders: `const user = useUserStore(s => s.user)`.
- Keep stores small and focused (e.g., `useAuthStore`, `useConfigStore`).

---

## 3. High-Performance Toast (Sonner) Workflow

> **Action:** Follow `docs/toast.md` strictly. Use the `toast` object for all async feedback.

- **Standard Implementation:** Can Use `toast.promise()`,`toast.success()`, `toast.error()`, or `toast.warning()`.
- **Promise-based Toasts:** For Inertia visits or form submissions, use:

```tsx
toast.promise(saveData(), {
    loading: 'Saving changes...',
    success: (data) => `Updated ${data.name} successfully`,
    error: 'Failed to save',
});
```

- **Consistency:** Never use `alert()` or custom local state for notifications. Use the global Sonner instance.

---

## 4. AI Coding Instructions (Copy-Paste to Prompt)

> "Refactor the current file/feature following the **Architecture Workflow**:
>
> 1. Move UI primitives to `resources/js/components/ui/`.
> 2. Extract global state logic into a Zustand store in `resources/js/stores/` (check `docs/zustand/` for syntax).
> 3. Centralize all Types/Interfaces into `resources/js/types/`.
> 4. Ensure all feedback uses **Sonner** as defined in `docs/toast.md`.
> 5. Use `cn()` for all tailwind classes to ensure Tailwind 4 compatibility.
> 6. Eliminate any hardcoded variables that exist elsewhere in the project."

---

## 5. Global Config Check

- **Bun Runtime:** Ensure all commands suggested by AI use `bun` (e.g., `bun add`, `bun x`).
- **React 19:** Ensure the AI uses the new `use` hook or `ActionState` instead of old `useEffect` patterns for data fetching where applicable.
