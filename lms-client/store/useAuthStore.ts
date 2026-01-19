import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher';
    token: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    login: (user: User) => void;
    logout: () => void;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isHydrated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);
