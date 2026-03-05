import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { create } from 'zustand';
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
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

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
    setShowLogoutDialog: (showLogoutDialog) => set({ showLogoutDialog }),
    setIsLoggingOut: (isLoggingOut) => set({ isLoggingOut }),
    reset: () => set({ showLogoutDialog: false, isLoggingOut: false }),
}));

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const showLogoutDialog = useLogoutDialogStore((state) => state.showLogoutDialog);
    const isLoggingOut = useLogoutDialogStore((state) => state.isLoggingOut);
    const setShowLogoutDialog = useLogoutDialogStore((state) => state.setShowLogoutDialog);
    const setIsLoggingOut = useLogoutDialogStore((state) => state.setIsLoggingOut);
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
                    onFinish: () => resolve(),
                    onError: (error) => reject(error),
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
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button
                    type="button"
                    className="block w-full cursor-pointer text-left"
                    onClick={handleLogoutClick}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </button>
            </DropdownMenuItem>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to logout? You will need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoggingOut} onClick={handleLogoutCancel}>
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
