export type Roles = 'admin' | 'user';
export type UserStatus = 'enable' | 'disable';

export interface User {
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
    deleted_at: string | null;
    is_enabled?: boolean;
}

export interface Auth {
    user: User;
}

export interface AvatarMedia {
    id: string;
    name: string;
    path: string;
    url: string;
    size: number;
    type: string;
    extension: string;
    original_url?: string;
    thumbnail_url?: string;
    metadata: AvatarMediaMetadata;
}

export interface AvatarMediaMetadata {
    original_width?: number;
    original_height?: number;
    original_format?: string;
    converted_from?: string;
    converted_to?: string;
    converted_path?: string;
    thumbnail_path?: string;
}
