"use client"
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Loader2, Plus, Search, MoreVertical, Pencil, Eye, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
    _id: string;
    registrationNumber: string;
    fullName: string;
    fatherName: string;
    status: string;
    classId?: { name: string };
    sectionId?: { name: string };
}

interface ReferenceData {
    _id: string;
    name: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [masterData, setMasterData] = useState<{ classes: ReferenceData[]; sections: ReferenceData[] }>({ classes: [], sections: [] });
    const [loading, setLoading] = useState(true);

    // Filters
    const [keyword, setKeyword] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const fetchInitialData = async () => {
        try {
            const [sRes, mRes] = await Promise.all([
                api.get('/admin/students'), // Initial fetch all
                api.get('/admin/master-data')
            ]);
            setStudents(sRes.data);
            setMasterData(mRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            if (selectedClass) params.append('classId', selectedClass);
            if (selectedSection) params.append('sectionId', selectedSection);
            if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

            const res = await api.get(`/admin/students?${params.toString()}`);
            setStudents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [keyword, selectedClass, selectedSection, statusFilter]);

    useEffect(() => {
        // Auto-fetch when filters change (optional, but good UX)
        // Debounce could be added for keyword if needed
        const timer = setTimeout(() => {
            fetchStudents();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchStudents]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudents();
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
                        {!loading && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                                {students.length} {students.length === 1 ? 'Student' : 'Students'}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 mt-1">Manage student enrollments and profiles</p>
                </div>
                <Link href="/admin/students/create" className="group bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all transform hover:scale-[1.02]">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Admit Student
                </Link>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleSearch} className="grid md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                        <label htmlFor="searchKeyword" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                id="searchKeyword"
                                name="searchKeyword"
                                type="text"
                                placeholder="Search by Name or Reg Number..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <label htmlFor="filterClass" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Class</label>
                        <select
                            id="filterClass"
                            name="filterClass"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all appearance-none"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">All Classes</option>
                            {masterData.classes.map((c: ReferenceData) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <label htmlFor="filterSection" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Section</label>
                        <select
                            id="filterSection"
                            name="filterSection"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all appearance-none"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            <option value="">All Sections</option>
                            {masterData.sections.map((s: ReferenceData) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="filterStatus" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Status</label>
                        <select
                            id="filterStatus"
                            name="filterStatus"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="PassedOut">Passed Out</option>
                            <option value="Expelled">Expelled</option>
                        </select>
                    </div>
                </form>
            </div>

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-slate-500 font-medium">Loading directory...</p>
                    </div>
                ) : (
                    <>
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                        >
                            <AnimatePresence>
                                {students.map((student) => (
                                    <motion.div
                                        key={student._id}
                                        variants={item}
                                        className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-3 z-10">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === student._id ? null : student._id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                {openMenuId === student._id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setOpenMenuId(null)}></div>
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            <Link
                                                                href={`/admin/students/${student._id}`}
                                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" /> View Details
                                                            </Link>
                                                            <Link
                                                                href={`/admin/students/${student._id}/edit`}
                                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                                                            >
                                                                <Pencil className="w-4 h-4 mr-2" /> Edit Student
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors`}>
                                                {student.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 line-clamp-1" title={student.fullName}>{student.fullName}</h3>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{student.registrationNumber}</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mt-2 ${student.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {student.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-slate-400 font-bold block mb-0.5">Class</span>
                                                <span className="text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded inline-block">
                                                    {student.classId?.name || 'N/A'} {student.sectionId?.name}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-bold block mb-0.5">Father</span>
                                                <span className="text-slate-700 font-medium truncate block" title={student.fatherName}>
                                                    {student.fatherName}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {students.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <GraduationCap className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No students found</h3>
                                <p className="text-slate-500 max-w-sm text-center mt-1">
                                    Try adjusting your search criteria or add a new student to the directory.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
