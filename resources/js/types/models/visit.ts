export interface Visit {
    id: number;
    session_id: string;
    ip_address: string;
    user_id: number | null;
    route_path: string;
    route_name: string | null;
    user_agent: string | null;
    device_type: string | null;
    referrer: string | null;
    visited_at: string;
    created_at: string;
}

export interface VisitWithUser extends Visit {
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
}
