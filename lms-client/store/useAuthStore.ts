import { create } from 'zustand';

import api from '@/lib/api';

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: 'ADMIN' | 'TEACHER';
    avatar?: string;
    token?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isCheckingAuth: boolean;
    isHydrated: boolean;
    login: (user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
    setUser: (user: User) => void;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true, // Start true, set false after check or if skipped
    isHydrated: true, // Always hydrated since memory-only
    login: (user) => {
        if (user.token) {
            localStorage.setItem('token', user.token);
        }
        set({ user, isAuthenticated: true, isCheckingAuth: false });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
    },
    setUser: (user) => set({ user }),
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, isAuthenticated: true, isCheckingAuth: false });
        } catch {
            localStorage.removeItem('token');
            set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },
    setHydrated: () => set({ isHydrated: true }), // No-op but kept for interface compatibility if needed, or remove interface
}));
