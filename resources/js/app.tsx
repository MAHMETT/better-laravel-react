import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import { TanStackQueryProvider } from '@/providers/tanstack-query-provider';
import { setupErrorInterceptor } from '@/lib/inertia-error-interceptor';
import '../css/app.css';
import { initializeTheme } from '@/hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Setup global error interceptor
        setupErrorInterceptor();

        root.render(
            <StrictMode>
                <ErrorBoundary>
                    <TanStackQueryProvider>
                        <App {...props} />
                        <Toaster />
                    </TanStackQueryProvider>
                </ErrorBoundary>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
