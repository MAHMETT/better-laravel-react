import type { Roles, UserStatus } from '../models';

export interface CreateUserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: Roles;
    status: UserStatus;
}

export interface EditUserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: Roles;
    status: UserStatus;
}

export interface UserFilters {
    search: string;
    status: string;
    role: string;
    per_page: number;
}

export interface UserStats {
    total: number;
    enabled: number;
    disabled: number;
    admins: number;
}
