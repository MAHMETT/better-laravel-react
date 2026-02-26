import {
    BookOpenIcon,
    FolderIcon,
    LayoutGridIcon,
    UsersIcon,
} from 'lucide-react';
import { dashboard } from '@/routes';
import users from '@/routes/users';
import type { FooterNavItem, MainNavItem } from '@/types';

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
                {
                    title: 'Users',
                    href: users.index.url(),
                    icon: UsersIcon,
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
