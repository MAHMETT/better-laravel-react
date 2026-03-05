import type { UserLogFilterUser } from '../models/user-log';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

export interface UserFilterSearchMeta {
    per_page: number;
    has_more: boolean;
    next_cursor: string | null;
    previous_cursor: string | null;
}

export interface UserFilterSearchResponse {
    data: UserLogFilterUser[];
    selected: UserLogFilterUser[];
    meta: UserFilterSearchMeta;
}

export interface AdminUserLogFilters {
    user_ids: number[];
    event_type: string;
    date_from: string;
    date_to: string;
    per_page: number;
}

export interface SelfUserLogFilters {
    event_type: string;
    date_from: string;
    date_to: string;
    per_page: number;
}

export * from './visitor-analytics';
export * from './visitor-management';
