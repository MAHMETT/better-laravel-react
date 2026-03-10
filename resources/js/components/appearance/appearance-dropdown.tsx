import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAppearanceStore } from '@/stores/appearance';
import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

export type AppearanceVariant = 'light' | 'dark' | 'system';

interface AppearanceOption {
    value: AppearanceVariant;
    icon: LucideIcon;
    label: string;
}

const appearanceOptions: AppearanceOption[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
];

export interface AppearanceDropdownProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Show current appearance in trigger
     * @default true
     */
    showCurrent?: boolean;

    /**
     * Align dropdown content
     * @default 'end'
     */
    align?: 'start' | 'center' | 'end';

    /**
     * Side offset
     * @default 8
     */
    sideOffset?: number;
}

export function AppearanceDropdown({
    className = '',
    showCurrent = true,
    align = 'end',
    sideOffset = 8,
    ...props
}: AppearanceDropdownProps) {
    const { appearance, setAppearance } = useAppearanceStore();

    const currentOption = appearanceOptions.find(
        (opt) => opt.value === appearance,
    );
    const CurrentIcon = currentOption?.icon ?? Sun;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    'inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:ring-neutral-600',
                    className,
                )}
                {...props}
            >
                <CurrentIcon className="size-4" />
                {showCurrent && <span>{currentOption?.label}</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} sideOffset={sideOffset}>
                {appearanceOptions.map(({ value, icon: Icon, label }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => setAppearance(value)}
                        className={cn(
                            'flex cursor-pointer items-center gap-2',
                            appearance === value &&
                                'bg-neutral-100 dark:bg-neutral-700',
                        )}
                    >
                        <Icon className="size-4" />
                        <span>{label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
