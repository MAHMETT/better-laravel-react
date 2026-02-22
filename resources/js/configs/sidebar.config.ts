import { dashboard } from '@/routes';
import type { NavItem, RoleNavItem } from '@/types';
import { BookOpenIcon, FolderIcon, LayoutGridIcon } from 'lucide-react';

export const mainNavItems: RoleNavItem = {
    admin: [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGridIcon,
        },
    ],
    user: [
        {
            title: 'Dashboar',
            href: dashboard(),
            icon: LayoutGridIcon,
        },
    ],
};

export const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderIcon,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpenIcon,
    },
];
