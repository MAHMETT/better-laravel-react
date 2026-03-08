import type {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance with default config
const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    timeout: 30000,
    withCredentials: true,
});

// Request interceptor - Add CSRF token and transform requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get CSRF token from cookie or meta tag
        const token = getCsrfToken();
        if (token) {
            config.headers['X-XSRF-TOKEN'] = token;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle different error status codes
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 422) {
            // Validation error - let the component handle it
            return Promise.reject(error);
        } else if (error.response?.status === 403) {
            // Forbidden
            toast.error('You do not have permission to perform this action.');
        } else if (error.response?.status === 404) {
            // Not found
            toast.error('The requested resource was not found.');
        } else if (error.response?.status === 500) {
            // Server error
            toast.error(
                'An unexpected error occurred. Please try again later.',
            );
        } else if (error.code === 'ECONNABORTED') {
            // Timeout
            toast.error('Request timeout. Please try again.');
        } else if (error.code === 'ERR_NETWORK') {
            // Network error
            toast.error('Network error. Please check your connection.');
        } else {
            // Generic error
            toast.error(error.message || 'An error occurred');
        }

        return Promise.reject(error);
    },
);

/**
 * Get CSRF token from meta tag or cookie
 */
function getCsrfToken(): string | null {
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag && metaTag.getAttribute('content')) {
        return metaTag.getAttribute('content');
    }

    // Try to get from cookie
    const name = 'XSRF-TOKEN';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }

    return null;
}

export default api;
