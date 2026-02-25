import { Link } from '@inertiajs/react';
import { memo, useMemo } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { MainNavItem } from '@/types';

interface NavMainProps {
    items: MainNavItem;
    role: string;
}

export const NavMain = memo(function NavMain({ items, role }: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();

    // ✅ Memoize role items
    const roleItems = useMemo(() => {
        const data = items?.[role];
        return Array.isArray(data) ? data : [];
    }, [items, role]);

    // ✅ Stop render kalau kosong
    if (roleItems.length === 0) return null;

    return (
        <>
            {roleItems.map((group) => {
                if (!Array.isArray(group.items) || group.items.length === 0)
                    return null;

                return (
                    <SidebarGroup key={group.title} className="px-2 py-0">
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>

                        <SidebarMenu>
                            {group.items.map((navItem) => (
                                <SidebarMenuItem key={navItem.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(navItem.href)}
                                        tooltip={{
                                            children: navItem.title,
                                        }}
                                    >
                                        <Link href={navItem.href} prefetch>
                                            {navItem.icon && <navItem.icon />}
                                            <span>{navItem.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                );
            })}
        </>
    );
});
