import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
    AdminUserLogFilters,
    UserFilterSearchMeta,
    UserLogFilterUser,
} from '@/types';

type AdminUserLogQueryParams = Record<string, string | number | Array<number>>;
type AdminLogBaseFilters = Omit<AdminUserLogFilters, 'user_ids'>;
type UserRoleFilter = 'all' | 'admin' | 'user';
type UserStatusFilter = 'all' | 'enable' | 'disable';

type UserSearchParams = {
    search?: string;
    role?: 'admin' | 'user';
    status?: 'enable' | 'disable';
    per_page: number;
    cursor?: string;
    selected_ids?: number[];
};

const defaultFilters: AdminLogBaseFilters = {
    event_type: '',
    date_from: '',
    date_to: '',
    per_page: 10,
};

const defaultUserListMeta: UserFilterSearchMeta = {
    per_page: 30,
    has_more: false,
    next_cursor: null,
    previous_cursor: null,
};

export interface AdminUserLogState {
    filters: AdminLogBaseFilters;
    appliedUserIds: number[];
    selectedUserIds: number[];
    userSearchKeyword: string;
    userRoleFilter: UserRoleFilter;
    userStatusFilter: UserStatusFilter;
    userOptions: UserLogFilterUser[];
    selectedUsers: UserLogFilterUser[];
    userListMeta: UserFilterSearchMeta;
    isUserFilterDialogOpen: boolean;
    isLoading: boolean;
    isUserListLoading: boolean;
    currentPage: number;
    initialize: (filters: AdminUserLogFilters, currentPage: number) => void;
    setFilters: (filters: Partial<AdminLogBaseFilters>) => void;
    setIsLoading: (isLoading: boolean) => void;
    setCurrentPage: (page: number) => void;
    setIsUserListLoading: (isLoading: boolean) => void;
    openUserFilterDialog: () => void;
    closeUserFilterDialog: () => void;
    applyUserSelection: () => void;
    clearAppliedUserFilter: () => void;
    clearSelectedUsers: () => void;
    setSelectedUserIds: (userIds: number[]) => void;
    toggleSelectedUserId: (userId: number) => void;
    setUserSearchKeyword: (keyword: string) => void;
    setUserRoleFilter: (role: UserRoleFilter) => void;
    setUserStatusFilter: (status: UserStatusFilter) => void;
    replaceUserOptions: (users: UserLogFilterUser[]) => void;
    appendUserOptions: (users: UserLogFilterUser[]) => void;
    setSelectedUsers: (users: UserLogFilterUser[]) => void;
    setUserListMeta: (meta: UserFilterSearchMeta) => void;
    resetUserList: () => void;
    reset: () => void;
    getFilterParams: () => AdminUserLogQueryParams;
    getUserSearchParams: (cursor?: string) => UserSearchParams;
}

function mergeUsersById(users: UserLogFilterUser[]): UserLogFilterUser[] {
    const usersById = new Map<number, UserLogFilterUser>();

    users.forEach((user) => {
        usersById.set(user.id, user);
    });

    return Array.from(usersById.values());
}

