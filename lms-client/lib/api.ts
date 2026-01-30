import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with requests
});

// Request Interceptor: NO LONGER NEEDED for Token (Cookies handled by browser)
// api.interceptors.request.use( ... );

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect for /auth/me - checkAuth handles that case
        const isAuthMeRequest = error.config?.url?.includes('/auth/me');
        if (error.response?.status === 401 && !isAuthMeRequest) {
            // Token expired or invalid
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
