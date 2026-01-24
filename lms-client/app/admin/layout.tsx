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
    Calendar,
    BookOpen,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AdminFooter from "@/components/admin/AdminFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, logout, isHydrated, checkAuth, isCheckingAuth } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => { checkAuth(); }, [checkAuth]);

    useEffect(() => {
        if (!isCheckingAuth && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/login');
        }
    }, [isAuthenticated, isCheckingAuth, user, router]);

    useEffect(() => {
        const timer = setTimeout(() => setIsSidebarOpen(false), 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (!isHydrated || isCheckingAuth) return <div className="flex items-center justify-center h-screen text-gray-700 text-lg font-semibold">Loading...</div>;
    if (!isAuthenticated || user?.role !== 'ADMIN') return null;

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/classes", label: "Classes & Subjects", icon: BookOpen },
        { href: "/admin/teachers", label: "Teachers", icon: Users },
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/admin/assignments", label: "Teacher Assignments", icon: Calendar },
        { href: "/admin/attendance", label: "Attendance", icon: Calendar },
        { href: "/admin/substitution", label: "Substitutions", icon: Users },
        { href: "/admin/fees", label: "Finance", icon: CreditCard },
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
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white shadow-2xl flex flex-col transition-all duration-500 ease-in-out md:relative md:translate-x-0 border-r border-slate-800",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-8 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-4 w-22 h-22 bg-white rounded-full shadow-2xl shadow-cyan-500/20 flex items-center justify-center p-2 overflow-hidden border-4 border-slate-800"
                        >
                            <div className="relative w-16 h-16">
                                <Image
                                    src="/Logo2.png"
                                    alt="School Logo"
                                    fill
                                    sizes="64px"
                                    className="object-contain"
                                    priority
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        </motion.div>
                        <h2 className="font-black text-white text-xl tracking-tight leading-tight uppercase italic">
                            Oxford Grammar
                        </h2>
                        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] mt-2 bg-cyan-900/50 px-3 py-1 rounded-full">Cambridge Edtech School</p>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}
                                className={cn(
                                    "group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 relative overflow-hidden",
                                    isActive
                                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="navGlow"
                                        className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                    />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 mr-4 transition-all duration-300",
                                    isActive ? "text-white" : "text-slate-500 group-hover:text-cyan-400 group-hover:scale-110"
                                )} />
                                <span className="tracking-wide">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-3">
                        <Link href="/admin/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20 overflow-hidden relative">
                                {user?.avatar ? (
                                    <Image src={user.avatar} alt={user.fullName || 'User Avatar'} fill className="object-cover" />
                                ) : (
                                    (user?.fullName || 'A').charAt(0)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || 'Admin User'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </Link>
                    </div>
                    <button
                        onClick={logoutHandler}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-xs font-black text-white bg-slate-800 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all duration-300 border border-slate-700 hover:border-red-500/50 group"
                    >
                        <LogOut className="w-4 h-3 transition-transform group-hover:-translate-x-1" />
                        TERMINATE SESSION
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col w-full relative">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-40 pointer-events-none"></div>

                {/* Mobile Header */}
                <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 p-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl">
                            <div className="relative w-12 h-10">
                                <Image
                                    src="/Logo2.png"
                                    alt="School Logo"
                                    fill
                                    sizes="48px"
                                    className="object-contain brightness-100"
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                        <span className="font-black text-slate-900 text-xs tracking-tight">Oxford Grammar School</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)}
                        className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 md:p-10 flex-1 w-full relative z-10">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>
                <AdminFooter />
            </main>
        </div>
    );
}
