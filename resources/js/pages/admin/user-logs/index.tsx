import { AdminLogFilters } from '@/components/activity-logs/admin-log-filters';
import { LogTable } from '@/components/activity-logs/log-table';
import { UserFilterModal } from '@/components/activity-logs/user-filter-modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Paginations } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import activityLogs from '@/routes/activity-logs';
import {
    selectAdminUserLogAppliedUserIds,
    selectAdminUserLogDialogOpen,
    selectAdminUserLogFilters,
    selectAdminUserLogLoading,
    selectAdminUserLogSelectedUserIds,
    selectAdminUserLogSelectedUsers,
    selectAdminUserLogUserListLoading,
    selectAdminUserLogUserListMeta,
    selectAdminUserLogUserOptions,
    selectAdminUserLogUserRoleFilter,
    selectAdminUserLogUserSearchKeyword,
    selectAdminUserLogUserStatusFilter,
    useAdminUserLogStore,
} from '@/stores/admin-user-log-store';
import type {
    AdminUserLogFilters,
    BreadcrumbItem,
    PaginatedData,
    UserFilterSearchResponse,
    UserLog,
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

type FilterQueryParams = Record<string, string | number | Array<number>>;

type Props = {
    logs: PaginatedData<UserLog>;
    filters: AdminUserLogFilters;
    schema_ready?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity Logs',
        href: activityLogs.index.url(),
    },
];

