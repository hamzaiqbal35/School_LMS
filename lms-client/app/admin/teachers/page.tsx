"use client"
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2, X, Check, Search, MoreVertical, Eye, EyeOff, Mail, Phone, BookOpen, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AxiosErrorLike {
    response?: {
        data?: {
            message?: string;
        };
    };
}

interface Subject {
    _id: string;
    name: string;
}

interface Teacher {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    qualifications?: string[];
    qualifiedSubjects?: Subject[];
    assignedSubjects?: Subject[];
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState('');

    const fetchInitialData = async () => {
        try {
            const [tRes, sRes] = await Promise.all([
                api.get('/admin/teachers'),
                api.get('/admin/master-data') // to get subjects
            ]);
            setTeachers(tRes.data);
            setSubjects(sRes.data.subjects || []);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            if (selectedSubject) params.append('subjectId', selectedSubject);
            params.append('t', new Date().getTime().toString()); // Cache busting

            const res = await api.get(`/admin/teachers?${params.toString()}`);
            setTeachers(res.data);
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        } finally {
            setLoading(false);
        }
    }, [keyword, selectedSubject]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTeachers();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchTeachers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTeachers();
    };

    // Use teachers directly as they are now filtered from backend
    const filteredTeachers = teachers;

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        qualifiedSubjects: [] as string[],
        qualifications: [] as string[]
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/admin/teachers/${editingId}`, formData);
            } else {
                await api.post('/admin/teachers', formData);
            }
            setShowModal(false);
            fetchTeachers();
            // Reset form
            setFormData({ fullName: '', email: '', password: '', phoneNumber: '', qualifiedSubjects: [], qualifications: [] });
            setEditingId(null);
        } catch (error) {
            const err = error as AxiosErrorLike;
            alert(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (teacher: Teacher) => {
        setEditingId(teacher._id);
        setFormData({
            fullName: teacher.fullName,
            email: teacher.email,
            password: '', // Don't fill password
            phoneNumber: teacher.phoneNumber || '',
            qualifiedSubjects: teacher.qualifiedSubjects?.map((s) => s._id) || [],
            qualifications: teacher.qualifications || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this teacher and all their data? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/teachers/${id}`);
            fetchTeachers();
        } catch {
            alert('Failed to delete');
        }
    };

    const toggleSubject = (subjectId: string) => {
        setFormData(prev => {
            const current = prev.qualifiedSubjects;
            if (current.includes(subjectId)) {
                return { ...prev, qualifiedSubjects: current.filter(id => id !== subjectId) };
            } else {
                return { ...prev, qualifiedSubjects: [...current, subjectId] };
            }
        });
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty Management</h1>
                    <p className="text-slate-500 mt-1">Manage teacher profiles, qualifications and subjects</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ fullName: '', email: '', password: '', phoneNumber: '', qualifiedSubjects: [], qualifications: [] });
                        setShowModal(true);
                    }}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Add Faculty
                </button>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <label htmlFor="teacherSearch" className="sr-only">Search teachers</label>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            id="teacherSearch"
                            name="teacherSearch"
                            type="text"
                            placeholder="Search by name, email..."
                            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm transition-all"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        {keyword && (
                            <button
                                onClick={() => setKeyword('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                    <div className="w-full md:w-64">
                        <label htmlFor="subjectFilter" className="sr-only">Filter by subject</label>
                        <div className="relative">
                            <select
                                id="subjectFilter"
                                name="subjectFilter"
                                className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none shadow-sm transition-all"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
                        <p className="text-slate-500 font-medium">Loading faculty...</p>
                    </div>
                ) : (
                    <>
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence>
                                {filteredTeachers.map(teacher => (
                                    <motion.div
                                        key={teacher._id}
                                        variants={item}
                                        className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col relative overflow-hidden"
                                    >
                                        {/* Decorative Top Banner */}
                                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                                            <div className="absolute top-3 right-3 z-10">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === teacher._id ? null : teacher._id)}
                                                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                <AnimatePresence>
                                                    {openMenuId === teacher._id && (
                                                        <>
                                                            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setOpenMenuId(null)} />
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden"
                                                            >
                                                                <Link href={`/admin/teachers/${teacher._id}`} className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors">
                                                                    <Eye className="w-4 h-4 mr-2" /> View Profile
                                                                </Link>
                                                                <button
                                                                    onClick={() => { setOpenMenuId(null); handleEdit(teacher); }}
                                                                    className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                                                                >
                                                                    <Pencil className="w-4 h-4 mr-2" /> Edit Details
                                                                </button>
                                                                <div className="h-px bg-slate-100 my-1" />
                                                                <button
                                                                    onClick={() => { setOpenMenuId(null); handleDelete(teacher._id); }}
                                                                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Deactivate
                                                                </button>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6 flex-1 flex flex-col">
                                            {/* Avatar moving up into banner */}
                                            <div className="relative -mt-12 mb-4 flex justify-between items-end">
                                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md">
                                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-3xl border border-slate-100">
                                                        {(teacher.fullName || 'T').charAt(0)}
                                                    </div>
                                                </div>
                                                {/* Quick Badge or Role could go here */}
                                                <div className="mb-1">
                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
                                                        ACTIVE
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-5">
                                                <h3 className="font-bold text-slate-900 text-xl truncate" title={teacher.fullName}>{teacher.fullName}</h3>

                                                <div className="flex flex-col gap-1.5 mt-2">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group/link">
                                                        <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/link:bg-blue-50 group-hover/link:text-blue-600 transition-colors">
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </span>
                                                        <span className="truncate">{teacher.email}</span>
                                                    </div>
                                                    {teacher.phoneNumber && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                                            <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                                                <Phone className="w-3.5 h-3.5" />
                                                            </span>
                                                            <span>{teacher.phoneNumber}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-auto space-y-4">
                                                {/* Qualifications */}
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Qualifications</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(!teacher.qualifications || teacher.qualifications.length === 0) ? (
                                                            <span className="text-xs text-slate-400 italic">N/A</span>
                                                        ) : (
                                                            teacher.qualifications.slice(0, 2).map((q, i) => (
                                                                <span key={i} className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                                                    {q}
                                                                </span>
                                                            ))
                                                        )}
                                                        {teacher.qualifications && teacher.qualifications.length > 2 && (
                                                            <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">+{teacher.qualifications.length - 2}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Subjects */}
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Teaching Subjects</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(!teacher.qualifiedSubjects || teacher.qualifiedSubjects.length === 0) ? (
                                                            <span className="text-xs text-slate-400 italic">No assignments</span>
                                                        ) : (
                                                            teacher.qualifiedSubjects.slice(0, 3).map((s) => (
                                                                <span key={s._id} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                                                                    <BookOpen className="w-3 h-3 opacity-50" />
                                                                    {s.name}
                                                                </span>
                                                            ))
                                                        )}
                                                        {(teacher.qualifiedSubjects?.length || 0) > 3 && (
                                                            <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200">
                                                                +{teacher.qualifiedSubjects && teacher.qualifiedSubjects.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filteredTeachers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 col-span-full">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No faculty found</h3>
                                <p className="text-slate-500 max-w-sm text-center mt-1 mb-4">
                                    No teachers match your search or filter criteria.
                                </p>
                                <button
                                    onClick={() => { setKeyword(''); setSelectedSubject(''); }}
                                    className="text-blue-600 font-bold hover:underline flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Clear filters & search
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                                <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Profile' : 'New Faculty Member'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text" required
                                            autoComplete="name"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="e.g. Dr. Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email" required
                                            autoComplete="email"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="jane@school.edu"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Phone Number</label>
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="text"
                                            autoComplete="tel"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            placeholder="+92 300 1234567"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                            Password {editingId && <span className="text-slate-400 font-normal normal-case">(Optional)</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                required={!editingId}
                                                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                placeholder={editingId ? "Leave blank to keep current" : "Set initial password"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="qualifications" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Qualifications (Comma separated)</label>
                                    <input
                                        id="qualifications"
                                        name="qualifications"
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. MSc Physics, B.Ed, PhD Education"
                                        value={formData.qualifications.join(', ')}
                                        onChange={e => setFormData({ ...formData, qualifications: e.target.value.split(',').map(s => s.trim()) })}
                                    />
                                </div>

                                <div>
                                    <p className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Qualified Subjects</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border border-slate-200 p-4 rounded-xl bg-slate-50/50 max-h-48 overflow-y-auto custom-scrollbar">
                                        {subjects.length === 0 && (
                                            <div className="col-span-3 text-center text-sm text-slate-500 py-4">
                                                No subjects found. <Link href="/admin/classes" className="text-blue-600 hover:underline font-bold">Add subjects here</Link> first.
                                            </div>
                                        )}
                                        {subjects.map(subject => (
                                            <label key={subject._id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all border ${formData.qualifiedSubjects.includes(subject._id) ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.qualifiedSubjects.includes(subject._id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                    {formData.qualifiedSubjects.includes(subject._id) && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.qualifiedSubjects.includes(subject._id)}
                                                    onChange={() => toggleSubject(subject._id)}
                                                />
                                                <span className={`text-sm font-medium ${formData.qualifiedSubjects.includes(subject._id) ? 'text-blue-900' : 'text-slate-700'}`}>{subject.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : (editingId ? 'Update Profile' : 'Onboard Faculty')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >
        </div >
    );
}
