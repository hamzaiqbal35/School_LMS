"use client"
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, BookOpen, GraduationCap, ChevronRight, MoreVertical } from "lucide-react";
import Link from "next/link";

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
}

export default function TeacherDashboard() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/teacher/assignments');
                setAssignments(res.data);
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    // Filter for today's classes
    const todayClasses = assignments
        .filter(a => a.timeSlotId && a.timeSlotId.day === todayDay)
        .sort((a, b) => a.timeSlotId.startTime.localeCompare(b.timeSlotId.startTime));

    // Stats
    const uniqueClasses = new Set(assignments.map(a => `${a.classId?._id}-${a.sectionId?._id}`)).size;
    const totalWeeklyClasses = assignments.length;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/20 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-green-100 font-medium mb-1">Classes Today</p>
                        <h3 className="text-4xl font-bold">{todayClasses.length}</h3>
                        <p className="text-sm text-green-100 mt-4 bg-white/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                            View Schedule
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-green-200 transition-colors"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium mb-1">Assigned Classes</p>
                        <h3 className="text-3xl font-bold text-slate-900">{uniqueClasses}</h3>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium mb-1">Weekly Load</p>
                        <h3 className="text-3xl font-bold text-slate-900">{totalWeeklyClasses} <span className="text-sm font-normal text-slate-400">sessions</span></h3>
                    </div>
                </motion.div>
            </div>

            {/* Schedule Timeline */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Today&apos;s Schedule</h2>
                    <Link href="/teacher" className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                        View Full Week <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : todayClasses.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Classes Today</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Get some rest or prepare materials for your upcoming sessions.</p>
                    </div>
                ) : (
                    <div className="relative space-y-0">
                        {/* Vertical Line */}
                        <div className="absolute left-24 top-4 bottom-4 w-0.5 bg-slate-100 hidden md:block"></div>

                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                            {todayClasses.map((cls) => {
                                // Simple logic to highlight "Current" class based on time could be added here
                                return (
                                    <motion.div key={cls._id} variants={item} className="relative flex flex-col md:flex-row gap-6 md:gap-10 group">
                                        {/* Time Column */}
                                        <div className="md:w-24 shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 pt-2">
                                            <span className="font-bold text-slate-900 text-lg">{cls.timeSlotId.startTime}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cls.timeSlotId.endTime}</span>
                                        </div>

                                        {/* Dot on Timeline */}
                                        <div className="absolute left-[5.85rem] top-3 w-3 h-3 bg-white border-2 border-green-500 rounded-full z-10 hidden md:block group-hover:scale-125 transition-transform duration-300 shadow-sm shadow-green-500/20"></div>

                                        {/* Card */}
                                        <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 group-hover:translate-x-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {cls.subjectId.name}
                                                </div>
                                                <button className="text-slate-300 hover:text-slate-600">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                                Class {cls.classId.name} - {cls.sectionId.name}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-4">

                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    <span>{cls.timeSlotId.startTime} - {cls.timeSlotId.endTime}</span>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-slate-50 flex gap-3">
                                                <Link
                                                    href={`/teacher/attendance?classId=${cls.classId._id}&sectionId=${cls.sectionId._id}`}
                                                    className="flex-1 text-center bg-slate-900 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                                                >
                                                    Mark Attendance
                                                </Link>
                                                <button className="flex-1 text-center bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                                    View Students
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
