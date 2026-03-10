import { usePage, router } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { create } from 'zustand';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';

interface LogoutDialogState {
    showLogoutDialog: boolean;
    isLoggingOut: boolean;
    setShowLogoutDialog: (show: boolean) => void;
    setIsLoggingOut: (loading: boolean) => void;
    reset: () => void;
}

const useLogoutDialogStore = create<LogoutDialogState>((set) => ({
    showLogoutDialog: false,
    isLoggingOut: false,
    setShowLogoutDialog: (showLogoutDialog) => {
        set({ showLogoutDialog });
    },
    setIsLoggingOut: (isLoggingOut) => {
        set({ isLoggingOut });
    },
    reset: () => {
        set({ showLogoutDialog: false, isLoggingOut: false });
    },
}));

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const cleanup = useMobileNavigation();
    
    const showLogoutDialog = useLogoutDialogStore(
        (state) => state.showLogoutDialog,
    );
    const isLoggingOut = useLogoutDialogStore((state) => state.isLoggingOut);
    const setShowLogoutDialog = useLogoutDialogStore(
        (state) => state.setShowLogoutDialog,
    );
    const setIsLoggingOut = useLogoutDialogStore(
        (state) => state.setIsLoggingOut,
    );
    const resetStore = useLogoutDialogStore((state) => state.reset);

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    const handleLogoutConfirm = async () => {
        setShowLogoutDialog(false);
        setIsLoggingOut(true);

        cleanup();
        router.flushAll();

        try {
            await new Promise<void>((resolve, reject) => {
                router.visit(logout(), {
                    method: 'post',
                    onFinish: () => {
                        resolve();
                    },
                    onError: (error) => {
                        reject(error);
                    },
                });
            });

            toast.success('Logged out successfully');
        } catch {
            toast.error('Failed to logout. Please try again.');
            setIsLoggingOut(false);
        }
    };

    const handleLogoutCancel = () => {
        resetStore();
    };

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                                data-test="sidebar-menu-button"
                            >
                                <UserInfo user={auth.user} showRole />
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="end"
                            side={
                                isMobile
                                    ? 'bottom'
                                    : state === 'collapsed'
                                      ? 'left'
                                      : 'bottom'
                            }
                        >
                            <UserMenuContent user={auth.user} onLogoutClick={handleLogoutClick} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <AlertDialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to logout? You will need to
                            sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isLoggingOut}
                            onClick={handleLogoutCancel}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogoutConfirm}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
