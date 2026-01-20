import { create } from 'zustand';

import api from '@/lib/api';

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: 'ADMIN' | 'TEACHER';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isCheckingAuth: boolean;
    isHydrated: boolean;
    login: (user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    isHydrated: true, // Always hydrated since memory-only
    login: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, isAuthenticated: true, isCheckingAuth: false });
        } catch (error) {
            set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },
    setHydrated: () => set({ isHydrated: true }), // No-op but kept for interface compatibility if needed, or remove interface
}));
