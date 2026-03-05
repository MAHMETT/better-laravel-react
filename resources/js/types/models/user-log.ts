import type { User } from './user';

export type UserLogEventType = 'login' | 'logout' | 'forced_logout';

export type UserLogUser = Pick<User, 'id' | 'name' | 'email'>;
export type UserLogFilterUser = Pick<
    User,
    'id' | 'name' | 'email' | 'role' | 'status'
>;

export interface UserLog {
    id: number;
    user_id: number;
    event_type: UserLogEventType;
    ip_address: string | null;
    user_agent: string | null;
    device_info: string | null;
    session_id: string | null;
    created_at: string;
    user?: UserLogUser | null;
}
