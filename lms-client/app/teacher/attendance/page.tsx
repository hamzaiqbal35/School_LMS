"use client"
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { formatTime12Hour } from '@/lib/utils';
import { Loader2, Save, Calendar, CheckCircle, AlertCircle, ArrowLeft, Users, Clock, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Assignment {
    _id: string;
    classId: { _id: string; name: string };
    sectionId: { _id: string; name: string };
    subjectId: { _id: string; name: string };
    timeSlotId: { day: string; startTime: string; endTime: string };
    originalTeacherId?: { fullName: string }; // Added for substitution details
}

interface Student {
    _id: string;
    registrationNumber: string;
    fullName: string;
    fatherName: string;
}

import { useSearchParams } from 'next/navigation';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MarkAttendancePage() {
    const searchParams = useSearchParams();
    const classIdParam = searchParams.get('classId');
    const sectionIdParam = searchParams.get('sectionId');

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Filter state
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');

    // Selection state
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [marks, setMarks] = useState<Record<string, string>>({}); // studentId -> status

    const [msg, setMsg] = useState({ type: '', text: '' });

    // Get unique classes for filter dropdown
    const uniqueClasses = useMemo(() => {
        const classMap = new Map<string, string>();
        assignments.forEach(a => {
            const key = `${a.classId._id}-${a.sectionId._id}`;
            if (!classMap.has(key)) {
                classMap.set(key, `${a.classId.name} - ${a.sectionId.name}`);
            }
        });
        return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
    }, [assignments]);

    // Get unique subjects for filter dropdown
    const uniqueSubjects = useMemo(() => {
        const subjectMap = new Map<string, string>();
        assignments.forEach(a => {
            if (a.subjectId?._id && !subjectMap.has(a.subjectId._id)) {
                subjectMap.set(a.subjectId._id, a.subjectId.name);
            }
        });
        return Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
    }, [assignments]);

    // Get the day of week from the selected attendance date
    const selectedDateDay = useMemo(() => {
        if (!attendanceDate) return '';
        const date = new Date(attendanceDate + 'T00:00:00'); // Ensure local time
        const dayIndex = date.getDay();
        return DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert to Monday-first index
    }, [attendanceDate]);

    // Filtered assignments based on selected filters (now uses the date's day)
    const filteredAssignments = useMemo(() => {
        return assignments.filter(a => {
            // Always filter by the day derived from the selected date
            const matchesDay = !selectedDateDay || a.timeSlotId?.day === selectedDateDay;
            const matchesClass = !selectedClass || `${a.classId._id}-${a.sectionId._id}` === selectedClass;
            const matchesSubject = !selectedSubject || a.subjectId?._id === selectedSubject;
            return matchesDay && matchesClass && matchesSubject;
        });
    }, [assignments, selectedDateDay, selectedClass, selectedSubject]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/teacher/assignments'); // Adjusted URL to match dashboard logic which worked
                setAssignments(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    // Helper function to get the most recent date for a given day of the week
    const getDateForDay = useCallback((dayName: string): string => {
        const dayMap: Record<string, number> = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
            'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };

        const targetDay = dayMap[dayName];
        if (targetDay === undefined) {
            // If day is not recognized, return today's date
            return new Date().toISOString().split('T')[0];
        }

        const today = new Date();
        const currentDay = today.getDay();

        // Calculate days to go back to reach the target day
        let daysBack = currentDay - targetDay;
        if (daysBack < 0) {
            daysBack += 7; // If target day is ahead in the week, go back a full week
        }

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - daysBack);

        return targetDate.toISOString().split('T')[0];
    }, []);

    // Wrap in useCallback to refer in useEffect
    const handleClassSelect = useCallback(async (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setMsg({ type: '', text: '' });
        setLoadingStudents(true);

        // Auto-set the attendance date based on the class's scheduled day
        let dateToUse = attendanceDate;
        if (assignment.timeSlotId?.day) {
            dateToUse = getDateForDay(assignment.timeSlotId.day);
            setAttendanceDate(dateToUse);
        }

        try {
            // Fetch students
            const res = await api.get(`/teacher/students?classId=${assignment.classId._id}&sectionId=${assignment.sectionId._id}`);
            const studList: Student[] = res.data;
            setStudents(studList);

            // Fetch existing attendance for this class/section/date
            const attendanceRes = await api.get(`/attendance?classId=${assignment.classId._id}&sectionId=${assignment.sectionId._id}&date=${dateToUse}`);
            const existingAttendance = attendanceRes.data;

            // Create marks map - first default all to 'Not Marked', then override with existing records
            const initialMarks: Record<string, string> = {};
            studList.forEach(s => initialMarks[s._id] = 'Not Marked');

            // Override with existing attendance records
            existingAttendance.forEach((record: { studentId: { _id: string } | string; status: string }) => {
                const studentId = typeof record.studentId === 'object' ? record.studentId._id : record.studentId;
                if (studentId && initialMarks.hasOwnProperty(studentId)) {
                    initialMarks[studentId] = record.status;
                }
            });

            setMarks(initialMarks);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStudents(false);
        }
    }, [getDateForDay, attendanceDate]);

    // Refetch attendance when date changes (to load existing records for new date)
    const fetchExistingAttendance = useCallback(async () => {
        if (!selectedAssignment || students.length === 0) return;

        try {
            const attendanceRes = await api.get(`/attendance?classId=${selectedAssignment.classId._id}&sectionId=${selectedAssignment.sectionId._id}&date=${attendanceDate}`);
            const existingAttendance = attendanceRes.data;

            // Create marks map - first default all to 'Not Marked', then override with existing records
            const updatedMarks: Record<string, string> = {};
            students.forEach(s => updatedMarks[s._id] = 'Not Marked');

            // Override with existing attendance records
            existingAttendance.forEach((record: { studentId: { _id: string } | string; status: string }) => {
                const studentId = typeof record.studentId === 'object' ? record.studentId._id : record.studentId;
                if (studentId && updatedMarks.hasOwnProperty(studentId)) {
                    updatedMarks[studentId] = record.status;
                }
            });

            setMarks(updatedMarks);
        } catch (error) {
            console.error('Failed to fetch existing attendance:', error);
        }
    }, [selectedAssignment, students, attendanceDate]);

    // When attendanceDate changes and we already have a selected assignment, refetch attendance
    useEffect(() => {
        if (selectedAssignment && students.length > 0) {
            fetchExistingAttendance();
        }
    }, [attendanceDate, fetchExistingAttendance, selectedAssignment, students.length]);

    // Auto-select based on query params
    useEffect(() => {
        if (assignments.length > 0 && classIdParam && sectionIdParam && !selectedAssignment) {
            const target = assignments.find(a => a.classId._id === classIdParam && a.sectionId._id === sectionIdParam);
            if (target) {
                handleClassSelect(target);
            }
        }
    }, [assignments, classIdParam, sectionIdParam, selectedAssignment, handleClassSelect]);


    const handleSubmit = async () => {
        setMsg({ type: '', text: '' });
        if (!selectedAssignment || students.length === 0) return;

        const payload = {
            date: attendanceDate,
            classId: selectedAssignment.classId._id,
            sectionId: selectedAssignment.sectionId._id,
            // Note: subjectId removed - attendance is now daily, not subject-wise
            records: Object.entries(marks).map(([studentId, status]) => ({
                studentId,
                status
            }))
        };

        try {
            await api.post('/attendance', payload);
            setMsg({ type: 'success', text: 'Daily attendance marked successfully!' });
            // Scroll to top or show toast
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to mark' });
        }
    };

    const stats = {
        present: Object.values(marks).filter(s => s === 'Present').length,
        absent: Object.values(marks).filter(s => s === 'Absent').length,
        leave: Object.values(marks).filter(s => s === 'Leave').length,
        late: Object.values(marks).filter(s => s === 'Late').length,
        notMarked: Object.values(marks).filter(s => s === 'Not Marked').length,
    };

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!selectedAssignment ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
                                <p className="text-slate-500">Select a class to start marking attendance.</p>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-600" />
                                <input
                                    id="attendanceDate"
                                    name="attendanceDate"
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer"
                                    aria-label="Attendance Date"
                                />
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Filter className="w-5 h-5" />
                                    <span className="font-semibold text-sm">Filters</span>
                                </div>

                                <div className="flex flex-wrap gap-3 flex-1">
                                    {/* Subject Filter */}
                                    <div className="flex-1 min-w-[150px]">
                                        <select
                                            id="filterSubject"
                                            name="filterSubject"
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all cursor-pointer"
                                        >
                                            <option value="">All Subjects</option>
                                            {uniqueSubjects.map(subj => (
                                                <option key={subj.id} value={subj.id}>{subj.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Class Filter */}
                                    <div className="flex-1 min-w-[180px]">
                                        <select
                                            id="filterClass"
                                            name="filterClass"
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all cursor-pointer"
                                        >
                                            <option value="">All Classes</option>
                                            {uniqueClasses.map(cls => (
                                                <option key={cls.id} value={cls.id}>Class {cls.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Clear Filters Button */}
                                {(selectedSubject || selectedClass) && (
                                    <button
                                        onClick={() => {
                                            setSelectedSubject('');
                                            setSelectedClass('');
                                        }}
                                        className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline transition-colors whitespace-nowrap"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>

                            {/* Active Filters Tags */}
                            {(selectedSubject || selectedClass) && (
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                                    {selectedSubject && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                                            Subject: {uniqueSubjects.find(s => s.id === selectedSubject)?.name}
                                            <button
                                                onClick={() => setSelectedSubject('')}
                                                className="ml-1 hover:text-green-900 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {selectedClass && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                                            Class: {uniqueClasses.find(c => c.id === selectedClass)?.name}
                                            <button
                                                onClick={() => setSelectedClass('')}
                                                className="ml-1 hover:text-blue-900 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 self-center">
                                        Showing {filteredAssignments.length} of {assignments.length} classes
                                    </span>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-500">No classes assigned to you.</p>
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No classes match your filters</p>
                                <p className="text-sm text-slate-400 mt-1">Try adjusting your filter criteria</p>
                                <button
                                    onClick={() => {
                                        setSelectedSubject('');
                                        setSelectedClass('');
                                    }}
                                    className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700 hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAssignments.map((assignment) => (
                                    <div
                                        key={assignment._id}
                                        onClick={() => handleClassSelect(assignment)}
                                        className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-green-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Users className="w-24 h-24 text-green-600" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <div className={`w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${assignment.originalTeacherId ? 'bg-amber-100 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                                                        {assignment.originalTeacherId ? 'Substitution' : assignment.subjectId.name}
                                                    </div>
                                                    {/* Day Badge */}
                                                    {assignment.timeSlotId?.day && (
                                                        <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                            {assignment.timeSlotId.day}
                                                        </div>
                                                    )}
                                                </div>
                                                {assignment.originalTeacherId && (
                                                    <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-bold border border-amber-100">
                                                        Covering
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                                                Class {assignment.classId.name} - {assignment.sectionId.name}
                                            </h3>

                                            {assignment.originalTeacherId ? (
                                                <div className="mb-3 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    For: <span className="font-bold text-slate-700">{assignment.originalTeacherId.fullName}</span> • {assignment.subjectId.name}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-500 mb-3 font-medium">
                                                    {assignment.subjectId.name}
                                                </div>
                                            )}

                                            {/* Day and Time Display */}
                                            <div className="flex items-center gap-3 text-xs mb-4">
                                                <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{formatTime12Hour(assignment.timeSlotId?.startTime)} - {formatTime12Hour(assignment.timeSlotId?.endTime)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center text-green-600 font-bold text-sm group-hover:gap-2 transition-all mt-auto">
                                                Select Class <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="marking"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* Header Bar */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => setSelectedAssignment(null)}
                                    className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <div>
                                    <h2 className="font-bold text-slate-900">Class {selectedAssignment.classId.name} - {selectedAssignment.sectionId.name}</h2>
                                    <p className="text-xs text-slate-500 font-medium">{selectedAssignment.subjectId.name} • {new Date(attendanceDate).toDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                <div className="flex gap-2 mr-2 md:mr-4 text-[10px] md:text-xs font-bold text-slate-500">
                                    <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">P: {stats.present}</span>
                                    <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">A: {stats.absent}</span>
                                    <span className="text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">L: {stats.leave}</span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loadingStudents}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md shadow-green-600/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                                >
                                    {loadingStudents ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Submit
                                </button>
                            </div>
                        </div>

                        {msg.text && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                <span className="font-medium">{msg.text}</span>
                            </div>
                        )}

                        {loadingStudents ? (
                            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-green-600 w-8 h-8" /></div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-12 bg-slate-50 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                    <div className="hidden md:block md:col-span-1">Reg #</div>
                                    <div className="col-span-5 md:col-span-4 pl-0 md:pl-4">Student Name</div>
                                    <div className="col-span-7 flex justify-center">Attendance Status</div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {students.map((student) => (
                                        <div key={student._id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-50/50 transition-colors">
                                            <div className="hidden md:block md:col-span-1 font-mono text-xs font-bold text-slate-400">{student.registrationNumber}</div>
                                            <div className="col-span-5 md:col-span-4 pl-0 md:pl-4">
                                                <p className="font-bold text-slate-900 text-sm truncate">{student.fullName}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{student.fatherName}</p>
                                                <p className="md:hidden text-[10px] text-slate-400 font-mono mt-0.5">#{student.registrationNumber}</p>
                                            </div>
                                            <div className="col-span-7 flex justify-center gap-1 sm:gap-2">
                                                {['Present', 'Absent', 'Leave', 'Late', 'Not Marked'].map((status) => {
                                                    const isActive = marks[student._id] === status;
                                                    let activeClass = "";
                                                    if (status === 'Present') activeClass = "bg-green-500 text-white border-green-500 shadow-green-500/30";
                                                    if (status === 'Absent') activeClass = "bg-red-500 text-white border-red-500 shadow-red-500/30";
                                                    if (status === 'Leave') activeClass = "bg-amber-400 text-white border-amber-400 shadow-amber-400/30";
                                                    if (status === 'Late') activeClass = "bg-slate-500 text-white border-slate-500 shadow-slate-500/30";
                                                    if (status === 'Not Marked') activeClass = "bg-gray-400 text-white border-gray-400 shadow-gray-400/30";

                                                    return (
                                                        <button
                                                            key={status}
                                                            onClick={() => setMarks({ ...marks, [student._id]: status })}
                                                            className={`
                                                                w-8 h-8 sm:w-24 sm:h-9 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-200 shadow-sm
                                                                ${isActive ? `${activeClass} shadow-md scale-105` : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"}
                                                            `}
                                                            title={status}
                                                        >
                                                            <span className="hidden sm:inline">{status}</span>
                                                            <span className="sm:hidden">{status.charAt(0)}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
