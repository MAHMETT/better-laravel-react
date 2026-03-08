import { AdminLogFilters } from '@/components/activity-logs/admin-log-filters';
import { LogTable } from '@/components/activity-logs/log-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Paginations } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import {
    selectAdminUserLogFilters,
    selectAdminUserLogLoading,
    useAdminUserLogStore,
} from '@/stores/admin-user-log-store';
import activityLogs from '@/routes/activity-logs';
import users from '@/routes/users';
import type {
    AdminUserLogFilters,
    BreadcrumbItem,
    PaginatedData,
    UserLog,
    UserLogUser,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type FilterQueryParams = Record<string, string | number | number[]>;

interface Props {
    user: UserLogUser;
    logs: PaginatedData<UserLog>;
    filters: AdminUserLogFilters;
    schema_ready?: boolean;
}

export default function AdminUserActivityLogs({
    user,
    logs,
    filters,
    schema_ready = true,
}: Props) {
    const storeFilters = useAdminUserLogStore(selectAdminUserLogFilters);
    const isLoading = useAdminUserLogStore(selectAdminUserLogLoading);
    const initialize = useAdminUserLogStore((state) => state.initialize);
    const setFilters = useAdminUserLogStore((state) => state.setFilters);
    const setIsLoading = useAdminUserLogStore((state) => state.setIsLoading);
    const setCurrentPage = useAdminUserLogStore(
        (state) => state.setCurrentPage,
    );
    const reset = useAdminUserLogStore((state) => state.reset);
    const getFilterParams = useAdminUserLogStore(
        (state) => state.getFilterParams,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: users.index.url(),
        },
        {
            title: user.name,
            href: users.show.url({ user: user.id }),
        },
        {
            title: 'Activity Logs',
            href: activityLogs.user.url({ user: user.id }),
        },
    ];

    useEffect(() => {
        initialize(filters, logs.current_page);
    }, [filters, logs.current_page, initialize]);

    useEffect(() => {
        setCurrentPage(logs.current_page);
    }, [logs.current_page, setCurrentPage]);

    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    const runFilterRequest = (params: FilterQueryParams): void => {
        const toastId = toast.loading('Loading user activity logs...');
        setIsLoading(true);

        router.get(activityLogs.user.url({ user: user.id }), params, {
            preserveScroll: true,
            replace: true,
            onError: (errors) => {
                const message =
                    Object.values(errors).join(', ') ||
                    'Failed to load user activity logs.';
                toast.error(message, { id: toastId });
            },
            onSuccess: () => {
                toast.success('User activity logs refreshed.', { id: toastId });
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const handleApply = (): void => {
        runFilterRequest(getFilterParams());
    };

    const handleClear = (): void => {
        const toastId = toast.loading('Resetting filters...');
        setIsLoading(true);

        router.get(
            activityLogs.user.url({ user: user.id }),
            {},
            {
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
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Activity Logs - ${user.name}`} />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {user.name} Activity Logs
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Login and logout activity for {user.email}.
                    </p>
                </div>

                <AdminLogFilters
                    filters={storeFilters}
                    selectedUserCount={0}
                    onFiltersChange={setFilters}
                    onOpenUserFilter={() => undefined}
                    onClearUserFilter={() => undefined}
                    onApply={handleApply}
                    onClear={handleClear}
                    disabled={isLoading}
                    showUserFilter={false}
                />

                {!schema_ready && (
                    <Alert variant="destructive">
                        <AlertTitle>Activity Log Table Missing</AlertTitle>
                        <AlertDescription>
                            Run{' '}
                            <code>php artisan migrate --no-interaction</code> to
                            create the <code>user_logs</code> table.
                        </AlertDescription>
                    </Alert>
                )}

                <LogTable
                    logs={logs.data}
                    isLoading={isLoading}
                    showUser={false}
                />

                <Paginations
                    pagination={logs}
                    onNavigateStart={() => {
                        setIsLoading(true);
                    }}
                    onNavigateFinish={() => {
                        setIsLoading(false);
                    }}
                />
            </div>
        </AppLayout>
    );
}
