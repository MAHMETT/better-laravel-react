import { cn } from '@/lib/utils';

interface RoleBadgeProps {
    role: 'admin' | 'user';
    className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                role === 'admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                className
            )}
        >
            {role === 'admin' ? 'Admin' : 'User'}
        </span>
    );
}
