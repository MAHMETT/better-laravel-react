import { dashboard } from '@/routes';
import type { FooterNavItem, MainNavItem } from '@/types';
import { BookOpenIcon, FolderIcon, LayoutGridIcon } from 'lucide-react';

export const mainNavItems: MainNavItem = {
    admin: [
        {
            title: 'platform',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGridIcon,
                },
            ],
        },
        {
            title: 'platform',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGridIcon,
                },
            ],
        },
        {
            title: 'platform',
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
            title: 'platform',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGridIcon,
                },
            ],
        },
        {
            title: 'platform',
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
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderIcon,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpenIcon,
        },
    ],
};
