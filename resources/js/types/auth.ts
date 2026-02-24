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

export type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    avatarMedia?: AvatarMedia | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
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
