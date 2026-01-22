"use client"
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, BookOpen, CreditCard, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.fullName}</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Students Card */}
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                        </div>
                        {loading ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded"></div> :
                            <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
                        }
                        <p className="text-xs text-green-600 flex items-center mt-2 font-medium">
                            <span className="bg-green-50 px-1.5 py-0.5 rounded text-[10px] mr-1">ACTIVE</span> Currently enrolled
                        </p>
                    </div>
                </div>

                {/* Teachers Card */}
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BookOpen className="w-24 h-24 text-indigo-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Active Teachers</h3>
                        </div>
                        {loading ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded"></div> :
                            <p className="text-3xl font-bold text-gray-900">{stats.teachers}</p>
                        }
                        <p className="text-xs text-gray-500 flex items-center mt-2">
                            Faculty members
                        </p>
                    </div>
                </div>

                {/* Fees Card */}
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CreditCard className="w-24 h-24 text-orange-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Pending Fees</h3>
                        </div>
                        {loading ? <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div> :
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.pendingFees)}</p>
                        }
                        <p className="text-xs text-orange-600 flex items-center mt-2 font-medium">
                            Uncollected dues
                        </p>
                    </div>
                </div>

                {/* Attendance Card */}
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="w-24 h-24 text-emerald-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Today&apos;s Attendance</h3>
                        </div>
                        {loading ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded"></div> :
                            <p className="text-3xl font-bold text-gray-900">{stats.attendancePercentage}%</p>
                        }
                        <p className="text-xs text-gray-500 flex items-center mt-2">
                            Present today
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-75 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <ArrowUpRight className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-500 max-w-sm">Detailed charts and graphs for attendance trends and fee collection history will be available here soon.</p>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/admin/students/create" className="flex items-center w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium hover:pl-5 duration-200">
                            <Users className="w-5 h-5 mr-3" />
                            Register New Student
                        </Link>
                        <Link href="/admin/classes" className="flex items-center w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium hover:pl-5 duration-200">
                            <BookOpen className="w-5 h-5 mr-3" />
                            Manage Classes & Subjects
                        </Link>
                        <Link href="/admin/fees" className="flex items-center w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium hover:pl-5 duration-200">
                            <CreditCard className="w-5 h-5 mr-3" />
                            Student Fee Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
