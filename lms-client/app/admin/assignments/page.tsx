"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { AlertCircle, CheckCircle, Loader2, Trash2, Calendar, Clock, BookOpen, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface TimeSlot {
    _id: string;
    day: string;
    startTime: string;
    endTime: string;
    name?: string;
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
    teacherId: { _id: string; fullName: string; avatar?: string };
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
        timeSlotIds: [] as string[]
    });
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [submitting, setSubmitting] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterTeacher, setFilterTeacher] = useState('');

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

        if (formData.timeSlotIds.length === 0) {
            setMsg({ type: 'error', text: 'Please select at least one time slot' });
            return;
        }

        setSubmitting(true);

        try {
            const res = await api.post('/admin/assignments', formData);

            // Backend now returns { message, assignments: [], warnings: [] }
            // If arrays, we prepend them
            if (res.data.assignments) {
                setAssignments([...assignments, ...res.data.assignments]);
                setMsg({ type: 'success', text: res.data.message || 'Assignments created successfully' });
            } else {
                // Fallback for single object return (legacy)
                setAssignments([...assignments, res.data]);
                setMsg({ type: 'success', text: 'Assignment created' });
            }

            // Warnings?
            if (res.data.warnings && res.data.warnings.length > 0) {
                alert(`Note: Some slots had issues:\n${res.data.warnings.join('\n')}`);
            }

            // Fetch again to be sure of populated fields
            fetchData();
            // Reset slots only to allow quick add for same teacher/class
            setFormData(prev => ({ ...prev, timeSlotIds: [] }));
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setMsg({ type: 'error', text: error.response?.data?.message || 'Assignment failed' });
        } finally {
            setSubmitting(false);
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

    // Helper to toggle slots
    const toggleSlot = (id: string) => {
        setFormData(prev => {
            if (prev.timeSlotIds.includes(id)) {
                return { ...prev, timeSlotIds: prev.timeSlotIds.filter(sid => sid !== id) };
            } else {
                return { ...prev, timeSlotIds: [...prev.timeSlotIds, id] };
            }
        });
    };

    // Group timeslots by day
    const groupedSlots = data.timeslots.reduce((acc, slot) => {
        if (!acc[slot.day]) acc[slot.day] = [];
        acc[slot.day].push(slot);
        return acc;
    }, {} as Record<string, TimeSlot[]>);

    // Days order
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


    // Filter Logic
    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = searchTerm === '' ||
            assignment.teacherId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.classId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesClass = filterClass === '' || assignment.classId?._id === filterClass;
        const matchesSubject = filterSubject === '' || assignment.subjectId?._id === filterSubject;
        const matchesTeacher = filterTeacher === '' || assignment.teacherId?._id === filterTeacher;

        return matchesSearch && matchesClass && matchesSubject && matchesTeacher;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setFilterClass('');
        setFilterSubject('');
        setFilterTeacher('');
    };


    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Teacher Assignments</h2>
                    <p className="text-slate-500 mt-1">Manage class schedules and allocations</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Visual Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                    <Calendar className="w-5 h-5" />
                                </span>
                                New Assignment
                            </h3>
                        </div>

                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {msg.text && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`p-4 mb-6 rounded-xl flex items-start gap-3 text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}
                                    >
                                        {msg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                                        <p>{msg.text}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleAssign} className="space-y-5">
                                <div>
                                    <label htmlFor="teacherId" className="block text-sm font-bold text-slate-700 mb-1.5">Teacher</label>
                                    <select
                                        id="teacherId"
                                        name="teacherId"
                                        className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="classId" className="block text-sm font-bold text-slate-700 mb-1.5">Class</label>
                                        <select
                                            id="classId"
                                            name="classId"
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
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
                                        <label htmlFor="sectionId" className="block text-sm font-bold text-slate-700 mb-1.5">Section</label>
                                        <select
                                            id="sectionId"
                                            name="sectionId"
                                            className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
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
                                </div>

                                <div>
                                    <label htmlFor="subjectId" className="block text-sm font-bold text-slate-700 mb-1.5">Subject</label>
                                    <select
                                        id="subjectId"
                                        name="subjectId"
                                        className="w-full border border-slate-200 rounded-xl p-3 text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
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

                                <div>
                                    <p className="block text-sm font-bold text-slate-700 mb-3">Time Slots</p>
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                        {daysOrder.map(day => {
                                            const slots = groupedSlots[day];
                                            if (!slots || slots.length === 0) return null;

                                            return (
                                                <div key={day} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{day}</div>
                                                    <div className="space-y-2">
                                                        {slots.map(slot => (
                                                            <label key={slot._id} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${formData.timeSlotIds.includes(slot._id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                                                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${formData.timeSlotIds.includes(slot._id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                                                                    {formData.timeSlotIds.includes(slot._id) && <Check className="w-3 h-3" />}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={formData.timeSlotIds.includes(slot._id)}
                                                                    onChange={() => toggleSlot(slot._id)}
                                                                />
                                                                <div>
                                                                    <div className="text-sm font-bold text-slate-700">{slot.name}</div>
                                                                    <div className="text-xs text-slate-500">{slot.startTime} - {slot.endTime}</div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {data.timeslots.length === 0 && <p className="text-sm text-slate-400 italic">No time slots found. Create them in Classes &gt; Time Slots.</p>}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Select multiple slots for the same class/subject</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Assign Teacher'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Assignments List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="font-bold text-slate-900">Current Assignments</h3>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{filteredAssignments.length} Found</span>
                        </div>

                        {/* Filters */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        id="searchAssignments"
                                        name="searchAssignments"
                                        type="text"
                                        placeholder="Search teacher, subject or class..."
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        aria-label="Search Assignments"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                    <select
                                        id="filterClass"
                                        name="filterClass"
                                        className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 outline-none focus:border-blue-500 min-w-[140px]"
                                        value={filterClass}
                                        onChange={(e) => setFilterClass(e.target.value)}
                                        aria-label="Filter by Class"
                                    >
                                        <option value="">All Classes</option>
                                        {data.classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                    <select
                                        id="filterSubject"
                                        name="filterSubject"
                                        className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 outline-none focus:border-blue-500 min-w-[140px]"
                                        value={filterSubject}
                                        onChange={(e) => setFilterSubject(e.target.value)}
                                        aria-label="Filter by Subject"
                                    >
                                        <option value="">All Subjects</option>
                                        {data.subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                    <select
                                        id="filterTeacher"
                                        name="filterTeacher"
                                        className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 outline-none focus:border-blue-500 min-w-[140px]"
                                        value={filterTeacher}
                                        onChange={(e) => setFilterTeacher(e.target.value)}
                                        aria-label="Filter by Teacher"
                                    >
                                        <option value="">All Teachers</option>
                                        {data.teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
                                    </select>
                                    {(searchTerm || filterClass || filterSubject || filterTeacher) && (
                                        <button
                                            onClick={clearFilters}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher & Subject</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 h-96 overflow-y-auto">
                                    <AnimatePresence>
                                        {filteredAssignments.map((assignment) => (
                                            <motion.tr
                                                key={assignment._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="group hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 text-xl font-bold rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center relative overflow-hidden">
                                                            {assignment.teacherId?.avatar ? (
                                                                <Image
                                                                    src={assignment.teacherId.avatar}
                                                                    alt={assignment.teacherId.fullName}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="40px"
                                                                />
                                                            ) : (
                                                                (assignment.teacherId?.fullName || 'T').charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-slate-900">{assignment.teacherId?.fullName}</div>
                                                            <div className="text-sm text-slate-500">{assignment.subjectId?.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {assignment.classId?.name} - {assignment.sectionId?.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm text-slate-900 font-medium flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {assignment.timeSlotId?.startTime} - {assignment.timeSlotId?.endTime}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{assignment.timeSlotId?.day} | {assignment.timeSlotId?.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDelete(assignment._id)}
                                                        className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                        title="Delete Assignment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {assignments.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                                        <BookOpen className="w-8 h-8" />
                                                    </div>
                                                    <p className="font-medium text-slate-900">No assignments yet</p>
                                                    <p className="text-sm mt-1">Assignments you create will appear here.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
