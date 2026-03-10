import { useEffect, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SessionTimeoutWarningProps {
    /**
     * Warning time before session expires (in seconds)
     * @default 300 (5 minutes)
     */
    warningTime?: number;

    /**
     * Check interval (in seconds)
     * @default 60 (1 minute)
     */
    checkInterval?: number;
}

/**
 * Session timeout warning component
 * Shows a warning before session expires and offers to extend session
 */
export function SessionTimeoutWarning({
    warningTime = 300,
    checkInterval = 60,
}: SessionTimeoutWarningProps) {
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(warningTime);
    const [lastActivity, setLastActivity] = useState(() => Date.now());

    const extendSession = useCallback(() => {
        // Make a simple request to extend session
        fetch('/api/ping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        })
            .then(() => {
                setLastActivity(Date.now());
                setIsWarningOpen(false);
                setTimeRemaining(warningTime);
                toast.success('Session extended', {
                    description: 'Your session has been extended.',
                    duration: 3000,
                });
            })
            .catch(() => {
                toast.error('Failed to extend session', {
                    description: 'Please save your work and refresh the page.',
                    duration: 8000,
                    action: {
                        label: 'Refresh',
                        onClick: () => {
                            window.location.reload();
                        },
                    },
                });
            });
    }, [warningTime]);

    const handleStayLoggedIn = useCallback(() => {
        extendSession();
    }, [extendSession]);

    const handleLogout = useCallback(() => {
        router.post('/logout', undefined, {
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        const updateActivity = () => {
            setLastActivity(Date.now());
        };

        // Track user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach((event) => {
            window.addEventListener(event, updateActivity);
        });

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, updateActivity);
            });
        };
    }, []);

    useEffect(() => {
        const checkSession = () => {
            const now = Date.now();
            const timeSinceActivity = Math.floor((now - lastActivity) / 1000);
            const timeLeft = warningTime - timeSinceActivity;

            if (timeLeft <= 0 && !isWarningOpen) {
                // Session has expired
                setIsWarningOpen(true);
                setTimeRemaining(0);
            } else if (timeLeft <= 60 && timeLeft > 0 && !isWarningOpen) {
                // Show warning in last minute
                setIsWarningOpen(true);
                setTimeRemaining(timeLeft);
            } else if (timeLeft > 60) {
                setIsWarningOpen(false);
            }

            if (isWarningOpen && timeLeft > 0) {
                setTimeRemaining(timeLeft);
            }
        };

        const interval = setInterval(checkSession, checkInterval * 1000);
        return () => clearInterval(interval);
    }, [lastActivity, warningTime, checkInterval, isWarningOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AlertDialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your session will expire due to inactivity.
                        {timeRemaining > 0 ? (
                            <div className="mt-4 rounded-md bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                                <p className="font-medium">Time remaining: {formatTime(timeRemaining)}</p>
                                <p className="mt-1 text-sm">
                                    Click "Stay Logged In" to continue your session.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                <p className="font-medium">Your session has expired</p>
                                <p className="mt-1 text-sm">
                                    Please choose to stay logged in or log out.
                                </p>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                    >
                        Log Out
                    </Button>
                    <AlertDialogAction onClick={handleStayLoggedIn}>
                        Stay Logged In
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default SessionTimeoutWarning;
