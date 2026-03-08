# 🚀 Universal Fullstack Starter Kit: Performance & Architecture Guide

> **Stack:** Laravel 11 + Inertia.js + React + Zustand + TanStack Query

This document defines the core architecture for building scalable, high-performance web applications.

---

## 🏗️ 1. State Management Strategy

We categorize data into three distinct layers to ensure a "Single Source of Truth" and zero redundant renders.

| Layer               | Tool               | Responsibility                                                                             |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| **Server State**    | **TanStack Query** | Asynchronous data from APIs. Handles caching, background revalidation, and loading states. |
| **Client UI State** | **Zustand**        | Global ephemeral state (Sidebars, Modals, Themes, Auth context).                           |
| **Initial Props**   | **Inertia.js**     | Critical SSR data for first-paint and SEO metadata.                                        |

---

## 🛠️ 2. Architectural Pillars

### 🚨 Pillar #1: Optimized Networking (Axios Interceptors)

- **Singleton Instance:** All requests must pass through a pre-configured Axios instance.
- **Global Interceptors:** Handle 401 (Unauthorized), 422 (Validation), and 500 errors globally to reduce repetitive try-catch blocks in UI components.
- **Auto-JSON:** Ensure all headers and CSRF tokens are handled transparently.

### 🚨 Pillar #2: Strong Type Systems (Arch-Types)

- **Contract First:** Every API response must have a corresponding TypeScript `Interface` or `Type`.
- **Inertia Shared Props:** Define a global `SharedProps` type to ensure the AI and IDE know exactly what data Laravel is passing to the frontend (User, Permissions, Flash Messages).

### 🚨 Pillar #3: Smart Invalidation

- Every `POST/PUT/DELETE` operation via Inertia must trigger a `queryClient.invalidateQueries` to ensure the "Server State" is never out of sync with the UI.

---

## 📂 3. Technical Standards

### A. Global UI Store (`Zustand`)

Standardizes UI behavior across the entire application using high-performance selectors.

### B. Universal Data Hook (`TanStack Query`)

Abstraction layer for all data fetching to enable automatic caching, `stale-while-revalidate` logic, and optimized background updates.

---

## 🚀 4. Performance Checklist

1. **Persistent Layouts:** Prevent component unmounting during navigation.
2. **Partial Reloads:** Use Inertia `only` for targeted prop updates.
3. **Debounced Fetching:** Minimum 300ms delay for search-triggered network calls.
4. **Code Splitting:** Dynamic page imports via Vite to minimize the initial JS bundle.
