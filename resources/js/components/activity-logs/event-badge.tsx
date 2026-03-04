import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserLogEventType } from '@/types';

type EventBadgeProps = {
    eventType: UserLogEventType;
    className?: string;
};

const labels: Record<UserLogEventType, string> = {
    login: 'Login',
    logout: 'Logout',
    forced_logout: 'Forced Logout',
};

const variantClasses: Record<UserLogEventType, string> = {
    login:
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    logout: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    forced_logout:
        'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

export function EventBadge({ eventType, className }: EventBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn('font-medium', variantClasses[eventType], className)}
        >
            {labels[eventType]}
        </Badge>
    );
}
