"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import {
    Calendar,
    BookOpen,
    LogOut,
    UserCheck,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, logout, isHydrated, checkAuth, isCheckingAuth } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        // Wait for check to finish
        if (!isCheckingAuth && !isAuthenticated) {
            router.push('/login');
        } else if (!isCheckingAuth && user?.role !== 'TEACHER') {
            router.push('/login');
        }
    }, [isAuthenticated, isCheckingAuth, user, router]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (!isHydrated || isCheckingAuth) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!isAuthenticated || user?.role !== 'TEACHER') return null;

    const navItems = [
        { href: "/teacher", label: "My Classes", icon: Calendar },
        { href: "/teacher/attendance", label: "Mark Attendance", icon: UserCheck },
        { href: "/teacher/students", label: "View Students", icon: BookOpen },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex justify-between items-start md:block border-b">
                    <div className="flex flex-col items-center text-center w-full">
                        <img src="/Logo2.png" alt="School Logo" className="h-16 w-auto mb-3" />
                        <span className="font-bold text-gray-800 text-sm leading-tight">
                            Oxford Grammar & <br /> Cambridge EdTech School
                        </span>
                        <span className="text-[10px] text-green-600 uppercase tracking-wider mt-1">Teacher Portal</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-gray-500 hover:text-gray-700 absolute top-4 right-4"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-green-50 text-green-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                            {(user?.fullName || 'U').charAt(0)}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</p>
                            <p className="text-xs text-gray-500">Teacher</p>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                await api.post('/auth/logout');
                            } catch (e) {
                                console.error('Logout failed', e);
                            }
                            logout();
                            router.push('/login');
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col w-full">
                {/* Mobile Header */}
                <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center">
                        <img src="/Logo2.png" alt="School Logo" className="h-8 w-auto mr-2" />
                        <span className="font-bold text-gray-800 text-sm">Oxford Grammar & Cambridge EdTech School</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 md:p-8 flex-1 w-full max-w-[100vw]">
                    {children}
                </div>
            </main>
        </div>
    );
}
