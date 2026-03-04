export type Avatar = {
    id: string;
    name: string;
    path: string;
    url: string;
    size: number | string;
    type: string;
};

export type AvatarMedia = {
    id: string;
    name: string;
    path: string;
    url: string;
    size: number;
    type: string;
    extension: string;
    original_url?: string;
    thumbnail_url?: string;
    metadata: {
        original_width?: number;
        original_height?: number;
        original_format?: string;
        converted_from?: string;
        converted_to?: string;
        converted_path?: string;
        thumbnail_path?: string;
        [key: string]: unknown;
    };
};

export type Roles = 'admin' | 'user';
export type UserStatus = 'enable' | 'disable';

export type User = {
    id: number;
    name: string;
    email: string;
    role: Roles;
    status: UserStatus;
    avatar?: string | null;
    avatar_url?: string | null;
    avatar_thumbnail?: string | null;
    avatar_original?: string | null;
    avatar_thumbnail_url?: string | null;
    avatar_original_url?: string | null;
    avatarMedia?: AvatarMedia | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type UserPagination = {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
};
