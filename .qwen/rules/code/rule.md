# 🛡️ The "Bulletproof" Fullstack Code Rules

## 1. TypeScript & React (Frontend)

### **Type Safety & Integrity**

- **Zero `any` Policy:** The use of `any` is strictly prohibited. Use `unknown` if the type is truly unknown, then perform _type narrowing_.
- **Discriminated Unions:** Use unions for complex states (e.g., `status: 'loading' | 'success' | 'error'`) instead of multiple booleans.
- **Exhaustive Checking:** Use `switch-case` blocks with a `default: never` check to ensure all union members are handled.
- **Contract Validation:** All data received from the API **must** be validated at the entry point using **ArkType** or **Zod** before entering the application state.

### **Performance & Rendering**

- **Atomic Selectors:** In Zustand, never fetch the entire store. Use specific selectors: `const user = useAuthStore(s => s.user)`.
- **Memoization Strategy:** Use `useMemo` for expensive calculations and `useCallback` for functions passed to `React.memo` components.
- **Component Purity:** Components must be pure. Side effects must reside within `useEffect` or custom hooks.
- **Virtualization:** Use `tanstack-virtual` for rendering lists exceeding 100 items to maintain high FPS.

---

## 2. Laravel & PHP (Backend)

### **Strict Typing PHP 8.2+**

- **Typed Properties:** All class properties, parameters, and return types must be explicitly defined.
- **Data Transfer Objects (DTO):** Passing raw `Arrays` between layers (Controller to Service) is prohibited. Use DTO classes to ensure data structure integrity.

### **Query Optimization**

- **No N+1 Queries:** Eager loading using `with()` is mandatory. Use a Query Monitor during development for early detection.
- **Selective Selection:** Always use `select(['id', 'name'])` instead of `select('*')` to save server RAM.
- **Database Indexing:** Every column used in `where()`, `orderBy()`, or `join()` must have an Index defined in the migration.

---

## 3. Error Handling & UX

- **Graceful Failures:** Use React `ErrorBoundary` to catch component crashes so they don't break the entire application.
- **Consistency:** Laravel error responses must follow a standard format: `{ message: string, errors: Record<string, string[]> }`.
- **Optimistic UI:** For small actions (toggling status, deleting items), use _optimistic updates_ in TanStack Query to make the app feel instant.

---

## 4. Folder & File Structure

- **Feature-Based Folder:** Group logic by feature, not by file type (e.g., `Features/PPDB/Components`, `Features/PPDB/Hooks`).
- **Single Responsibility:** One file, one primary component/function. If a file exceeds 200 lines, split it into sub-components.

---

## 🛠️ AI Instruction Prompt (Internalize these rules)

Copy this into your AI Coder (Cursor/Copilot/Qwen):

> **"You are acting as a Senior Fullstack Engineer. Follow these rules strictly:**
>
> 1. **TS:** Enable maximum strictness. Zero `any`. Use `Interface` for all props and API responses. Implement `noUncheckedIndexedAccess` logic.
> 2. **React:** Use functional components with `Persistent Layouts`. Optimize re-renders using `useMemo` and Zustand selectors.
> 3. **Laravel:** Use `declare(strict_types=1)`. All methods must have visibility modifiers, parameters, and return types. Use DTOs for data flow.
> 4. **Performance:** Prioritize code-splitting and small bundle sizes. Every line of code must be essential and efficient.
>
> If you detect any violation of these rules in my current code, point it out and refactor it immediately to meet these standards."
