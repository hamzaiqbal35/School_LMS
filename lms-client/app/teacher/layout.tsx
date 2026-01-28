
"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
    LogOut,
    UserCheck,
    Menu,
    X,
    LayoutDashboard,
    GraduationCap,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import TeacherFooter from "@/components/teacher/TeacherFooter";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, logout, isHydrated, checkAuth, isCheckingAuth } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isCheckingAuth && !isAuthenticated) {
            router.push('/login');
        } else if (!isCheckingAuth && user?.role !== 'TEACHER') {
            router.push('/login');
        }
    }, [isAuthenticated, isCheckingAuth, user, router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        const timer = setTimeout(() => setIsSidebarOpen(false), 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (!isHydrated || isCheckingAuth) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16 animate-pulse">
                    <Image src="/Logo2.png" alt="Loading" fill className="object-contain" sizes="64px" priority loading="eager" />
                </div>
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
    );
    if (!isAuthenticated || user?.role !== 'TEACHER') return null;

    const navItems = [
        { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
        { href: "/teacher/attendance", label: "Mark Attendance", icon: UserCheck },
        { href: "/teacher/students", label: "My Students", icon: GraduationCap },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="relative w-10 h-10 shrink-0">
                            <Image src="/Logo2.png" alt="Logo" fill className="object-contain" sizes="40px" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm leading-tight tracking-tight">OGCES Panel</span>
                            <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Teacher</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden ml-auto p-1 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="px-4 py-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-2">Main Menu</div>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-green-50 text-green-700 font-bold shadow-sm ring-1 ring-green-100"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600")} />
                                        <span>{item.label}</span>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-green-500" />}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-3">
                        <Link href="/teacher/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-green-500/20 overflow-hidden relative">
                                {user?.avatar ? (
                                    <Image src={user.avatar} alt={user.fullName} fill className="object-cover" sizes="40px" />
                                ) : (
                                    (user?.fullName || 'T').charAt(0)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </Link>
                    </div>
                    <button
                        onClick={async () => {
                            try { await api.post('/auth/logout'); } catch { }
                            logout();
                            router.push('/login');
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <Image src="/Logo2.png" alt="Logo" fill className="object-contain" sizes="32px" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">Teacher Portal</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full active:scale-95 transition-transform"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-auto scroll-smooth flex flex-col">
                    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                    <TeacherFooter />
                </div>
            </main>
        </div>
    );
}
