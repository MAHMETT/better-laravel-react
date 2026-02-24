import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { MainNavItem } from '@/types';
import { Link } from '@inertiajs/react';

export function NavMain({ items, role }: { items: MainNavItem; role: string }) {
    const { isCurrentUrl } = useCurrentUrl();
    return (
        <>
            {items[role].map((item, index) => (
                <SidebarGroup key={index} className="px-2 py-0">
                    <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {item.items.map((navItem) => {
                            return (
                                <SidebarMenuItem key={navItem.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(navItem.href)}
                                        tooltip={{ children: navItem.title }}
                                    >
                                        <Link href={navItem.href} prefetch>
                                            {navItem.icon && <navItem.icon />}
                                            <span>{navItem.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
