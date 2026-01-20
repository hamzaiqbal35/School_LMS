"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Users,
    Calendar,
    BookOpen,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminFooter from "@/components/admin/AdminFooter";

export default function AdminLayout({
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
        } else if (!isCheckingAuth && user?.role !== 'ADMIN') {
            router.push('/login');
        }
    }, [isAuthenticated, isCheckingAuth, user, router]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (!isHydrated || isCheckingAuth) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!isAuthenticated || user?.role !== 'ADMIN') return null;

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/classes", label: "Classes & Subjects", icon: BookOpen },
        { href: "/admin/teachers", label: "Teachers", icon: Users },
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/admin/assignments", label: "Teacher Assignments", icon: Calendar },
        { href: "/admin/attendance", label: "Attendance", icon: Calendar },
        { href: "/admin/substitution", label: "Substitutions", icon: Users },
        { href: "/admin/fees", label: "Fees Verification", icon: CreditCard },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
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
                <div className="p-6 flex justify-between items-center">
                    <div className="flex flex-col items-center text-center">
                        <img src="/Logo2.png" alt="School Logo" className="h-16 w-auto mb-3" />
                        <span className="font-bold text-gray-800 text-sm leading-tight">
                            Oxford Grammar & <br /> Cambridge EdTech School
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Admin Console</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-gray-500 hover:text-gray-700"
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
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t bg-gray-50/50">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                            {(user?.fullName || 'U').charAt(0)}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
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
                        className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
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
                <AdminFooter />
            </main>
        </div>
    );
}
