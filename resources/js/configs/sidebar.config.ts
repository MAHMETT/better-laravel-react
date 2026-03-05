import { dashboard } from '@/routes';
import activityLogs from '@/routes/activity-logs';
import users from '@/routes/users';
import type { FooterNavItem, MainNavItem } from '@/types';
import { HistoryIcon, LayoutGridIcon, UsersIcon } from 'lucide-react';

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
