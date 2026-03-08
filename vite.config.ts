import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        // Enable minification
        minify: 'esbuild',
        // Generate sourcemaps for production debugging
        sourcemap: false,
        // Target modern browsers
        target: 'esnext',
        // Reduce bundle size
        cssMinify: 'lightningcss',
        // Code splitting configuration
        rollupOptions: {
            output: {
                // Manual chunks for better caching
                manualChunks: {
                    // Framework vendors
                    'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
                    // Inertia
                    'inertia-vendor': ['@inertiajs/react'],
                    // Radix UI primitives
                    'radix-vendor': [
                        '@radix-ui/react-alert-dialog',
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-collapsible',
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-label',
                        '@radix-ui/react-navigation-menu',
                        '@radix-ui/react-select',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-slider',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-toggle',
                        '@radix-ui/react-toggle-group',
                        '@radix-ui/react-tooltip',
                        'radix-ui',
                    ],
                    // Utilities
                    'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
                    // State management
                    'state-vendor': ['zustand'],
                    // Data fetching
                    'query-vendor': ['@tanstack/react-query', 'axios'],
                    // Forms and validation
                    'forms-vendor': ['arktype', 'input-otp'],
                    // Icons (tree-shaken)
                    'icons-vendor': ['lucide-react'],
                    // Routing
                    'routing-vendor': ['@laravel/vite-plugin-wayfinder'],
                },
                // Asset naming
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@inertiajs/react',
            'zustand',
            '@tanstack/react-query',
            'axios',
            'clsx',
            'tailwind-merge',
        ],
        exclude: ['lucide-react'], // Already tree-shaken
    },
});
