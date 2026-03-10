import { AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FormRestoredBannerProps {
    /**
     * Show the banner
     */
    show: boolean;

    /**
     * Callback when user wants to restore the saved data
     */
    onRestore?: () => void;

    /**
     * Callback when user wants to discard the saved data
     */
    onDiscard?: () => void;

    /**
     * Custom message
     */
    message?: string;
}

/**
 * Banner component to show when form data has been restored from localStorage
 */
export function FormRestoredBanner({
    show,
    onRestore,
    onDiscard,
    message = 'Unsaved form data was found from your previous session.',
}: FormRestoredBannerProps) {
    if (!show) return null;

    return (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
            <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 text-amber-600 dark:text-amber-500" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        {message}
                    </p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-500">
                        Your progress was automatically saved. You can continue
                        editing or discard the changes.
                    </p>
                </div>
                <div className="flex gap-2">
                    {onDiscard && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onDiscard}
                            className="h-8"
                        >
                            <Trash2 className="mr-1.5 size-3.5" />
                            Discard
                        </Button>
                    )}
                    {onRestore && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onRestore}
                            className="h-8"
                        >
                            <RotateCcw className="mr-1.5 size-3.5" />
                            Restore
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Simple toast notification for form restoration
 */
export function showFormRestoredToast(onDiscard?: () => void) {
    toast.success('Form data restored', {
        description: 'Your unsaved changes from the previous session have been restored.',
        duration: 8000,
        action: onDiscard
            ? {
                  label: 'Discard',
                  onClick: onDiscard,
              }
            : undefined,
    });
}
