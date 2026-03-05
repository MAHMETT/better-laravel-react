import { dashboard } from '@/routes';
import activityLogs from '@/routes/activity-logs';
import analytics from '@/routes/analytics';
import users from '@/routes/users';
import type { FooterNavItem, MainNavItem } from '@/types';
import { BarChart3Icon, HistoryIcon, LayoutGridIcon, UsersIcon } from 'lucide-react';

export const mainNavItems: MainNavItem = {
    admin: [
        {
            title: 'Platform',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGridIcon,
                },
            ],
        },
    ],
    user: [
        {
            title: 'Platform',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGridIcon,
                },
            ],
        },
    ],
};

export const footerNavItems: FooterNavItem = {
    admin: [
        {
            title: 'Analytics',
            href: analytics.index.url(),
            icon: BarChart3Icon,
        },
        {
            title: 'Users',
            href: users.index.url(),
            icon: UsersIcon,
        },
        {
            title: 'Activity Logs',
            href: activityLogs.index.url(),
            icon: HistoryIcon,
        },
    ],
};
