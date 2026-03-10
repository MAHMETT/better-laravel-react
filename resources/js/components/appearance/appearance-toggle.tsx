import { useAppearanceStore } from '@/stores/appearance';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

export interface AppearanceToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Display variant
     * @default 'icon'
     */
    variant?: 'icon' | 'icon-label' | 'icon-cycle';

    /**
     * Size variant
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
}

const ICON_SIZES = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
} as const;

const BUTTON_SIZES = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
} as const;

const getLabel = (
    variant: 'icon' | 'icon-label' | 'icon-cycle',
    appearance: 'light' | 'dark' | 'system',
    resolvedAppearance: 'light' | 'dark'
): string => {
    if (variant === 'icon-cycle') {
        return `Current: ${appearance} mode. Click to change`;
    }
    return `Currently ${resolvedAppearance} mode. Click to toggle`;
};

export function AppearanceToggle({
    className = '',
    variant = 'icon',
    size = 'md',
    ...props
}: AppearanceToggleProps) {
    const { appearance, setAppearance, resolvedAppearance } = useAppearanceStore();

    const handleClick = () => {
        if (variant === 'icon-cycle') {
            const next = appearance === 'light' ? 'dark' : appearance === 'dark' ? 'system' : 'light';
            setAppearance(next);
        } else {
            setAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
        }
    };

    const label = getLabel(variant, appearance, resolvedAppearance);

    const renderIcon = () => {
        if (variant === 'icon-cycle') {
            switch (appearance) {
                case 'light':
                    return <Sun className={cn(ICON_SIZES[size], 'transition-transform duration-200')} />;
                case 'dark':
                    return <Moon className={cn(ICON_SIZES[size], 'transition-transform duration-200')} />;
                case 'system':
                    return <Monitor className={cn(ICON_SIZES[size], 'transition-transform duration-200')} />;
            }
        }
        return resolvedAppearance === 'dark' 
            ? <Moon className={cn(ICON_SIZES[size], 'transition-transform duration-200')} />
            : <Sun className={cn(ICON_SIZES[size], 'transition-transform duration-200')} />;
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-xs transition-all hover:bg-neutral-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:focus:ring-neutral-600',
                BUTTON_SIZES[size],
                className,
            )}
            aria-label={label}
            title={label}
            {...props}
        >
            {renderIcon()}
            {variant === 'icon-label' && (
                <span className="ml-2 text-sm font-medium">
                    {resolvedAppearance === 'dark' ? 'Dark' : 'Light'}
                </span>
            )}
        </button>
    );
}
