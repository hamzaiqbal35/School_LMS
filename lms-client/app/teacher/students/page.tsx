"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Search, ArrowLeft, Phone, MapPin, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Assignment {
    _id: string;
    classId: { _id: string; name: string };
    sectionId: { _id: string; name: string };
    subjectId: { _id: string; name: string };
    timeSlotId: { day: string; startTime: string; endTime: string };
}

interface Student {
    _id: string;
    registrationNumber: string;
    fullName: string;
    fatherName: string;
    gender: string;
    dob: string;
    contactNumber?: string;
    address?: string;
}

export default function MyStudentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/teacher/assignments');
                // Filter unique class-sections to avoid duplicates if teacher teaches multiple subjects to same class
                const unique: Assignment[] = [];
                const seen = new Set();
                res.data.forEach((a: Assignment) => {
                    const key = `${a.classId._id}-${a.sectionId._id}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        unique.push(a);
                    }
                });
                setAssignments(unique);
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
        setLoadingStudents(true);
        try {
            const res = await api.get(`/teacher/students?classId=${assignment.classId._id}&sectionId=${assignment.sectionId._id}`);
            setStudents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {!selectedAssignment ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
                            <p className="text-slate-500">Select a class to view student details.</p>
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
                                        className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <GraduationCap className="w-24 h-24 text-blue-600" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="bg-blue-50 text-blue-700 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                                View Class
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                                                Class {assignment.classId.name} - {assignment.sectionId.name}
                                            </h3>
                                            <p className="text-slate-500 text-sm mb-4">Click to view student directory</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
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
                                    <p className="text-xs text-slate-500 font-medium">{filteredStudents.length} Students</p>
                                </div>
                            </div>

                            <div className="w-full md:w-72 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="searchStudents"
                                    name="searchStudents"
                                    type="text"
                                    placeholder="Search by name or roll no..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    aria-label="Search Students"
                                />
                            </div>
                        </div>

                        {loadingStudents ? (
                            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
                        ) : (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredStudents.map((student) => (
                                    <div key={student._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
                                            {student.fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-slate-900 truncate pr-2">{student.fullName}</h3>
                                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{student.registrationNumber}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-3">{student.fatherName}</p>

                                            <div className="space-y-1">
                                                {student.contactNumber && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        <span>{student.contactNumber}</span>
                                                    </div>
                                                )}
                                                {student.address && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <MapPin className="w-3 h-3 text-slate-400" />
                                                        <span className="truncate">{student.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <div className="col-span-full text-center py-10 text-slate-400">
                                        No students found matching &quot;{searchTerm}&quot;
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
