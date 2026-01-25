"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Save, Calendar, CheckCircle, AlertCircle, ArrowLeft, Users, Clock } from 'lucide-react';
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

export default function MarkAttendancePage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Selection state
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [marks, setMarks] = useState<Record<string, string>>({}); // studentId -> status

    const [msg, setMsg] = useState({ type: '', text: '' });

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

    const handleClassSelect = async (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setMsg({ type: '', text: '' });
        setLoadingStudents(true);
        try {
            const res = await api.get(`/teacher/students?classId=${assignment.classId._id}&sectionId=${assignment.sectionId._id}`);
            const studList: Student[] = res.data;
            setStudents(studList);

            // Fetch existing attendance ?? optional
            // Default to Present
            const initialMarks: Record<string, string> = {};
            studList.forEach(s => initialMarks[s._id] = 'Present');
            setMarks(initialMarks);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleSubmit = async () => {
        setMsg({ type: '', text: '' });
        if (!selectedAssignment || students.length === 0) return;

        const payload = {
            date: attendanceDate,
            classId: selectedAssignment.classId._id,
            sectionId: selectedAssignment.sectionId._id,
            subjectId: selectedAssignment.subjectId._id,
            records: Object.entries(marks).map(([studentId, status]) => ({
                studentId,
                status
            }))
        };

        try {
            await api.post('/attendance', payload);
            setMsg({ type: 'success', text: 'Attendance marked successfully' });
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
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-500">No classes assigned to you.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assignments.map((assignment) => (
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
                                                <div className={`w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${assignment.originalTeacherId ? 'bg-amber-100 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                                                    {assignment.originalTeacherId ? 'Substitution' : assignment.subjectId.name}
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

                                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 font-mono">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{assignment.timeSlotId?.startTime || 'N/A'} - {assignment.timeSlotId?.endTime || 'N/A'}</span>
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
                                <div className="hidden md:flex gap-2 mr-4 text-xs font-bold text-slate-500">
                                    <span className="text-green-600">P: {stats.present}</span>
                                    <span className="text-red-600">A: {stats.absent}</span>
                                    <span className="text-amber-500">L: {stats.leave}</span>
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
                                    <div className="col-span-1">Reg #</div>
                                    <div className="col-span-4 pl-4">Student Name</div>
                                    <div className="col-span-7 flex justify-center">Attendance Status</div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {students.map((student) => (
                                        <div key={student._id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-50/50 transition-colors">
                                            <div className="col-span-1 font-mono text-xs font-bold text-slate-400">{student.registrationNumber}</div>
                                            <div className="col-span-4 pl-4">
                                                <p className="font-bold text-slate-900 text-sm">{student.fullName}</p>
                                                <p className="text-[10px] text-slate-400">{student.fatherName}</p>
                                            </div>
                                            <div className="col-span-7 flex justify-center gap-2">
                                                {['Present', 'Absent', 'Leave', 'Late'].map((status) => {
                                                    const isActive = marks[student._id] === status;
                                                    let activeClass = "";
                                                    if (status === 'Present') activeClass = "bg-green-500 text-white border-green-500 shadow-green-500/30";
                                                    if (status === 'Absent') activeClass = "bg-red-500 text-white border-red-500 shadow-red-500/30";
                                                    if (status === 'Leave') activeClass = "bg-amber-400 text-white border-amber-400 shadow-amber-400/30";
                                                    if (status === 'Late') activeClass = "bg-slate-500 text-white border-slate-500 shadow-slate-500/30";

                                                    return (
                                                        <button
                                                            key={status}
                                                            onClick={() => setMarks({ ...marks, [student._id]: status })}
                                                            className={`
                                                                w-9 h-9 sm:w-24 sm:h-9 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-200 shadow-sm
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
