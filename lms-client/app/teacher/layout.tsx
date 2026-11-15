"use client";

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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import TeacherFooter from "@/components/teacher/TeacherFooter";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout, isHydrated, checkAuth, isCheckingAuth } =
    useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated]);

  useEffect(() => {
    if (!isCheckingAuth && (!isAuthenticated || user?.role !== "TEACHER")) {
      router.push("/login");
    }
  }, [isAuthenticated, isCheckingAuth, user, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const timer = setTimeout(() => setIsSidebarOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isHydrated || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16 animate-pulse">
            <Image
              src="/Logo2.png"
              alt="Loading"
              fill
              className="object-contain"
              sizes="64px"
              priority
            />
          </div>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-emerald-800 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-emerald-800 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-emerald-800 rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "TEACHER") return null;

  const navItems = [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/attendance", label: "Mark Attendance", icon: UserCheck },
    { href: "/teacher/students", label: "My Students", icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950">
      {/* Mobile Sidebar Backdrop */}
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

      {/* INSTITUTIONAL OXFORD NAVY SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-800/80 shrink-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header with Crest */}
        <div className="p-6 border-b border-slate-800/80 flex flex-col items-center text-center relative overflow-hidden bg-radial from-emerald-950/20 via-transparent to-transparent">
          <div className="relative z-10 w-full flex flex-col items-center">
            <Link href="/teacher" className="group flex flex-col items-center">
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
              Faculty Academic Portal
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Instructional Navigation
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
                    layoutId="teacherNavIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full"
                  />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 mr-3 transition-colors shrink-0",
                    isActive
                      ? "text-emerald-200"
                      : "text-slate-500 group-hover:text-emerald-400"
                  )}
                />
                <span className="tracking-wide flex-1 truncate">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300 opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card & Sign Out */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
          <Link
            href="/teacher/profile"
            onClick={() => setIsSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-xl transition-all mb-2.5 group border cursor-pointer",
              pathname === "/teacher/profile"
                ? "bg-emerald-950/80 border-emerald-600/80 shadow-md shadow-emerald-950/40"
                : "bg-slate-900/90 border-slate-800 hover:bg-slate-900 hover:border-emerald-600/60"
            )}
          >
            <div className="relative w-10 h-10 rounded-xl bg-white p-0.5 border border-emerald-500/40 shrink-0 overflow-hidden shadow-xs flex items-center justify-center font-bold text-slate-950 font-mono">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.fullName || "Faculty"}
                  fill
                  className="object-cover rounded-lg"
                  sizes="40px"
                />
              ) : (
                (user?.fullName || "T").charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                {user?.fullName || "Faculty Member"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Certified Faculty
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  &bull; Profile
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          <button
            type="button"
            onClick={async () => {
              try {
                await api.post("/auth/logout");
              } catch {
                // Ignore logout network error
              }
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-slate-900/70 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-800/80 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out &amp; End Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30 shadow-md text-white">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-white p-0.5">
              <Image
                src="/Logo2.png"
                alt="Logo"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <div>
              <span className="font-bold text-white text-xs block leading-tight">
                Oxford Grammar School
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                Teacher Portal
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
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
