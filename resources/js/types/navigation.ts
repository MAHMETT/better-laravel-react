import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

export type SidebarNav = {
    title: string;
    items: NavItem[];
};

export type MainNavItem = {
    [key: string]: SidebarNav[];
};

export type FooterNavItem = {
    [key: string]: NavItem[];
};
