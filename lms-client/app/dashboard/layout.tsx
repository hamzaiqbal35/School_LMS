"use client";

import Sidebar from '@/components/Sidebar';

import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isHydrated, router]);

    if (!isHydrated || !isAuthenticated) return null;

    return (
        <div className="min-h-screen flex flex-col">

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 pt-20 md:pt-8 bg-background/50 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
