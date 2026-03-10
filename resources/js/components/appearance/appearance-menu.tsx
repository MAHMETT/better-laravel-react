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
    description: string;
}

const appearanceOptions: AppearanceOption[] = [
    { value: 'light', icon: Sun, label: 'Light', description: 'Always use light theme' },
    { value: 'dark', icon: Moon, label: 'Dark', description: 'Always use dark theme' },
    { value: 'system', icon: Monitor, label: 'System', description: 'Follow device settings' },
];

const MENU_SIZES = {
    sm: { button: 'px-2.5 py-1.5', text: 'text-xs', icon: 'size-3.5', gap: 'gap-2' },
    md: { button: 'px-3.5 py-2', text: 'text-sm', icon: 'size-4', gap: 'gap-2.5' },
    lg: { button: 'px-4 py-2.5', text: 'text-base', icon: 'size-5', gap: 'gap-3' },
} as const;

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
    const sizes = MENU_SIZES[size];

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
                        sizes.button,
                        appearance === value
                            ? 'bg-white shadow-sm text-neutral-900 dark:bg-neutral-700 dark:text-white'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-200',
                    )}
                    role="radio"
                    aria-checked={appearance === value}
                    aria-label={label}
                >
                    <Icon className={cn(sizes.icon, 'flex-shrink-0')} />
                    <div className={cn('ml-2 flex flex-col', orientation === 'vertical' && 'flex-1')}>
                        <span className={cn('font-medium', sizes.text)}>{label}</span>
                        {showDescriptions && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                {description}
                            </span>
                        )}
                    </div>
                    {appearance === value && (
                        <div className="ml-auto pl-2">
                            <div className={cn(
                                'rounded-full bg-current opacity-20',
                                sizes.icon,
                            )} />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
