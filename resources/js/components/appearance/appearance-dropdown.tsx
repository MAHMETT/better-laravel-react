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
    description: string;
}

const appearanceOptions: AppearanceOption[] = [
    { value: 'light', icon: Sun, label: 'Light', description: 'Always light theme' },
    { value: 'dark', icon: Moon, label: 'Dark', description: 'Always dark theme' },
    { value: 'system', icon: Monitor, label: 'System', description: 'Follow device settings' },
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
    const { appearance, setAppearance, resolvedAppearance } = useAppearanceStore();

    const currentOption = appearanceOptions.find((opt) => opt.value === appearance);
    const CurrentIcon = currentOption?.icon ?? Sun;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    'inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:ring-neutral-600',
                    className,
                )}
                {...props}
            >
                <CurrentIcon className="size-4" />
                {showCurrent && (
                    <>
                        <span>{currentOption?.label}</span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {resolvedAppearance === 'dark' ? 'Dark' : 'Light'}
                        </span>
                    </>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} sideOffset={sideOffset}>
                {appearanceOptions.map(({ value, icon: Icon, label, description }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => setAppearance(value)}
                        className={cn(
                            'flex cursor-pointer items-start gap-3 p-3',
                            appearance === value && 'bg-neutral-100 dark:bg-neutral-700',
                        )}
                    >
                        <Icon className="mt-0.5 size-4 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-medium">{label}</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {description}
                            </span>
                        </div>
                        {appearance === value && (
                            <span className="ml-auto text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Active
                            </span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
