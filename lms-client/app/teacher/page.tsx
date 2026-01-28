"use client"
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatTime12Hour } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, PieChart as PieIcon, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Assignment {
    _id: string;
    classId: { _id: string; name: string };
    sectionId: { _id: string; name: string };
    subjectId: { _id: string; name: string };
    timeSlotId: {
        day: string;
        startTime: string;
        endTime: string;
    };
    originalTeacherId?: { fullName: string }; // For substitution
}

interface Stats {
    present: number;
    absent: number;
    leave: number;
    late: number;
    substitutions: number;
}

interface AttendanceRecord {
    _id: string;
    date: string;
    status: 'Present' | 'Absent' | 'Leave' | 'Late';
    markedBy: { fullName: string };
}

export default function TeacherDashboard() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [todayStatus, setTodayStatus] = useState<string>('Not Marked');
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // If selectedMonth is set, we fetch history for that month without limit
                // If not set, we fetch recent 5
                const historyQuery = selectedMonth
                    ? `/teacher-attendance?teacherId=${user?._id}&month=${selectedMonth}`
                    : `/teacher-attendance?teacherId=${user?._id}&limit=5`;

                const [assignRes, statsRes, historyRes] = await Promise.all([
                    api.get('/teacher/assignments'),
                    api.get('/teacher-attendance/stats'),
                    api.get(historyQuery)
                ]);

                setAssignments(assignRes.data);
                setStats(statsRes.data.stats);
                setTodayStatus(statsRes.data.todayStatus);
                setHistory(historyRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?._id, selectedMonth]);

    // Filter for today's classes
    const todayClasses = assignments
        .filter(a => a.timeSlotId && a.timeSlotId.day === todayDay)
        .sort((a, b) => a.timeSlotId.startTime.localeCompare(b.timeSlotId.startTime));

    // Chart Data
    const chartData = stats ? [
        { name: 'Present', value: stats.present, color: '#22c55e' }, // Green
        { name: 'Absent/Leave', value: stats.absent + stats.leave, color: '#ef4444' }, // Red
        { name: 'Substitutions', value: stats.substitutions, color: '#f59e0b' }, // Amber
    ] : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700 border-green-200';
            case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Leave': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600">{user?.fullName?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening in your classes today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                    <div className="bg-green-50 p-2 rounded-lg text-green-600">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Chart */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5"><CheckCircle className="w-20 h-20 text-green-600" /></div>
                            <span className="text-slate-500 font-medium text-sm">Present This Month</span>
                            <div className="text-3xl font-bold text-slate-900">{stats?.present || 0} <span className="text-xs font-normal text-slate-400">days</span></div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5"><XCircle className="w-20 h-20 text-red-600" /></div>
                            <span className="text-slate-500 font-medium text-sm">Absent / Leave</span>
                            <div className="text-3xl font-bold text-slate-900">{(stats?.absent || 0) + (stats?.leave || 0)} <span className="text-xs font-normal text-slate-400">days</span></div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5"><AlertTriangle className="w-20 h-20 text-amber-600" /></div>
                            <span className="text-slate-500 font-medium text-sm">Valid Substitutions</span>
                            <div className="text-3xl font-bold text-slate-900">{stats?.substitutions || 0} <span className="text-xs font-normal text-slate-400">classes</span></div>
                        </motion.div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900">Today&apos;s Schedule</h2>
                            {/* Just a placeholder link for View Full Week as requested */}
                            <Link href="#" className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1 opacity-50 cursor-not-allowed" title="Coming Soon">
                                View Full Week <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : todayClasses.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-slate-900 font-bold">No Classes Today</h3>
                                <p className="text-slate-500 text-sm">Enjoy your day off!</p>
                            </div>
                        ) : (
                            <div className="space-y-6 relative">
                                <div className="absolute left-20 top-4 bottom-4 w-0.5 bg-slate-100 hidden md:block"></div>
                                {todayClasses.map((cls) => (
                                    <div key={cls._id} className="relative flex flex-col md:flex-row gap-6 md:gap-10 group">
                                        <div className="md:w-20 shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-1 pt-2">
                                            <span className="font-bold text-slate-900 text-lg leading-none">{formatTime12Hour(cls.timeSlotId.startTime)}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{formatTime12Hour(cls.timeSlotId.endTime)}</span>
                                        </div>
                                        <div className="absolute left-[4.85rem] top-3 w-3 h-3 bg-white border-2 border-green-500 rounded-full z-10 hidden md:block group-hover:scale-125 transition-all shadow-sm"></div>

                                        <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-100 transition-all group-hover:translate-x-1">
                                            <div className="flex justify-between mb-3">
                                                {cls.originalTeacherId ? (
                                                    <div className="flex gap-2">
                                                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-200">Substitution</span>
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">For: {cls.originalTeacherId.fullName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{cls.subjectId.name}</span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                                Class {cls.classId.name} - {cls.sectionId.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 font-mono">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{formatTime12Hour(cls.timeSlotId.startTime)} - {formatTime12Hour(cls.timeSlotId.endTime)}</span>
                                            </div>
                                            <div className="pt-4 border-t border-slate-50 flex gap-3">
                                                <Link
                                                    href={`/teacher/attendance?classId=${cls.classId._id}&sectionId=${cls.sectionId._id}`}
                                                    className="flex-1 text-center bg-slate-900 text-white text-sm font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                                                >
                                                    Mark Attendance
                                                </Link>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Donut & History */}
                <div className="space-y-8">
                    {/* Donut Chart */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Attendance Overview</h2>
                        <div className="h-64 w-full relative">
                            {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                                    <PieIcon className="w-12 h-12 mb-2 opacity-20" />
                                    No Data Available
                                </div>
                            )}
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center mt-[-30px]"> {/* Offset for legend */}
                                    <span className="text-3xl font-bold text-slate-900">{chartData.reduce((a, b) => a + b.value, 0)}</span>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Status */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">My Attendance (Today)</h2>
                        <div className={`p-4 rounded-xl border ${getStatusColor(todayStatus)} flex items-center justify-between`}>
                            <span className="font-bold">{todayStatus}</span>
                            {todayStatus === 'Present' ? <CheckCircle className="w-6 h-6" /> : todayStatus === 'Not Marked' ? <Clock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-h-[500px] flex flex-col">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-50">
                            <h2 className="text-lg font-bold text-slate-900">History</h2>
                            <input
                                id="historyMonth"
                                name="historyMonth"
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-500 focus:outline-none focus:border-green-500 bg-slate-50"
                                aria-label="Filter History by Month"
                            />
                        </div>
                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
                            {history.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-4">No records found for this period.</p>
                            ) : (
                                history.map((record, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 p-2 rounded-lg">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{new Date(record.date).toLocaleDateString()}</div>
                                                <div className="text-xs text-slate-400">Marked by {record.markedBy?.fullName || 'System'}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
