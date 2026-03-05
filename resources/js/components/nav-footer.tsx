import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { isExternalUrl } from '@/lib/url';
import { toUrl } from '@/lib/utils';
import type { FooterNavItem } from '@/types';
import { Link } from '@inertiajs/react';
import type { ComponentPropsWithoutRef } from 'react';
import { memo, useMemo } from 'react';

interface NavFooterProps extends ComponentPropsWithoutRef<typeof SidebarGroup> {
    items: FooterNavItem;
    role: string;
}

export const NavFooter = memo(function NavFooter({
    items,
    role,
    className,
    ...props
}: NavFooterProps) {
    // ✅ Cache role items
    const roleItems = useMemo(() => {
        const data = items?.[role];
        return Array.isArray(data) ? data : [];
    }, [items, role]);

    if (roleItems.length === 0) return null;

    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className ?? ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu>
                    {roleItems.map((item) => {
                        const href = toUrl(item.href);
                        const external = isExternalUrl(href);

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                >
                                    {external ? (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {item.icon && (
                                                <item.icon className="h-5 w-5" />
                                            )}
                                            <span>{item.title}</span>
                                        </a>
                                    ) : (
                                        <Link href={href} prefetch>
                                            {item.icon && (
                                                <item.icon className="h-5 w-5" />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
});
