import { useAppearanceStore } from '@/stores/appearance';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

export interface AppearanceToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Show icon only or with label
     * @default 'icon'
     */
    variant?: 'icon' | 'icon-label' | 'icon-cycle';
    
    /**
     * Size variant
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
}

export function AppearanceToggle({
    className = '',
    variant = 'icon',
    size = 'md',
    ...props
}: AppearanceToggleProps) {
    const { appearance, setAppearance, resolvedAppearance } = useAppearanceStore();

    const getCurrentIcon = () => {
        if (variant === 'icon-cycle') {
            // Cycle through icons based on current appearance
            switch (appearance) {
                case 'light':
                    return Sun;
                case 'dark':
                    return Moon;
                case 'system':
                    return Monitor;
            }
        }
        // Show the resolved appearance icon
        return resolvedAppearance === 'dark' ? Moon : Sun;
    };

    const CurrentIcon = getCurrentIcon();

    const sizeClasses = {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
    };

    const buttonSizes = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    };

    const handleClick = () => {
        if (variant === 'icon-cycle') {
            // Cycle: light -> dark -> system -> light
            const next = appearance === 'light' ? 'dark' : appearance === 'dark' ? 'system' : 'light';
            setAppearance(next);
        } else {
            // Toggle between light and dark
            setAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
        }
    };

    const getLabel = () => {
        if (variant === 'icon-cycle') {
            return `Current: ${appearance} mode. Click to change`;
        }
        return `Currently ${resolvedAppearance} mode. Click to toggle`;
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-xs transition-all hover:bg-neutral-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:focus:ring-neutral-600',
                buttonSizes[size],
                className,
            )}
            aria-label={getLabel()}
            title={getLabel()}
            {...props}
        >
            <CurrentIcon className={cn(sizeClasses[size], 'transition-transform duration-200')} />
            {variant === 'icon-label' && (
                <span className="ml-2 text-sm font-medium">
                    {resolvedAppearance === 'dark' ? 'Dark' : 'Light'}
                </span>
            )}
        </button>
    );
}
