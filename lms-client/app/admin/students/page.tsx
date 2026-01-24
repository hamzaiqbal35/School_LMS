"use client"
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Loader2, Plus, Search, MoreVertical, Pencil, Eye } from 'lucide-react';

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

            const res = await api.get(`/admin/students?${params.toString()}`);
            setStudents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [keyword, selectedClass, selectedSection]);

    // Debounce search? Or just button? Button is fine per current UI pattern.
    useEffect(() => {
        // Auto-fetch when filters change (optional, but good UX)
        fetchStudents();
    }, [fetchStudents]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudents();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Students Directory</h2>
                <Link href="/admin/students/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Student
                </Link>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            id="searchKeyword"
                            name="searchKeyword"
                            type="text"
                            placeholder="Search by Name or Reg Number..."
                            aria-label="Search by Name or Reg Number"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    <select
                        id="filterClass"
                        name="filterClass"
                        aria-label="Filter by Class"
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {masterData.classes.map((c: ReferenceData) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        id="filterSection"
                        name="filterSection"
                        aria-label="Filter by Section"
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                    >
                        <option value="">All Sections</option>
                        {masterData.sections.map((s: ReferenceData) => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>

                    <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        Search
                    </button>
                    {(keyword || selectedClass || selectedSection) && (
                        <button
                            type="button"
                            onClick={() => {
                                setKeyword('');
                                setSelectedClass('');
                                setSelectedSection('');
                                // fetchStudents() will trigger via useEffect
                            }}
                            className="text-gray-500 hover:text-gray-700 px-4 py-2"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="overflow-x-visible min-h-[400px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 relative">
                                {students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.registrationNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{student.fullName}</div>
                                            <div className="text-xs text-gray-500">{student.fatherName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.classId?.name} {student.sectionId?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === student._id ? null : student._id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {openMenuId === student._id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10 cursor-default" onClick={() => setOpenMenuId(null)}></div>
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                                            <Link
                                                                href={`/admin/students/${student._id}`}
                                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" /> View Details
                                                            </Link>
                                                            <Link
                                                                href={`/admin/students/${student._id}/edit`}
                                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Pencil className="w-4 h-4 mr-2" /> Edit Student
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
