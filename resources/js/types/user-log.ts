import type { User } from './auth';

export type UserLogEventType = 'login' | 'logout' | 'forced_logout';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
};

export type UserLogUser = Pick<User, 'id' | 'name' | 'email'>;
export type UserLogFilterUser = Pick<
    User,
    'id' | 'name' | 'email' | 'role' | 'status'
>;

export type UserFilterSearchMeta = {
    per_page: number;
    has_more: boolean;
    next_cursor: string | null;
    previous_cursor: string | null;
};

export type UserFilterSearchResponse = {
    data: UserLogFilterUser[];
    selected: UserLogFilterUser[];
    meta: UserFilterSearchMeta;
};

export type UserLog = {
    id: number;
    user_id: number;
    event_type: UserLogEventType;
    ip_address: string | null;
    user_agent: string | null;
    device_info: string | null;
    session_id: string | null;
    created_at: string;
    user?: UserLogUser | null;
};

export type AdminUserLogFilters = {
    user_ids: number[];
    event_type: string;
    date_from: string;
    date_to: string;
    per_page: number;
};

export type SelfUserLogFilters = {
    event_type: string;
    date_from: string;
    date_to: string;
    per_page: number;
};
