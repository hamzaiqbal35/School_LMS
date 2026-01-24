"use client"
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Loader2, Calendar, AlertTriangle, CheckCircle, UserX, Clock, ArrowRight, X, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface TimeSlot {
    _id: string;
    startTime: string;
    endTime: string;
    day: string;
}

interface ClassEntity {
    _id: string;
    name: string;
}

interface Teacher {
    _id: string;
    fullName: string;
    qualification?: string;
    isFree?: boolean;
    reason?: string;
    avatar?: string;
}

interface NeedSubstitution {
    class: ClassEntity;
    section: ClassEntity;
    subject: ClassEntity;
    timeSlot: TimeSlot;
    originalTeacher: Teacher;
    status: 'Pending' | 'Covered';
    substitution?: {
        _id: string;
        substituteTeacherId: Teacher;
    };
}

export default function AdminSubstitutionPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [neededSubs, setNeededSubs] = useState<NeedSubstitution[]>([]);
    const [loading, setLoading] = useState(false);

    // Selection state for assigning
    const [selectedSlot, setSelectedSlot] = useState<NeedSubstitution | null>(null);
    const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
    const [searchingTeachers, setSearchingTeachers] = useState(false);

    const fetchNeededSubstitutions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/substitution/needed?date=${date}`);
            setNeededSubs(res.data);
        } catch (error) {
            console.error("Failed to fetch substitutions", error);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchNeededSubstitutions();
    }, [fetchNeededSubstitutions]);

    const handleSelectSlot = async (item: NeedSubstitution) => {
        if (item.status === 'Covered') return; // Already handled
        setSelectedSlot(item);
        setSearchingTeachers(true);
        try {
            const res = await api.get(`/substitution/available-teachers?date=${date}&timeSlotId=${item.timeSlot._id}`);
            setAvailableTeachers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setSearchingTeachers(false);
        }
    };

    const assignSubstitute = async (teacherId: string) => {
        if (!selectedSlot) return;
        try {
            await api.post('/substitution', {
                date,
                classId: selectedSlot.class._id,
                sectionId: selectedSlot.section._id,
                subjectId: selectedSlot.subject._id,
                timeSlotId: selectedSlot.timeSlot._id,
                originalTeacherId: selectedSlot.originalTeacher._id,
                substituteTeacherId: teacherId
            });

            // Refresh
            setSelectedSlot(null);
            fetchNeededSubstitutions();
        } catch (error) {
            console.error("Assignment failed", error);
            alert('Failed to assign substitute');
        }
    };

    const deleteSubstitution = async (subId: string) => {
        if (!confirm('Are you sure you want to cancel this substitution?')) return;
        try {
            await api.delete(`/substitution/${subId}`);
            fetchNeededSubstitutions();
        } catch (error) {
            console.error("Delete failed", error);
            alert('Failed to delete substitution');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Substitution Management</h1>
                    <p className="text-slate-500 mt-1">Manage teacher absences and assign substitutes</p>
                </div>
                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <input
                        id="substitutionDate"
                        name="substitutionDate"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-none outline-none text-slate-700 font-bold bg-transparent text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left: Needed Substitutions List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                            Substitution Requests
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{neededSubs.length}</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-2" />
                            <p className="text-slate-400 font-medium">Checking schedule...</p>
                        </div>
                    ) : (
                        neededSubs.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-slate-900 font-bold text-lg">All Clear!</h3>
                                <p className="text-slate-500 mt-1">No teacher absences requiring substitution found for this date.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                <AnimatePresence>
                                    {neededSubs.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`relative overflow-hidden p-0 rounded-2xl border transition-all cursor-pointer group ${item.status === 'Covered'
                                                ? 'bg-white border-slate-200 hover:border-slate-300'
                                                : selectedSlot === item
                                                    ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200 shadow-md'
                                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                                }`}
                                            onClick={() => handleSelectSlot(item)}
                                        >
                                            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'Covered' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {item.status === 'Covered' ? <UserCheck className="w-6 h-6" /> : <UserX className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-slate-900 text-lg">
                                                                {item.class.name}-{item.section.name}
                                                            </h3>
                                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                                                {item.subject.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-1.5">
                                                            <span className="flex items-center gap-1.5 text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-md">
                                                                <UserX className="w-3.5 h-3.5" />
                                                                {item.originalTeacher.fullName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {item.timeSlot.day} • {item.timeSlot.startTime} - {item.timeSlot.endTime}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-4 sm:pl-0 border-l sm:border-l-0 border-slate-100">
                                                    {item.status === 'Covered' ? (
                                                        <>
                                                            <div className="text-right">
                                                                <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full mb-1">
                                                                    <CheckCircle className="w-3 h-3 mr-1" /> Covered
                                                                </span>
                                                                <div className="text-xs text-slate-500">
                                                                    by <span className="font-bold text-slate-700">{item.substitution?.substituteTeacherId?.fullName}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); if (item.substitution?._id) deleteSubstitution(item.substitution._id); }}
                                                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Cancel Substitution"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">
                                                                <AlertTriangle className="w-3 h-3 mr-1" /> Pending
                                                            </span>
                                                            <ArrowRight className="w-5 h-5 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {item.status === 'Pending' && selectedSlot === item && (
                                                <div className="h-1 w-full bg-blue-100 overflow-hidden">
                                                    <div className="h-full bg-blue-500 w-1/3 animate-progress-indeterminate"></div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )
                    )}
                </div>

                {/* Right: Assign Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-900">Available Teachers</h2>
                                <p className="text-xs text-slate-500 mt-1">Assign substitute for selected class</p>
                            </div>

                            <div className="p-6">
                                {!selectedSlot ? (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                            <ArrowRight className="w-6 h-6 rotate-180 lg:rotate-0" />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">
                                            Select a pending request to see available teachers
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm">
                                            <div className="font-bold text-blue-900 mb-1">Selected Class</div>
                                            <div className="text-blue-800">{selectedSlot.class.name}-{selectedSlot.section.name} • {selectedSlot.subject.name}</div>
                                            <div className="text-xs text-blue-600 mt-1 opacity-80">{selectedSlot.timeSlot.startTime} - {selectedSlot.timeSlot.endTime}</div>
                                        </div>

                                        <div>
                                            {searchingTeachers ? (
                                                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                                    <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
                                                    <span className="text-xs font-medium text-slate-500">Checking teacher availability...</span>
                                                </div>
                                            ) : availableTeachers.length === 0 ? (
                                                <div className="text-center py-8 text-slate-500">
                                                    <UserX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No teachers found available for this slot.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Suggested Teachers</h3>
                                                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                                                        {availableTeachers.map(teacher => (
                                                            <button
                                                                key={teacher._id}
                                                                onClick={() => {
                                                                    if (!teacher.isFree && !confirm(`This teacher is currently ${teacher.reason}. Do you want to assign them anyway?`)) return;
                                                                    assignSubstitute(teacher._id);
                                                                }}
                                                                className={`w-full flex items-center justify-between p-3 rounded-xl group transition-all text-left border ${teacher.isFree
                                                                    ? 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                                                                    : 'bg-slate-50 border-transparent opacity-60 hover:opacity-100 hover:bg-white hover:border-slate-300'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative overflow-hidden ${teacher.isFree ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                                                                        {teacher.avatar ? (
                                                                            <Image src={teacher.avatar} alt={teacher.fullName} fill className="object-cover" sizes="32px" />
                                                                        ) : (
                                                                            teacher.fullName.charAt(0)
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className={`text-sm font-bold ${teacher.isFree ? 'text-slate-800' : 'text-slate-500'}`}>
                                                                            {teacher.fullName}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    {teacher.isFree ? (
                                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md">
                                                                            Free
                                                                        </span>
                                                                    ) : (
                                                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${teacher.reason === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                                            }`}>
                                                                            {teacher.reason}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setSelectedSlot(null)}
                                            className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
                                        >
                                            Cancel Selection
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
