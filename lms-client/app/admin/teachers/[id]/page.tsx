"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatTime12Hour } from '@/lib/utils';
import { Loader2, ArrowLeft, Mail, Phone, BookOpen, Calendar, User as UserIcon, Award } from 'lucide-react';
import Image from 'next/image';
import { use } from 'react';

interface Teacher {
    fullName: string;
    email: string;
    isActive: boolean;
    phoneNumber?: string;
    qualifications?: string[];
    qualifiedSubjects?: Array<{ _id: string; name: string }>;
    avatar?: string;
}

interface Assignment {
    _id: string;
    active: boolean;
    timeSlotId: {
        startTime: string;
        endTime: string;
        day: string;
        label: string;
    };
    subjectId: {
        name: string;
        code: string;
    };
    classId: {
        name: string;
    };
    sectionId: {
        name: string;
    };
}

interface AttendanceRecord {
    _id: string;
    date: string;
    status: string;
    markedBy?: { fullName: string };
}

export default function TeacherDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]); // Using strictly typed interface
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const historyQuery = selectedMonth
                ? `/teacher-attendance?teacherId=${resolvedParams.id}&month=${selectedMonth}`
                : `/teacher-attendance?teacherId=${resolvedParams.id}&limit=10`;

            const [teacherRes, assignRes, attendanceRes] = await Promise.all([
                api.get(`/admin/teachers/${resolvedParams.id}`),
                api.get(`/admin/assignments?teacherId=${resolvedParams.id}`),
                api.get(historyQuery)
            ]);
            setTeacher(teacherRes.data);
            setAssignments(assignRes.data);
            setAttendance(attendanceRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [resolvedParams.id, selectedMonth]);

    useEffect(() => {
        if (resolvedParams.id) {
            fetchData();
        }
    }, [resolvedParams.id, fetchData]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
    if (!teacher) return <div className="p-10 text-center">Teacher not found</div>;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // Find assignments that don't match any known day
    const otherAssignments = assignments.filter(a => a.active && !days.includes(a.timeSlotId?.day));

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gray-100/95 backdrop-blur-sm py-4 mb-2 flex justify-between items-start -mx-4 px-4 sm:-mx-0 sm:px-0">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 flex items-center mb-4 transition-colors bg-white/50 p-2 rounded-lg shadow-sm hover:bg-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teachers
                </button>
            </div>

            {/* Profile Hero */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <UserIcon className="w-64 h-64" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 relative overflow-hidden">
                        {teacher.avatar ? (
                            <Image
                                src={teacher.avatar}
                                alt={teacher.fullName}
                                fill
                                className="object-cover"
                                sizes="128px"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-700 text-5xl font-bold bg-white">
                                {(teacher.fullName || '?').charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-bold">{teacher.fullName}</h1>
                        <p className="text-blue-100 text-lg flex items-center justify-center md:justify-start gap-2">
                            <Mail className="w-4 h-4" /> {teacher.email}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${teacher.isActive ? 'bg-white text-blue-700' : 'bg-red-500 text-white'}`}>
                                {teacher.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="flex items-center text-blue-50 text-sm bg-black/10 px-3 py-1 rounded-full">
                                <Phone className="w-3 h-3 mr-2" /> {teacher.phoneNumber || 'No Phone'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="space-y-6 md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center pb-3 border-b">
                            <Award className="w-5 h-5 mr-2 text-blue-600" /> Qualifications
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Degrees</p>
                                <div className="flex flex-wrap gap-2">
                                    {(teacher.qualifications && teacher.qualifications.length > 0) ? (
                                        teacher.qualifications.map((q: string, i: number) => (
                                            <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">{q}</span>
                                        ))
                                    ) : <span className="text-gray-400 text-sm">N/A</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Qualified Subjects</p>
                                <div className="flex flex-wrap gap-2">
                                    {(teacher.qualifiedSubjects && teacher.qualifiedSubjects.length > 0) ? (
                                        teacher.qualifiedSubjects.map((s) => (
                                            <span key={s._id} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-sm font-medium">
                                                {s.name}
                                            </span>
                                        ))
                                    ) : <span className="text-gray-400 text-sm">None</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Workload/Schedule & History */}
                <div className="md:col-span-2 space-y-6">
                    {/* Schedule */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center justify-between pb-3 border-b">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Weekly Schedule
                            </div>
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {assignments.filter(a => a.active).length} Classes / Week
                            </span>
                        </h3>

                        {assignments.length > 0 ? (
                            <div className="grid gap-4">
                                {days.map(day => {
                                    const dayAssignments = assignments.filter(a => a.active && a.timeSlotId?.day === day);
                                    if (dayAssignments.length === 0) return null;

                                    return (
                                        <div key={day} className="border rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 border-b flex justify-between">
                                                <span>{day}</span>
                                            </div>
                                            <div className="divide-y">
                                                {dayAssignments.map(assign => (
                                                    <div key={assign._id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-center w-24">
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {formatTime12Hour(assign.timeSlotId?.startTime)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {formatTime12Hour(assign.timeSlotId?.endTime)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {assign.subjectId?.name} <span className="text-gray-400 text-xs">({assign.subjectId?.code})</span>
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    Class {assign.classId?.name} - {assign.sectionId?.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                                                            {assign.timeSlotId?.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}

                                {otherAssignments.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden border-yellow-200">
                                        <div className="bg-yellow-50 px-4 py-2 font-semibold text-yellow-800 border-b border-yellow-100 flex justify-between">
                                            <span>Unscheduled / Other</span>
                                        </div>
                                        <div className="divide-y">
                                            {otherAssignments.map(assign => (
                                                <div key={assign._id} className="p-3 flex items-center justify-between hover:bg-yellow-50/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center w-24">
                                                            <p className="text-sm font-bold text-gray-800">
                                                                {formatTime12Hour(assign.timeSlotId?.startTime)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatTime12Hour(assign.timeSlotId?.endTime)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {assign.subjectId?.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Class {assign.classId?.name} - {assign.sectionId?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                                        {assign.timeSlotId?.day || 'Unknown'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No classes assigned yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Attendance History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-green-600" /> Attendance History
                            </h3>
                            <input
                                type="month"
                                id="attendanceMonth"
                                name="attendanceMonth"
                                aria-label="Filter by Month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-gray-50"
                            />
                        </div>

                        {attendance.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Marked By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {attendance.map((record) => (
                                            <tr key={record._id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {new Date(record.date).toLocaleDateString(undefined, {
                                                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                        ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                            record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                                record.status === 'Leave' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {record.markedBy?.fullName || 'System'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 border border-dashed rounded-lg">
                                <p>No attendance records found for this period.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
