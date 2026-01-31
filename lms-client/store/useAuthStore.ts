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
        set({ user, isAuthenticated: true, isCheckingAuth: false });
    },
    logout: () => {
        set({ user: null, isAuthenticated: false });
    },
    setUser: (user) => set({ user }),
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const { data } = await api.get('/auth/me');

            // Backend now returns 200 with { user: null } if not logged in
            // OR returns the user object directly if logged in (legacy compatibility check)

            // Check if we got { user: null ... } structure
            if (data && data.user === null && data.isAuthenticated === false) {
                set({ user: null, isAuthenticated: false, isCheckingAuth: false });
                return;
            }

            // Otherwise, data IS the user object (backward compatibility with what we replaced)
            // But let's look at the structure we defined in controller:
            /*
             if logged in:
             { _id: ..., username: ... }
            */

            if (data && data._id) {
                set({ user: data, isAuthenticated: true, isCheckingAuth: false });
            } else {
                // Fallback if structure is unexpected
                set({ user: null, isAuthenticated: false, isCheckingAuth: false });
            }

        } catch {
            set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },
    setHydrated: () => set({ isHydrated: true }), // No-op but kept for interface compatibility if needed, or remove interface
}));
