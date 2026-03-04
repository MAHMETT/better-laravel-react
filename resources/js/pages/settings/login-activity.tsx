import { LogTable } from '@/components/activity-logs/log-table';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paginations } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import loginActivity from '@/routes/login-activity';
import type {
    BreadcrumbItem,
    PaginatedData,
    SelfUserLogFilters,
    UserLog,
} from '@/types';
import {
    selectSelfUserLogFilters,
    selectSelfUserLogLoading,
    useSelfUserLogStore,
} from '@/stores/self-user-log-store';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Props = {
    logs: PaginatedData<UserLog>;
    filters: SelfUserLogFilters;
    schema_ready?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Login Activity',
        href: loginActivity.index.url(),
    },
];

export default function LoginActivity({
    logs,
    filters,
    schema_ready = true,
}: Props) {
    const storeFilters = useSelfUserLogStore(selectSelfUserLogFilters);
    const isLoading = useSelfUserLogStore(selectSelfUserLogLoading);
    const initialize = useSelfUserLogStore((state) => state.initialize);
    const setFilters = useSelfUserLogStore((state) => state.setFilters);
    const setIsLoading = useSelfUserLogStore((state) => state.setIsLoading);
    const reset = useSelfUserLogStore((state) => state.reset);
    const getFilterParams = useSelfUserLogStore((state) => state.getFilterParams);

    useEffect(() => {
        initialize(filters);
    }, [filters, initialize]);

    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    const runFilterRequest = (params: Record<string, string>) => {
        const toastId = toast.loading('Loading login activity...');
        setIsLoading(true);

        router.get(loginActivity.index.url(), params, {
            preserveScroll: true,
            replace: true,
            onError: (errors) => {
                const message =
                    Object.values(errors).join(', ') ||
                    'Failed to load login activity.';
                toast.error(message, { id: toastId });
            },
            onSuccess: () => {
                toast.success('Login activity refreshed.', { id: toastId });
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const handleApply = () => {
        runFilterRequest(getFilterParams());
    };

    const handleClear = () => {
        const toastId = toast.loading('Resetting filters...');
        setIsLoading(true);

        router.get(loginActivity.index.url(), {}, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                toast.success('Filters reset.', { id: toastId });
            },
            onError: () => {
                toast.error('Failed to reset filters.', { id: toastId });
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Login Activity" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Login Activity"
                        description="Review your recent account sign-ins and sign-outs."
                    />

                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="event_type">Event</Label>
                                <Select
                                    value={storeFilters.event_type || 'all'}
                                    onValueChange={(value) =>
                                        setFilters({
                                            event_type:
                                                value === 'all' ? '' : value,
                                        })
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="event_type">
                                        <SelectValue placeholder="All events" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All events
                                        </SelectItem>
                                        <SelectItem value="login">
                                            Login
                                        </SelectItem>
                                        <SelectItem value="logout">
                                            Logout
                                        </SelectItem>
                                        <SelectItem value="forced_logout">
                                            Forced Logout
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date from</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={storeFilters.date_from}
                                    onChange={(event) =>
                                        setFilters({
                                            date_from: event.target.value,
                                        })
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_to">Date to</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={storeFilters.date_to}
                                    onChange={(event) =>
                                        setFilters({ date_to: event.target.value })
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="per_page">Rows</Label>
                                <Select
                                    value={String(storeFilters.per_page)}
                                    onValueChange={(value) =>
                                        setFilters({
                                            per_page: Number(value),
                                        })
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="per_page">
                                        <SelectValue placeholder="Rows per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button onClick={handleApply} disabled={isLoading}>
                                Apply filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                disabled={isLoading}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    {!schema_ready && (
                        <Alert variant="destructive">
                            <AlertTitle>Activity Log Table Missing</AlertTitle>
                            <AlertDescription>
                                Run{' '}
                                <code>php artisan migrate --no-interaction</code>{' '}
                                to create the <code>user_logs</code> table.
                            </AlertDescription>
                        </Alert>
                    )}

                    <LogTable logs={logs.data} isLoading={isLoading} showUser={false} />

                    <Paginations
                        pagination={logs}
                        onNavigateStart={() => setIsLoading(true)}
                        onNavigateFinish={() => setIsLoading(false)}
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
