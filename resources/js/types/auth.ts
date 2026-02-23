export type Avatar = {
    id: string;
    name: string;
    path: string;
    url: string;
    size: number | string;
    type: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: Avatar;
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
