"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2, X, Check, Search, MoreVertical, Eye } from 'lucide-react';

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
}



export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [selectedSubject, setSelectedSubject] = useState('');

    const filteredTeachers = teachers.filter(t => {
        const matchesKeyword = t.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
            t.email.toLowerCase().includes(keyword.toLowerCase());

        const matchesSubject = selectedSubject === '' ||
            t.qualifiedSubjects?.some((qs) => qs._id === selectedSubject);

        return matchesKeyword && matchesSubject;
    });

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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tRes, sRes] = await Promise.all([
                api.get('/admin/teachers'),
                api.get('/admin/master-data') // to get subjects
            ]);
            setTeachers(tRes.data);
            setSubjects(sRes.data.subjects || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
            fetchData();
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
        if (!confirm('Deactivate this teacher?')) return;
        try {
            await api.delete(`/admin/teachers/${id}`);
            fetchData();
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <select
                        className="p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ fullName: '', email: '', password: '', phoneNumber: '', qualifiedSubjects: [], qualifications: [] });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm whitespace-nowrap"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Teacher
                </button>
            </div>

            {loading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map(teacher => (
                        <div key={teacher._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setOpenMenuId(openMenuId === teacher._id ? null : teacher._id)}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>

                                {openMenuId === teacher._id && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                        <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1">
                                            <Link href={`/admin/teachers/${teacher._id}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                <Eye className="w-4 h-4 mr-2" /> View Details
                                            </Link>
                                            <button
                                                onClick={() => { setOpenMenuId(null); handleEdit(teacher); }}
                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Pencil className="w-4 h-4 mr-2" /> Edit
                                            </button>
                                            <button
                                                onClick={() => { setOpenMenuId(null); handleDelete(teacher._id); }}
                                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4">
                                    {(teacher.fullName || 'T').charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{teacher.fullName}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{teacher.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-gray-50">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                        Qualifications
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1 line-clamp-1">{teacher.qualifications?.join(', ') || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Qualified Subjects</p>
                                    <div className="flex flex-wrap gap-1">
                                        {teacher.qualifiedSubjects?.slice(0, 3).map((s) => (
                                            <span key={s._id} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-100">
                                                {s.name}
                                            </span>
                                        ))}
                                        {(teacher.qualifiedSubjects?.length || 0) > 3 && (
                                            <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-full border border-gray-100">
                                                +{teacher.qualifiedSubjects && teacher.qualifiedSubjects.length - 3}
                                            </span>
                                        )}
                                        {(!teacher.qualifiedSubjects || teacher.qualifiedSubjects.length === 0) && <span className="text-gray-400 text-xs">None</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTeachers.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">No teachers found matching your criteria.</p>}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text" required
                                        className="w-full border rounded p-2"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email" required
                                        className="w-full border rounded p-2"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded p-2"
                                        value={formData.phoneNumber}
                                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password {editingId && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingId}
                                        className="w-full border rounded p-2"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications (Comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    placeholder="e.g. MSc Physics, B.Ed"
                                    value={formData.qualifications.join(', ')}
                                    onChange={e => setFormData({ ...formData, qualifications: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Qualified Subjects</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded-lg max-h-40 overflow-y-auto">
                                    {subjects.length === 0 && (
                                        <div className="col-span-3 text-center text-sm text-gray-500 py-4">
                                            No subjects found. <Link href="/admin/classes" className="text-blue-600 hover:underline">Add subjects here</Link> first.
                                        </div>
                                    )}
                                    {subjects.map(subject => (
                                        <label key={subject._id} className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${formData.qualifiedSubjects.includes(subject._id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.qualifiedSubjects.includes(subject._id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                                {formData.qualifiedSubjects.includes(subject._id) && <Check className="w-3 h-3" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.qualifiedSubjects.includes(subject._id)}
                                                onChange={() => toggleSubject(subject._id)}
                                            />
                                            <span className="text-sm text-gray-700">{subject.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-2 border-t mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {submitting ? 'Saving...' : (editingId ? 'Update Teacher' : 'Create Teacher')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
