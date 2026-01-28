"use client"
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Loader2, Lock, Unlock, History, Calendar, UserCheck, UserX, Clock, Users, GraduationCap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface AttendanceRecord {
    _id: string;
    studentId: {
        _id: string;
        fullName: string;
        registrationNumber: string;
    };
    classId?: { _id: string; name: string };
    sectionId?: { _id: string; name: string };
    status: string;
    markedBy?: { fullName: string; avatar?: string };
    markedAt: string;
    isFrozen: boolean;
    history?: { status: string; timestamp: string; reason?: string }[];
}

interface TeacherRecord {
    teacherId: { _id: string; fullName: string; avatar?: string };
    status: string;
    markedAt?: string;
    markedBy?: { fullName: string };
}
interface MasterData {
    classes: { _id: string; name: string }[];
    sections: { _id: string; name: string }[];
}


export default function AdminAttendancePage() {
    const [activeTab, setActiveTab] = useState<'STUDENT' | 'TEACHER'>('STUDENT');

    // Common
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Student State
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
    const [masterData, setMasterData] = useState<MasterData>({ classes: [], sections: [] });
    const [isFrozen, setIsFrozen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Teacher State
    const [teachers, setTeachers] = useState<{ _id: string; fullName: string; email: string; avatar?: string }[]>([]);
    const [teacherRecords, setTeacherRecords] = useState<TeacherRecord[]>([]);

    useEffect(() => {
        api.get('/admin/master-data').then(res => setMasterData(res.data));
    }, []);

    const fetchStudentAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/attendance?date=${date}&classId=${classId}&sectionId=${sectionId}`);
            setStudentRecords(res.data);
            const frozenStatus = res.data.length > 0 ? res.data[0].isFrozen : false;
            setIsFrozen(frozenStatus);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [date, classId, sectionId]);

    const fetchTeacherAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const [teachersRes, attendanceRes] = await Promise.all([
                api.get('/admin/teachers'),
                api.get(`/teacher-attendance?date=${date}`)
            ]);

            setTeachers(teachersRes.data);
            setTeacherRecords(attendanceRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        if (activeTab === 'STUDENT') {
            fetchStudentAttendance();
        } else if (activeTab === 'TEACHER') {
            fetchTeacherAttendance();
        }
    }, [activeTab, date, classId, sectionId, fetchStudentAttendance, fetchTeacherAttendance]);


    const markTeacherStatus = async (teacherId: string, status: string) => {
        try {
            // Optimistic Update
            const updatedRecords = teacherRecords.some(r => r.teacherId._id === teacherId)
                ? teacherRecords.map(r => r.teacherId._id === teacherId ? { ...r, status } : r)
                : [...teacherRecords, { teacherId: { _id: teacherId, fullName: '' }, status, markedAt: new Date().toISOString(), markedBy: { fullName: 'Admin' } }]; // Simplified optimistic

            setTeacherRecords(updatedRecords);

            await api.post('/teacher-attendance', {
                date,
                records: [{ teacherId, status }]
            });

            // Background refresh to ensure consistency
            const res = await api.get(`/teacher-attendance?date=${date}`);
            setTeacherRecords(res.data);
        } catch {
            alert('Failed to mark attendance');
            fetchTeacherAttendance(); // Revert
        }
    };

    const toggleFreeze = async () => {
        if (!classId || !sectionId) return;
        try {
            await api.post('/attendance/freeze', {
                date,
                classId,
                sectionId,
                action: isFrozen ? 'UNFREEZE' : 'FREEZE'
            });
            setIsFrozen(!isFrozen);
            fetchStudentAttendance(); // Refresh
        } catch {
            alert('Failed to update freeze status');
        }
    };

    const filteredStudentRecords = studentRecords.filter(record => statusFilter === 'ALL' || record.status === statusFilter);

    const filteredTeacherRecords = teachers.filter(teacher => {
        if (statusFilter === 'ALL') return true;
        const record = teacherRecords.find(r => r.teacherId._id === teacher._id);
        const status = record ? record.status : 'Not Marked';
        return status === statusFilter;
    });

    const currentCount = activeTab === 'STUDENT' ? filteredStudentRecords.length : filteredTeacherRecords.length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Audit</h1>
                    <p className="text-slate-500 mt-1">Track and manage daily attendance records</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setActiveTab('STUDENT')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'STUDENT' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        Students
                    </button>
                    <button
                        onClick={() => setActiveTab('TEACHER')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'TEACHER' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Users className="w-4 h-4" />
                        Teachers
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-full md:w-auto">
                        <label htmlFor="filterDate" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <input
                                id="filterDate"
                                name="filterDate"
                                type="date"
                                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full md:w-auto transition-all"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {activeTab === 'STUDENT' && (
                        <>
                            <div className="w-full md:w-auto">
                                <label htmlFor="filterClass" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Class</label>
                                <div className="relative">
                                    <select
                                        id="filterClass"
                                        name="filterClass"
                                        className="pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full md:min-w-[180px] appearance-none transition-all bg-white"
                                        value={classId}
                                        onChange={(e) => setClassId(e.target.value)}
                                    >
                                        <option value="">All Classes</option>
                                        {masterData.classes.map((c: { _id: string; name: string }) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div className="w-full md:w-auto">
                                <label htmlFor="filterSection" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Section</label>
                                <div className="relative">
                                    <select
                                        id="filterSection"
                                        name="filterSection"
                                        className="pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full md:min-w-[180px] appearance-none transition-all bg-white"
                                        value={sectionId}
                                        onChange={(e) => setSectionId(e.target.value)}
                                    >
                                        <option value="">All Sections</option>
                                        {masterData.sections.map((s: { _id: string; name: string }) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>

                            {classId && sectionId && (
                                <div className="ml-auto self-end w-full md:w-auto">
                                    <button
                                        onClick={toggleFreeze}
                                        className={`w-full md:w-auto flex items-center justify-center px-4 py-2.5 rounded-xl font-bold transition-all ${isFrozen
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm'
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm'
                                            }`}
                                    >
                                        {isFrozen ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                                        {isFrozen ? 'Unfreeze Record' : 'Freeze Record'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Status Filter */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <div className="w-full md:w-auto flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 mr-2 shadow-sm">
                            {currentCount} Records
                        </span>
                        <label htmlFor="statusFilter" className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Filter Status:</label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-medium cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="Not Marked">Not Marked</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                            <option value="Late">Late</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center items-center flex-col gap-4">
                        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                        <p className="text-slate-500 font-medium">Loading records...</p>
                    </div>
                ) : (
                    activeTab === 'STUDENT' ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Marked By</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">History</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    <AnimatePresence>
                                        {filteredStudentRecords.map(record => (
                                            <motion.tr
                                                key={record._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold relative overflow-hidden">
                                                            {(record.studentId?.fullName || '?').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{record.studentId?.fullName}</div>
                                                            <div className="text-xs text-slate-500 font-mono">{record.studentId?.registrationNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {record.classId?.name} - {record.sectionId?.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${record.status === 'Present' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        record.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            record.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                'bg-slate-50 text-slate-700 border-slate-200'
                                                        }`}>
                                                        {record.status === 'Present' && <UserCheck className="w-3 h-3 mr-1.5" />}
                                                        {record.status === 'Absent' && <UserX className="w-3 h-3 mr-1.5" />}
                                                        {record.status === 'Leave' && <Calendar className="w-3 h-3 mr-1.5" />}
                                                        {record.status === 'Late' && <Clock className="w-3 h-3 mr-1.5" />}
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        {record.markedBy?.avatar && (
                                                            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200">
                                                                <Image src={record.markedBy.avatar} alt={record.markedBy.fullName} fill className="object-cover" sizes="20px" />
                                                            </div>
                                                        )}
                                                        <div className="font-medium">{record.markedBy?.fullName || 'N/A'}</div>
                                                    </div>
                                                    <div className="text-xs text-slate-400 flex items-center mt-0.5">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {record.history && record.history.length > 1 && (
                                                        <div className="group/tooltip relative inline-block">
                                                            <button className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-bold bg-blue-50 px-2 py-1 rounded-md transition-colors">
                                                                <History className="w-3 h-3 mr-1.5" />
                                                                {record.history.length} Updates
                                                            </button>
                                                            {/* Tooltip */}
                                                            <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 hidden group-hover/tooltip:block z-50">
                                                                <h4 className="text-xs font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 uppercase tracking-wide">Modification Log</h4>
                                                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                                                    {record.history.map((h: { status: string; timestamp: string; reason?: string }, i: number) => (
                                                                        <div key={i} className="text-xs text-slate-600 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <span className={`font-bold px-1.5 py-0.5 rounded ${h.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.status}</span>
                                                                                <span className="text-slate-400 text-[10px]">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                                            </div>
                                                                            {h.reason && <div className="text-slate-500 italic bg-slate-50 p-1.5 rounded mt-1">&quot;{h.reason}&quot;</div>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {filteredStudentRecords.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                        <Users className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <p className="font-medium">No student records found</p>
                                                    <p className="text-sm mt-1 text-slate-400">Select a class and section to view attendance.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    <AnimatePresence>
                                        {filteredTeacherRecords.map(teacher => {
                                            const record = teacherRecords.find(r => r.teacherId._id === teacher._id);
                                            const status = record ? record.status : null;

                                            return (
                                                <motion.tr
                                                    key={teacher._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="group hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold relative overflow-hidden">
                                                                {teacher.avatar ? (
                                                                    <Image src={teacher.avatar} alt={teacher.fullName} fill className="object-cover" sizes="40px" />
                                                                ) : (
                                                                    teacher.fullName.charAt(0)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900">{teacher.fullName}</div>
                                                                <div className="text-xs text-slate-500">{teacher.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {status ? (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${status === 'Present' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                status === 'Absent' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                                }`}>
                                                                {status === 'Present' && <UserCheck className="w-3 h-3 mr-1.5" />}
                                                                {status === 'Absent' && <UserX className="w-3 h-3 mr-1.5" />}
                                                                {status === 'Leave' && <Calendar className="w-3 h-3 mr-1.5" />}
                                                                {status}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                                                                Not Marked
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex bg-slate-100/80 rounded-xl p-1 w-fit shadow-inner">
                                                            <button
                                                                onClick={() => markTeacherStatus(teacher._id, 'Present')}
                                                                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${status === 'Present'
                                                                    ? 'bg-white text-green-600 shadow-sm ring-1 ring-black/5 transform scale-105'
                                                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                                                    }`}
                                                            >
                                                                <UserCheck className={`w-3.5 h-3.5 ${status === 'Present' ? 'stroke-[2.5px]' : ''}`} />
                                                                Present
                                                            </button>
                                                            <button
                                                                onClick={() => markTeacherStatus(teacher._id, 'Absent')}
                                                                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${status === 'Absent'
                                                                    ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5 transform scale-105'
                                                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                                                    }`}
                                                            >
                                                                <UserX className={`w-3.5 h-3.5 ${status === 'Absent' ? 'stroke-[2.5px]' : ''}`} />
                                                                Absent
                                                            </button>
                                                            <button
                                                                onClick={() => markTeacherStatus(teacher._id, 'Leave')}
                                                                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${status === 'Leave'
                                                                    ? 'bg-white text-amber-600 shadow-sm ring-1 ring-black/5 transform scale-105'
                                                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                                                    }`}
                                                            >
                                                                <Calendar className={`w-3.5 h-3.5 ${status === 'Leave' ? 'stroke-[2.5px]' : ''}`} />
                                                                Leave
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                    {filteredTeacherRecords.length === 0 && (
                                        <tr><td colSpan={3} className="p-12 text-center text-slate-500">No teachers found matching criteria.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
