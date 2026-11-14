"use client"
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Users,
    CalendarCheck,
    BookOpen,
    Receipt,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    GraduationCap,
    ClipboardList,
    ArrowLeftRight,
    ShieldCheck,
    ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AdminFooter from "@/components/admin/AdminFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, logout, isHydrated, checkAuth, isCheckingAuth } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            checkAuth();
        }
    }, [checkAuth, isAuthenticated]);

    useEffect(() => {
        if (!isCheckingAuth && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/login');
        }
    }, [isAuthenticated, isCheckingAuth, user, router]);

    useEffect(() => {
        const timer = setTimeout(() => setIsSidebarOpen(false), 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (!isHydrated || isCheckingAuth) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white font-sans">
                <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-xl mb-4 flex items-center justify-center border-2 border-emerald-500/40 animate-pulse">
                    <div className="relative w-full h-full">
                        <Image src="/Logo2.png" alt="Loading Crest" fill sizes="48px" className="object-contain" />
                    </div>
                </div>
                <div className="text-sm font-semibold tracking-wide text-slate-300">Initializing Academic Control Center...</div>
            </div>
        );
    }
    if (!isAuthenticated || user?.role !== 'ADMIN') return null;

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/classes", label: "Classes & Subjects", icon: BookOpen },
        { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/admin/assignments", label: "Teacher Assignments", icon: ClipboardList },
        { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
        { href: "/admin/substitution", label: "Substitutions", icon: ArrowLeftRight },
        { href: "/admin/fees", label: "Finance", icon: Receipt },
        { href: "/admin/profile", label: "System Administrator", icon: ShieldCheck },
    ];

    const logoutHandler = async () => {
        try { await api.post('/auth/logout'); } catch (e) { console.error('Logout failed', e); }
        logout();
        router.push('/login');
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-800/80 shrink-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Brand Header */}
                <div className="p-6 border-b border-slate-800/80 flex flex-col items-center text-center relative overflow-hidden bg-radial from-emerald-950/20 via-transparent to-transparent">
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <Link href="/" className="group flex flex-col items-center">
                            <div className="mb-3 w-16 h-16 bg-white rounded-2xl shadow-xl shadow-black/30 flex items-center justify-center p-1.5 border-2 border-emerald-500/30 group-hover:scale-105 transition-transform duration-200">
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/Logo2.png"
                                        alt="Oxford Grammar Crest"
                                        fill
                                        sizes="64px"
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <h2 className="font-bold text-white text-base tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
                                Oxford Grammar School
                            </h2>
                        </Link>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1.5 bg-emerald-950/90 border border-emerald-800/60 px-3 py-0.5 rounded-full">
                            Academic Control Center
                        </span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                        Institutional Navigation
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 relative overflow-hidden",
                                    isActive
                                        ? "bg-emerald-800 text-white shadow-md shadow-emerald-950/40"
                                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="adminNavIndicator"
                                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full"
                                    />
                                )}
                                <Icon className={cn(
                                    "w-4 h-4 mr-3 transition-colors shrink-0",
                                    isActive ? "text-emerald-200" : "text-slate-500 group-hover:text-emerald-400"
                                )} />
                                <span className="tracking-wide flex-1 truncate">{item.label}</span>
                                {isActive && (
                                    <ChevronRight className="w-3.5 h-3.5 text-emerald-300 opacity-80" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Snapshot & Logout */}
                <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
                    <Link
                        href="/admin/profile"
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-700/60 transition-all mb-2.5 group"
                    >
                        <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden relative shrink-0 border border-emerald-500/40">
                            {user?.avatar ? (
                                <Image src={user.avatar} alt={user.fullName || 'Admin User'} fill className="object-cover" sizes="36px" />
                            ) : (
                                (user?.fullName || 'A').charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                {user?.fullName || 'Administrator'}
                            </p>
                            <p className="text-[10px] text-emerald-400 font-mono-code truncate">
                                System Administrator
                            </p>
                        </div>
                    </Link>

                    <button
                        onClick={logoutHandler}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-300 bg-slate-900 hover:bg-rose-950/30 rounded-xl transition-all border border-slate-800 hover:border-rose-900/40 group cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-500 group-hover:text-rose-400" />
                        <span>Sign Out &amp; End Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Surface */}
            <main className="flex-1 overflow-auto flex flex-col w-full relative">
                {/* Mobile Header Bar */}
                <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                            <div className="relative w-full h-full">
                                <Image
                                    src="/Logo2.png"
                                    alt="School Crest"
                                    fill
                                    sizes="36px"
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 text-xs block leading-tight">Oxford Grammar School</span>
                            <span className="text-[9px] text-emerald-700 font-semibold uppercase tracking-wider">Academic Portal</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                        aria-label="Open navigation menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex-1 w-full relative z-10">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>
                <AdminFooter />
            </main>
        </div>
    );
}
