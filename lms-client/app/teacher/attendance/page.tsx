"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Save, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface Assignment {
    _id: string;
    classId: { _id: string; name: string };
    sectionId: { _id: string; name: string };
    subjectId: { _id: string; name: string };
    timeSlot: string;
}

interface Student {
    _id: string;
    registrationNumber: string;
    fullName: string;
}

interface AxiosErrorLike {
    response?: {
        data?: {
            message?: string;
        };
    };
}




export default function MarkAttendancePage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Selection state
    const [selectedAssignment, setSelectedAssignment] = useState<string>('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [marks, setMarks] = useState<Record<string, string>>({}); // studentId -> status

    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            // Fetch logged-in teacher's assignments
            const res = await api.get('/teacher/assignments');
            setAssignments(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentChange = async (assignmentId: string) => {
        setSelectedAssignment(assignmentId);
        setMsg({ type: '', text: '' });
        if (!assignmentId) {
            setStudents([]);
            return;
        }

        const assignment = assignments.find(a => a._id === assignmentId);
        if (!assignment) return;

        setLoadingStudents(true);
        try {
            // Fetch Students for this class/section
            const res = await api.get(`/teacher/students?classId=${assignment.classId._id}&sectionId=${assignment.sectionId._id}`);
            const studList: Student[] = res.data;
            setStudents(studList);

            // Initialize marks (default Present)
            const initialMarks: Record<string, string> = {};
            studList.forEach((s: Student) => initialMarks[s._id] = 'Present');
            setMarks(initialMarks);

            // Fetch existing attendance if any?
            // Optional: Check if already marked for today
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleSubmit = async () => {
        setMsg({ type: '', text: '' });
        if (!selectedAssignment || students.length === 0) return;

        const assignment = assignments.find(a => a._id === selectedAssignment);
        if (!assignment) return;

        const payload = {
            date: attendanceDate,
            classId: assignment.classId._id,
            sectionId: assignment.sectionId._id,
            subjectId: assignment.subjectId._id, // Recording Subject-wise
            records: Object.entries(marks).map(([studentId, status]) => ({
                studentId,
                status
            }))
        };

        try {
            await api.post('/attendance', payload);
            setMsg({ type: 'success', text: 'Attendance marked successfully' });


        } catch (error) {
            const err = error as AxiosErrorLike;
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to mark' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-green-600" />
                Mark Attendance
            </h1>

            {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class & Subject</label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={selectedAssignment}
                                onChange={(e) => handleAssignmentChange(e.target.value)}
                            >
                                <option value="">-- Choose Class --</option>
                                {assignments.map(a => (
                                    <option key={a._id} value={a._id}>
                                        {a.classId.name}-{a.sectionId.name} ({a.subjectId.name}) - {a.timeSlot}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full border rounded-lg p-2"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {msg.text && (
                        <div className={`p-4 mb-6 rounded-lg flex items-center ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {msg.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
                            {msg.text}
                        </div>
                    )}

                    {loadingStudents ? (
                        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-600" /></div>
                    ) : students.length > 0 ? (
                        <>
                            <div className="overflow-hidden border rounded-lg mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map(student => (
                                            <tr key={student._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registrationNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        {['Present', 'Absent', 'Leave', 'Late'].map(status => (
                                                            <button
                                                                key={status}
                                                                onClick={() => setMarks({ ...marks, [student._id]: status })}
                                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${marks[student._id] === status
                                                                    ? status === 'Present' ? 'bg-green-600 text-white'
                                                                        : status === 'Absent' ? 'bg-red-600 text-white'
                                                                            : status === 'Leave' ? 'bg-yellow-500 text-white'
                                                                                : 'bg-orange-500 text-white'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md flex items-center"
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    Save Attendance
                                </button>
                            </div>
                        </>
                    ) : selectedAssignment && (
                        <div className="text-center p-10 text-gray-500">No students found in this class.</div>
                    )}
                </div>
            )}
        </div>
    );
}
