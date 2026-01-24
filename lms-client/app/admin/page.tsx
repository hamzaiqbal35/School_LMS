"use client"
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, BookOpen, CreditCard, Calendar, ArrowUpRight, GraduationCap, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        pendingFees: 0,
        attendancePercentage: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 to-slate-800 p-8 shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            Admin Dashboard
                        </motion.div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-400">{user?.fullName?.split(' ')[0]}</span>
                        </h2>
                        <p className="text-slate-400 max-w-lg">Manage your institute efficiently. check stats, manage users and track performance all in one place.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-2 rounded-2xl border border-white/10">
                        <div className="px-4 py-2 text-center border-r border-white/10">
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Date</div>
                            <div className="text-white font-medium">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                        </div>
                        <div className="px-4 py-2 text-center">
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Day</div>
                            <div className="text-white font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Students Card */}
                <motion.div variants={item} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <GraduationCap className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-xs">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                <TrendingUp className="w-3 h-3 mr-1" /> Active
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Students</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            {loading ? (
                                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded"></div>
                            ) : (
                                <p className="text-3xl font-black text-slate-900">{stats.students}</p>
                            )}
                        </div>
                        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </motion.div>

                {/* Teachers Card */}
                <motion.div variants={item} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <BookOpen className="w-24 h-24 text-indigo-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-xs">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Teachers</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            {loading ? (
                                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded"></div>
                            ) : (
                                <p className="text-3xl font-black text-slate-900">{stats.teachers}</p>
                            )}
                        </div>
                        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </motion.div>

                {/* Fees Card */}
                <motion.div variants={item} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <DollarSign className="w-24 h-24 text-emerald-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-xs">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                                Pending
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Fees</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            {loading ? (
                                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded"></div>
                            ) : (
                                <p className="text-2xl font-black text-slate-900 truncate" title={formatCurrency(stats.pendingFees)}>{formatCurrency(stats.pendingFees)}</p>
                            )}
                        </div>
                        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </motion.div>

                {/* Attendance Card */}
                <motion.div variants={item} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Calendar className="w-24 h-24 text-cyan-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300 shadow-xs">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                Today
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Attendance</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            {loading ? (
                                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded"></div>
                            ) : (
                                <p className="text-3xl font-black text-slate-900">{stats.attendancePercentage}%</p>
                            )}
                        </div>
                        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${stats.attendancePercentage}%` }}></div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <motion.div variants={item} className="p-8 bg-white rounded-3xl shadow-sm border border-slate-200 min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[20px_20px] opacity-50 pointer-events-none"></div>
                    <div className="p-6 bg-slate-50 rounded-full mb-6 relative group">
                        <div className="absolute inset-0 bg-cyan-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        <ArrowUpRight className="w-10 h-10 text-slate-400 relative z-10 group-hover:text-cyan-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-slate-500 max-w-sm">
                        Detailed visualization of enrollment trends, fee collection analytics, and attendance heatmaps coming soon.
                    </p>
                </motion.div>

                <motion.div variants={item} className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 px-2 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                        Quick Actions
                    </h3>
                    <div className="flex-1 space-y-3">
                        <Link href="/admin/students/create" className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 hover:shadow-sm transition-all duration-200">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 group-hover:text-blue-700">Admission</h4>
                                <p className="text-xs text-slate-500">Register a new student</p>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </Link>

                        <Link href="/admin/classes" className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 hover:shadow-sm transition-all duration-200">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-700">Academics</h4>
                                <p className="text-xs text-slate-500">Manage classes & subjects</p>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </Link>

                        <Link href="/admin/fees" className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/50 hover:shadow-sm transition-all duration-200">
                            <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700">Finance</h4>
                                <p className="text-xs text-slate-500">Check fee status & dues</p>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