export const useAdminUserLogStore = create<AdminUserLogState>()(
    subscribeWithSelector((set, get) => ({
        filters: { ...defaultFilters },
        appliedUserIds: [],
        selectedUserIds: [],
        userSearchKeyword: '',
        userRoleFilter: 'all',
        userStatusFilter: 'all',
        userOptions: [],
        selectedUsers: [],
        userListMeta: { ...defaultUserListMeta },
        isUserFilterDialogOpen: false,
        isLoading: false,
        isUserListLoading: false,
        currentPage: 1,

        initialize: (filters, currentPage) => {
            const deduplicatedUserIds = Array.from(new Set(filters.user_ids));

            set({
                filters: {
                    event_type: filters.event_type,
                    date_from: filters.date_from,
                    date_to: filters.date_to,
                    per_page: filters.per_page,
                },
                appliedUserIds: deduplicatedUserIds,
                selectedUserIds: deduplicatedUserIds,
                userSearchKeyword: '',
                userRoleFilter: 'all',
                userStatusFilter: 'all',
                userOptions: [],
                selectedUsers: [],
                userListMeta: { ...defaultUserListMeta },
                isUserFilterDialogOpen: false,
                isLoading: false,
                isUserListLoading: false,
                currentPage,
            });
        },

        setFilters: (newFilters) =>
            set((state) => ({
                filters: { ...state.filters, ...newFilters },
            })),

        setIsLoading: (isLoading) => set({ isLoading }),
        setCurrentPage: (currentPage) => set({ currentPage }),
        setIsUserListLoading: (isUserListLoading) => set({ isUserListLoading }),

        openUserFilterDialog: () =>
            set((state) => ({
                isUserFilterDialogOpen: true,
                selectedUserIds: [...state.appliedUserIds],
                userSearchKeyword: '',
                userRoleFilter: 'all',
                userStatusFilter: 'all',
                userOptions: [],
                userListMeta: { ...defaultUserListMeta },
                isUserListLoading: false,
            })),

        closeUserFilterDialog: () =>
            set((state) => ({
                isUserFilterDialogOpen: false,
                selectedUserIds: [...state.appliedUserIds],
                userSearchKeyword: '',
                userRoleFilter: 'all',
                userStatusFilter: 'all',
                userOptions: [],
                userListMeta: { ...defaultUserListMeta },
                isUserListLoading: false,
            })),

        applyUserSelection: () =>
            set((state) => ({
                appliedUserIds: Array.from(new Set(state.selectedUserIds)),
                isUserFilterDialogOpen: false,
                userSearchKeyword: '',
                userRoleFilter: 'all',
                userStatusFilter: 'all',
                userOptions: [],
                userListMeta: { ...defaultUserListMeta },
                isUserListLoading: false,
            })),

        clearAppliedUserFilter: () =>
            set({
                appliedUserIds: [],
                selectedUserIds: [],
                selectedUsers: [],
                userSearchKeyword: '',
                userRoleFilter: 'all',
                userStatusFilter: 'all',
                userOptions: [],
                userListMeta: { ...defaultUserListMeta },
                isUserListLoading: false,
            }),

        clearSelectedUsers: () => set({ selectedUserIds: [] }),

        setSelectedUserIds: (selectedUserIds) =>
            set({
                selectedUserIds: Array.from(new Set(selectedUserIds)),
            }),

        toggleSelectedUserId: (userId) =>
            set((state) => {
                const hasUser = state.selectedUserIds.includes(userId);

                return {
                    selectedUserIds: hasUser
                        ? state.selectedUserIds.filter((id) => id !== userId)
                        : [...state.selectedUserIds, userId],
                };
            }),

        setUserSearchKeyword: (userSearchKeyword) =>
            set({ userSearchKeyword }),

        setUserRoleFilter: (userRoleFilter) => set({ userRoleFilter }),

        setUserStatusFilter: (userStatusFilter) =>
            set({ userStatusFilter }),

        replaceUserOptions: (users) =>
            set({
                userOptions: mergeUsersById(users),
            }),

        appendUserOptions: (users) =>
            set((state) => ({
                userOptions: mergeUsersById([...state.userOptions, ...users]),
            })),

        setSelectedUsers: (selectedUsers) =>
            set({
                selectedUsers: mergeUsersById(selectedUsers),
            }),

        setUserListMeta: (userListMeta) => set({ userListMeta }),

        resetUserList: () =>
            set({
                userOptions: [],
                userListMeta: { ...defaultUserListMeta },
                isUserListLoading: false,
            }),

        reset: () =>
            set({
                filters: { ...defaultFilters },
                appliedUserIds: [],
                selectedUserIds: [],
                userSearchKeyword: '',
                userRoleFilter: 'all',
                userStatusFilter: 'all',
                userOptions: [],
                selectedUsers: [],
                userListMeta: { ...defaultUserListMeta },
                isUserFilterDialogOpen: false,
                isLoading: false,
                isUserListLoading: false,
                currentPage: 1,
            }),

        getFilterParams: () => {
            const { filters, appliedUserIds } = get();
            const params: AdminUserLogQueryParams = {};

            if (appliedUserIds.length > 0) {
                params.user_ids = appliedUserIds;
            }

            if (filters.event_type.trim() !== '') {
                params.event_type = filters.event_type.trim();
            }

            if (filters.date_from.trim() !== '') {
                params.date_from = filters.date_from.trim();
            }

            if (filters.date_to.trim() !== '') {
                params.date_to = filters.date_to.trim();
            }

            if (filters.per_page !== 10) {
                params.per_page = filters.per_page;
            }

            return params;
        },

        getUserSearchParams: (cursor) => {
            const {
                userSearchKeyword,
                userRoleFilter,
                userStatusFilter,
                selectedUserIds,
                userListMeta,
            } = get();

            const params: UserSearchParams = {
                per_page: userListMeta.per_page,
            };

            const normalizedKeyword = userSearchKeyword.trim();

            if (normalizedKeyword !== '') {
                params.search = normalizedKeyword;
            }

            if (userRoleFilter !== 'all') {
                params.role = userRoleFilter;
            }

            if (userStatusFilter !== 'all') {
                params.status = userStatusFilter;
            }

            if (typeof cursor === 'string' && cursor !== '') {
                params.cursor = cursor;
            }

            if (selectedUserIds.length > 0) {
                params.selected_ids = selectedUserIds;
            }

            return params;
        },
    })),
);

export const selectAdminUserLogFilters = (state: AdminUserLogState) =>
    state.filters;

export const selectAdminUserLogAppliedUserIds = (state: AdminUserLogState) =>
    state.appliedUserIds;

export const selectAdminUserLogSelectedUserIds = (state: AdminUserLogState) =>
    state.selectedUserIds;

export const selectAdminUserLogUserSearchKeyword = (
    state: AdminUserLogState,
) => state.userSearchKeyword;

export const selectAdminUserLogUserRoleFilter = (state: AdminUserLogState) =>
    state.userRoleFilter;

export const selectAdminUserLogUserStatusFilter = (
    state: AdminUserLogState,
) => state.userStatusFilter;

export const selectAdminUserLogUserOptions = (state: AdminUserLogState) =>
    state.userOptions;

export const selectAdminUserLogSelectedUsers = (state: AdminUserLogState) =>
    state.selectedUsers;

export const selectAdminUserLogUserListMeta = (state: AdminUserLogState) =>
    state.userListMeta;

export const selectAdminUserLogDialogOpen = (state: AdminUserLogState) =>
    state.isUserFilterDialogOpen;

export const selectAdminUserLogLoading = (state: AdminUserLogState) =>
    state.isLoading;

export const selectAdminUserLogUserListLoading = (state: AdminUserLogState) =>
    state.isUserListLoading;