export default function AdminUserLogsIndex({
    logs,
    filters,
    schema_ready = true,
}: Props) {
    const storeFilters = useAdminUserLogStore(selectAdminUserLogFilters);
    const appliedUserIds = useAdminUserLogStore(selectAdminUserLogAppliedUserIds);
    const selectedUserIds = useAdminUserLogStore(selectAdminUserLogSelectedUserIds);
    const selectedUsers = useAdminUserLogStore(selectAdminUserLogSelectedUsers);
    const dialogOpen = useAdminUserLogStore(selectAdminUserLogDialogOpen);
    const userSearchKeyword = useAdminUserLogStore(
        selectAdminUserLogUserSearchKeyword,
    );
    const userRoleFilter = useAdminUserLogStore(selectAdminUserLogUserRoleFilter);
    const userStatusFilter = useAdminUserLogStore(
        selectAdminUserLogUserStatusFilter,
    );
    const userOptions = useAdminUserLogStore(selectAdminUserLogUserOptions);
    const userListMeta = useAdminUserLogStore(selectAdminUserLogUserListMeta);
    const isLoading = useAdminUserLogStore(selectAdminUserLogLoading);
    const isUserListLoading = useAdminUserLogStore(
        selectAdminUserLogUserListLoading,
    );

    const initialize = useAdminUserLogStore((state) => state.initialize);
    const setFilters = useAdminUserLogStore((state) => state.setFilters);
    const setIsLoading = useAdminUserLogStore((state) => state.setIsLoading);
    const setCurrentPage = useAdminUserLogStore((state) => state.setCurrentPage);
    const reset = useAdminUserLogStore((state) => state.reset);
    const getFilterParams = useAdminUserLogStore((state) => state.getFilterParams);
    const openUserFilterDialog = useAdminUserLogStore(
        (state) => state.openUserFilterDialog,
    );
    const closeUserFilterDialog = useAdminUserLogStore(
        (state) => state.closeUserFilterDialog,
    );
    const applyUserSelection = useAdminUserLogStore(
        (state) => state.applyUserSelection,
    );
    const clearAppliedUserFilter = useAdminUserLogStore(
        (state) => state.clearAppliedUserFilter,
    );
    const clearSelectedUsers = useAdminUserLogStore(
        (state) => state.clearSelectedUsers,
    );
    const setSelectedUserIds = useAdminUserLogStore(
        (state) => state.setSelectedUserIds,
    );
    const toggleSelectedUserId = useAdminUserLogStore(
        (state) => state.toggleSelectedUserId,
    );
    const setUserSearchKeyword = useAdminUserLogStore(
        (state) => state.setUserSearchKeyword,
    );
    const setUserRoleFilter = useAdminUserLogStore(
        (state) => state.setUserRoleFilter,
    );
    const setUserStatusFilter = useAdminUserLogStore(
        (state) => state.setUserStatusFilter,
    );
    const setIsUserListLoading = useAdminUserLogStore(
        (state) => state.setIsUserListLoading,
    );
    const replaceUserOptions = useAdminUserLogStore(
        (state) => state.replaceUserOptions,
    );
    const appendUserOptions = useAdminUserLogStore(
        (state) => state.appendUserOptions,
    );
    const setSelectedUsers = useAdminUserLogStore((state) => state.setSelectedUsers);
    const setUserListMeta = useAdminUserLogStore((state) => state.setUserListMeta);
    const getUserSearchParams = useAdminUserLogStore(
        (state) => state.getUserSearchParams,
    );

    const userRequestControllerRef = useRef<AbortController | null>(null);
    const userRequestSequenceRef = useRef(0);

    useEffect(() => {
        initialize(filters, logs.current_page);
    }, [filters, logs.current_page, initialize]);

    useEffect(() => {
        setCurrentPage(logs.current_page);
    }, [logs.current_page, setCurrentPage]);

    useEffect(() => {
        return () => {
            userRequestControllerRef.current?.abort();
            reset();
        };
    }, [reset]);

    const runFilterRequest = (params: FilterQueryParams): void => {
        const toastId = toast.loading('Loading activity logs...');
        setIsLoading(true);

        router.get(activityLogs.index.url(), params, {
            preserveScroll: true,
            replace: true,
            onError: (errors) => {
                const message =
                    Object.values(errors).join(', ') ||
                    'Failed to load activity logs.';
                toast.error(message, { id: toastId });
            },
            onSuccess: () => {
                toast.success('Activity logs refreshed.', { id: toastId });
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const fetchFilterUsers = useCallback(
        async (cursor?: string, append = false): Promise<void> => {
            userRequestControllerRef.current?.abort();
            const controller = new AbortController();
            userRequestControllerRef.current = controller;
            const requestId = userRequestSequenceRef.current + 1;
            userRequestSequenceRef.current = requestId;

            setIsUserListLoading(true);

            try {
                const requestUrl = activityLogs.users.url({
                    query: getUserSearchParams(cursor),
                });

                const response = await fetch(requestUrl, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users for activity log filter.');
                }

                const payload =
                    (await response.json()) as UserFilterSearchResponse;

                if (requestId !== userRequestSequenceRef.current) {
                    return;
                }

                if (append) {
                    appendUserOptions(payload.data);
                } else {
                    replaceUserOptions(payload.data);
                }

                setSelectedUsers(payload.selected);
                setUserListMeta(payload.meta);
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load users for filtering.',
                );
            } finally {
                if (requestId === userRequestSequenceRef.current) {
                    setIsUserListLoading(false);
                }
            }
        },
        [
            appendUserOptions,
            getUserSearchParams,
            replaceUserOptions,
            setIsUserListLoading,
            setSelectedUsers,
            setUserListMeta,
        ],
    );

    useEffect(() => {
        if (!dialogOpen) {
            userRequestControllerRef.current?.abort();
            return;
        }

        const timer = setTimeout(() => {
            void fetchFilterUsers();
        }, 250);

        return () => {
            clearTimeout(timer);
        };
    }, [dialogOpen, userSearchKeyword, userRoleFilter, userStatusFilter, fetchFilterUsers]);

    const handleApply = (): void => {
        runFilterRequest(getFilterParams());
    };

    const handleClear = (): void => {
        const toastId = toast.loading('Resetting filters...');
        setIsLoading(true);

        router.get(activityLogs.index.url(), {}, {
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

    const handleApplyUserFilter = (): void => {
        applyUserSelection();
        runFilterRequest(useAdminUserLogStore.getState().getFilterParams());
    };

    const handleClearUserFilter = (): void => {
        clearAppliedUserFilter();
        runFilterRequest(useAdminUserLogStore.getState().getFilterParams());
    };

    const handleLoadMoreUsers = (): void => {
        if (isUserListLoading || !userListMeta.next_cursor) {
            return;
        }

        void fetchFilterUsers(userListMeta.next_cursor, true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        User Activity Logs
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Monitor login, logout, and forced logout events across all
                        users.
                    </p>
                </div>

                <AdminLogFilters
                    filters={storeFilters}
                    selectedUserCount={appliedUserIds.length}
                    onFiltersChange={setFilters}
                    onOpenUserFilter={openUserFilterDialog}
                    onClearUserFilter={handleClearUserFilter}
                    onApply={handleApply}
                    onClear={handleClear}
                    disabled={isLoading}
                />

                <UserFilterModal
                    open={dialogOpen}
                    users={userOptions}
                    selectedUsers={selectedUsers}
                    selectedUserIds={selectedUserIds}
                    searchKeyword={userSearchKeyword}
                    roleFilter={userRoleFilter}
                    statusFilter={userStatusFilter}
                    isLoading={isUserListLoading}
                    hasMoreUsers={userListMeta.has_more}
                    onSearchChange={setUserSearchKeyword}
                    onRoleFilterChange={setUserRoleFilter}
                    onStatusFilterChange={setUserStatusFilter}
                    onToggleUser={toggleSelectedUserId}
                    onReplaceSelectedUsers={setSelectedUserIds}
                    onClearSelection={clearSelectedUsers}
                    onLoadMore={handleLoadMoreUsers}
                    onCancel={closeUserFilterDialog}
                    onApply={handleApplyUserFilter}
                />

                {!schema_ready && (
                    <Alert variant="destructive">
                        <AlertTitle>Activity Log Table Missing</AlertTitle>
                        <AlertDescription>
                            Run <code>php artisan migrate --no-interaction</code>{' '}
                            to create the <code>user_logs</code> table.
                        </AlertDescription>
                    </Alert>
                )}

                <LogTable logs={logs.data} isLoading={isLoading} showUser={true} />

                <Paginations
                    pagination={logs}
                    onNavigateStart={() => setIsLoading(true)}
                    onNavigateFinish={() => setIsLoading(false)}
                />
            </div>
        </AppLayout>
    );
}
