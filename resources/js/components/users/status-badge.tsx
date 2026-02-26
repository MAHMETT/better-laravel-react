import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: 'enable' | 'disable';
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                status === 'enable'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                className
            )}
        >
            {status === 'enable' ? 'Enabled' : 'Disabled'}
        </span>
    );
}
