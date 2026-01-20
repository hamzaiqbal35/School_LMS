"use client"
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Loader2, Lock, Unlock, History } from 'lucide-react';

interface AttendanceRecord {
    _id: string;
    studentId: {
        _id: string;
        fullName: string;
        registrationNumber: string;
    };
    status: string;
    markedBy?: { fullName: string };
    markedAt: string;
    isFrozen: boolean;
    history?: { status: string; timestamp: string; reason?: string }[];
}

interface TeacherRecord {
    teacherId: { _id: string; fullName: string };
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

    // Teacher State
    const [teachers, setTeachers] = useState<{ _id: string; fullName: string; email: string }[]>([]);
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
        if (activeTab === 'STUDENT' && classId && sectionId) {
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Attendance Audit</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('STUDENT')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Student Attendance
                    </button>
                    <button
                        onClick={() => setActiveTab('TEACHER')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'TEACHER' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Teacher Attendance
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            className="border rounded-lg p-2"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {activeTab === 'STUDENT' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <select
                                    className="border rounded-lg p-2 min-w-[150px]"
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                >
                                    <option value="">Select Class</option>
                                    {masterData.classes.map((c: { _id: string; name: string }) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <select
                                    className="border rounded-lg p-2 min-w-[150px]"
                                    value={sectionId}
                                    onChange={(e) => setSectionId(e.target.value)}
                                >
                                    <option value="">Select Section</option>
                                    {masterData.sections.map((s: { _id: string; name: string }) => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {classId && sectionId && (
                                <div className="ml-auto self-end">
                                    <button
                                        onClick={toggleFreeze}
                                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isFrozen
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                                            }`}
                                    >
                                        {isFrozen ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                                        {isFrozen ? 'Attendance Frozen' : 'Freeze Attendance'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
                ) : (
                    activeTab === 'STUDENT' ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marked By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">History</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {studentRecords.map(record => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{record.studentId?.fullName}</div>
                                            <div className="text-xs text-gray-500">{record.studentId?.registrationNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                record.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {record.markedBy?.fullName || 'N/A'}
                                            <div className="text-xs text-gray-400">{new Date(record.markedAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {record.history && record.history.length > 1 && (
                                                <div className="group relative">
                                                    <button className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-medium">
                                                        <History className="w-3 h-3 mr-1" /> {record.history.length} Updates
                                                    </button>
                                                    {/* Tooltip */}
                                                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 p-3 hidden group-hover:block z-50">
                                                        <h4 className="text-xs font-bold text-gray-700 mb-2 border-b pb-1">Modification Log</h4>
                                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                                            {record.history.map((h: { status: string; timestamp: string; reason?: string }, i: number) => (
                                                                <div key={i} className="text-xs text-gray-600 border-b border-gray-50 pb-1 last:border-0">
                                                                    <div className="flex justify-between">
                                                                        <span className={`font-semibold ${h.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>{h.status}</span>
                                                                        <span className="text-gray-400 text-[10px]">{new Date(h.timestamp).toLocaleTimeString()}</span>
                                                                    </div>
                                                                    {h.reason && <div className="text-gray-500 italic mt-0.5">&quot;{h.reason}&quot;</div>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {studentRecords.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No student records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teachers.map(teacher => {
                                    const record = teacherRecords.find(r => r.teacherId._id === teacher._id);
                                    const status = record ? record.status : null;

                                    return (
                                        <tr key={teacher._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{teacher.fullName}</div>
                                                <div className="text-xs text-gray-500">{teacher.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {status ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${status === 'Present' ? 'bg-green-100 text-green-700' :
                                                        status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase border border-gray-200">
                                                        Not Marked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => markTeacherStatus(teacher._id, 'Present')}
                                                        className={`px-3 py-1 text-xs font-semibold rounded ${status === 'Present'
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                                                            }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => markTeacherStatus(teacher._id, 'Absent')}
                                                        className={`px-3 py-1 text-xs font-semibold rounded ${status === 'Absent'
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                                            }`}
                                                    >
                                                        Absent
                                                    </button>
                                                    <button
                                                        onClick={() => markTeacherStatus(teacher._id, 'Leave')}
                                                        className={`px-3 py-1 text-xs font-semibold rounded ${status === 'Leave'
                                                            ? 'bg-yellow-500 text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                                                            }`}
                                                    >
                                                        Leave
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {teachers.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">No teachers found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
}
