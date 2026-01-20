"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react';

interface TimeSlot {
    _id: string;
    day: string;
    startTime: string;
    endTime: string;
    name?: string; // Optional if backend sends it, or we construct it
}

interface MasterData {
    classes: { _id: string; name: string }[];
    sections: { _id: string; name: string }[];
    subjects: { _id: string; name: string }[];
    teachers: { _id: string; fullName: string }[];
    timeslots: TimeSlot[];
}

interface Assignment {
    _id: string;
    classId: { _id: string; name: string };
    sectionId: { _id: string; name: string };
    subjectId: { _id: string; name: string };
    teacherId: { _id: string; fullName: string };
    timeSlotId: TimeSlot;
}

export default function AssignmentsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MasterData>({ classes: [], sections: [], subjects: [], teachers: [], timeslots: [] });
    const [assignments, setAssignments] = useState<Assignment[]>([]);


    // Form State
    const [formData, setFormData] = useState({
        teacherId: '',
        classId: '',
        sectionId: '',
        subjectId: '',
        timeSlotId: ''
    });
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [masterRes, assignRes] = await Promise.all([
                api.get('/admin/master-data'),
                api.get('/admin/assignments')
            ]);
            setData(masterRes.data);
            setAssignments(assignRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });

        try {
            const res = await api.post('/admin/assignments', formData);
            setAssignments([...assignments, res.data]); // Optimistic update ideally, but this is fine
            setMsg({ type: 'success', text: 'Teacher assigned successfully' });
            // Fetch again to be sure of populated fields
            fetchData();
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setMsg({ type: 'error', text: error.response?.data?.message || 'Assignment failed' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this assignment?')) return;
        try {
            await api.delete(`/admin/assignments/${id}`);
            setAssignments(assignments.filter(a => a._id !== id));
        } catch {
            alert('Failed to delete');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Teacher Assignments</h2>
            </div>

            {/* Assignment Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">New Assignment</h3>
                {msg.text && (
                    <div className={`p-3 mb-4 rounded-lg flex items-center ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {msg.type === 'error' ? <AlertCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        {msg.text}
                    </div>
                )}
                <form onSubmit={handleAssign} className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 items-end">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.teacherId}
                            onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                            required
                        >
                            <option value="">Select Teacher</option>
                            {data.teachers.map((t: { _id: string; fullName: string }) => (
                                <option key={t._id} value={t._id}>{t.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.classId}
                            onChange={e => setFormData({ ...formData, classId: e.target.value })}
                            required
                        >
                            <option value="">Select Class</option>
                            {data.classes.map((c: { _id: string; name: string }) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.sectionId}
                            onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                            required
                        >
                            <option value="">Select Section</option>
                            {data.sections.map((s: { _id: string; name: string }) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.subjectId}
                            onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                            required
                        >
                            <option value="">Select Subject</option>
                            {data.subjects.map((s: { _id: string; name: string }) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={formData.timeSlotId}
                            onChange={e => setFormData({ ...formData, timeSlotId: e.target.value })}
                            required
                        >
                            <option value="">Select Slot</option>
                            {data.timeslots.map((slot: TimeSlot) => (
                                <option key={slot._id} value={slot._id}>
                                    {slot.name} ({slot.day})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                            Assign
                        </button>
                    </div>
                </form>
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class / Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {assignments.map((assignment) => (
                            <tr key={assignment._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {assignment.teacherId?.fullName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {assignment.classId?.name} - {assignment.sectionId?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {assignment.subjectId?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {assignment.timeSlotId?.name}
                                    <span className="text-xs text-gray-400 block">{assignment.timeSlotId?.day} | {assignment.timeSlotId?.startTime}-{assignment.timeSlotId?.endTime}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(assignment._id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {assignments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No active assignments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
