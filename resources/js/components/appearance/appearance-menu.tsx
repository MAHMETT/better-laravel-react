import { useAppearanceStore } from '@/stores/appearance';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export type AppearanceVariant = 'light' | 'dark' | 'system';

interface AppearanceOption {
    value: AppearanceVariant;
    icon: LucideIcon;
    label: string;
    description?: string;
}

const appearanceOptions: AppearanceOption[] = [
    { value: 'light', icon: Sun, label: 'Light', description: 'Always light theme' },
    { value: 'dark', icon: Moon, label: 'Dark', description: 'Always dark theme' },
    { value: 'system', icon: Monitor, label: 'System', description: 'Follow system preference' },
];

export interface AppearanceMenuProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Layout orientation
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical';
    
    /**
     * Show descriptions
     * @default false
     */
    showDescriptions?: boolean;
    
    /**
     * Size variant
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
}

export function AppearanceMenu({
    className = '',
    orientation = 'horizontal',
    showDescriptions = false,
    size = 'md',
    ...props
}: AppearanceMenuProps) {
    const { appearance, setAppearance } = useAppearanceStore();

    const sizeClasses = {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-3.5 py-2 text-sm',
        lg: 'px-4 py-2.5 text-base',
    };

    const iconSizes = {
        sm: 'size-3.5',
        md: 'size-4',
        lg: 'size-5',
    };

    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
                orientation === 'vertical' && 'flex-col',
                className,
            )}
            role="radiogroup"
            aria-label="Appearance options"
            {...props}
        >
            {appearanceOptions.map(({ value, icon: Icon, label, description }) => (
                <button
                    key={value}
                    onClick={() => setAppearance(value)}
                    className={cn(
                        'group flex w-full items-center rounded-md transition-all duration-200',
                        sizeClasses[size],
                        appearance === value
                            ? 'bg-white shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-200',
                    )}
                    role="radio"
                    aria-checked={appearance === value}
                    aria-label={label}
                >
                    <Icon className={cn(iconSizes[size], 'flex-shrink-0')} />
                    <div className={cn('ml-2 flex flex-col', orientation === 'vertical' && 'flex-1')}>
                        <span className="font-medium">{label}</span>
                        {showDescriptions && description && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                {description}
                            </span>
                        )}
                    </div>
                    {appearance === value && (
                        <div className="ml-auto pl-2">
                            <div className={cn(
                                'rounded-full bg-current opacity-20',
                                iconSizes[size],
                            )} />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
