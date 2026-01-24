"use client"
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Loader2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

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
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Substitution Management</h1>

            {/* Date Picker */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <label htmlFor="substitutionDate" className="sr-only">Substitution Date</label>
                <Calendar className="w-5 h-5 text-gray-500" aria-hidden="true" />
                <input
                    id="substitutionDate"
                    name="substitutionDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border rounded-lg p-2"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Needed Substitutions List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Affected Classes</h2>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
                    ) : (
                        neededSubs.length === 0 ? (
                            <div className="p-8 bg-white rounded-xl border text-center text-gray-500">
                                No substitutions needed for this date (or no absent teachers found).
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {neededSubs.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer ${item.status === 'Covered'
                                            ? 'bg-green-50 border-green-200'
                                            : selectedSlot === item
                                                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                                                : 'bg-white border-gray-200 hover:border-red-300'
                                            }`}
                                        onClick={() => handleSelectSlot(item)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">
                                                        {item.class.name} - {item.section.name}
                                                    </span>
                                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                        {item.subject.name}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium text-red-600">Absent: {item.originalTeacher.fullName}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {item.timeSlot.startTime} - {item.timeSlot.endTime}
                                                </div>
                                            </div>

                                            {item.status === 'Covered' ? (
                                                <div className="text-right">
                                                    <div className="flex items-center text-green-700 text-sm font-bold mb-1">
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Covered
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Sub: <b>{item.substitution?.substituteTeacherId?.fullName || "Assigned"}</b>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); if (item.substitution?._id) deleteSubstitution(item.substitution._id); }}
                                                        className="text-xs text-red-500 hover:underline mt-1"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-amber-600 text-sm font-bold">
                                                    <AlertTriangle className="w-4 h-4 mr-1" /> Pending
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {/* Right: Assign Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Assign Substitute</h2>

                        {!selectedSlot ? (
                            <p className="text-gray-500 text-sm italic">
                                Select a &quot;Pending&quot; class from the list to find available teachers.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                    <div className="font-medium">Selected Class:</div>
                                    <div>{selectedSlot.class.name} {selectedSlot.section.name} ({selectedSlot.subject.name})</div>
                                    <div className="text-xs text-gray-500">{selectedSlot.timeSlot.startTime} - {selectedSlot.timeSlot.endTime}</div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Select Teacher</h3>
                                    {searchingTeachers ? (
                                        <div className="flex justify-center py-4"><Loader2 className="animate-spin w-5 h-5 text-gray-400" /></div>
                                    ) : availableTeachers.length === 0 ? (
                                        <div className="text-gray-500 text-sm italic">No teachers found.</div>
                                    ) : (
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                            {availableTeachers.map(teacher => (
                                                <button
                                                    key={teacher._id}
                                                    onClick={() => {
                                                        if (!teacher.isFree && !confirm(`This teacher is currently ${teacher.reason}. Do you want to assign them anyway?`)) return;
                                                        assignSubstitute(teacher._id);
                                                    }}
                                                    className={`w-full flex items-center justify-between p-2 rounded-lg group transition-colors text-left border ${teacher.isFree
                                                        ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                        : 'bg-gray-50 border-gray-100 opacity-75 hover:opacity-100'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className={`text-sm font-medium ${teacher.isFree ? 'text-gray-800' : 'text-gray-500'}`}>
                                                            {teacher.fullName}
                                                        </div>
                                                        <div className="text-xs text-gray-400 capitalize">
                                                            {teacher.qualification || 'Teacher'}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {teacher.isFree ? (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">
                                                                Free
                                                            </span>
                                                        ) : (
                                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${teacher.reason === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                                }`}>
                                                                {teacher.reason}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setSelectedSlot(null)}
                                    className="w-full mt-4 text-gray-400 text-xs hover:text-gray-600"
                                >
                                    Cancel Selection
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
