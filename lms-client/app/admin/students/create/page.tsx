"use client"
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

// Reusable Input Component (internal)
const InputGroup = ({ label, name, type = "text", value, onChange, required = false }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
    </div>
);

const SelectGroup = ({ label, name, value, onChange, options, required = false }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        >
            <option value="">Select...</option>
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export default function StudentForm({ params }: { params: Promise<{ id?: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const isEdit = !!resolvedParams?.id;

    const [loading, setLoading] = useState(false);
    const [masterData, setMasterData] = useState<any>({ classes: [], sections: [] });

    const [formData, setFormData] = useState({
        registrationNumber: '',
        fullName: '',
        fatherName: '',
        dob: '',
        gender: '',
        phoneNumber: '',
        classId: '',
        sectionId: '',
        monthlyFee: '',
        discountAmount: '0',
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'Active'
    });

    useEffect(() => {
        fetchMasterData();
        if (isEdit) {
            fetchStudent();
        }
    }, []);

    const fetchMasterData = async () => {
        try {
            const res = await api.get('/admin/master-data');
            setMasterData(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudent = async () => {
        try {
            const res = await api.get(`/admin/students/${resolvedParams?.id}`);
            const s = res.data;
            setFormData({
                registrationNumber: s.registrationNumber,
                fullName: s.fullName,
                fatherName: s.fatherName,
                dob: s.dob ? s.dob.split('T')[0] : '',
                gender: s.gender,
                phoneNumber: s.phoneNumber || '',
                classId: s.classId?._id || s.classId,
                sectionId: s.sectionId?._id || s.sectionId,
                monthlyFee: s.monthlyFee,
                discountAmount: s.discountAmount || '0',
                admissionDate: s.admissionDate ? s.admissionDate.split('T')[0] : '',
                status: s.status
            });
        } catch (error) {
            console.error(error);
            alert('Failed to load student');
        }
    };

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/admin/students/${resolvedParams?.id}`, formData);
            } else {
                await api.post('/admin/students', formData);
            }
            router.push('/admin/students');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="sticky top-0 z-20 bg-gray-100/95 backdrop-blur-sm py-4 mb-2 flex items-center justify-between -mx-4 px-4 sm:-mx-0 sm:px-0">
                <div className="flex items-center gap-4">
                    <Link href="/admin/students" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-white/50">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Student' : 'New Admission'}
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Academic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Academic Placement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Registration No" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />
                            <InputGroup label="Admission Date" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} />

                            <SelectGroup
                                label="Class"
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                options={masterData.classes.map((c: any) => ({ label: c.name, value: c._id }))}
                                required
                            />

                            <SelectGroup
                                label="Section"
                                name="sectionId"
                                value={formData.sectionId}
                                onChange={handleChange}
                                options={masterData.sections.map((s: any) => ({ label: s.name, value: s._id }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Student Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            <InputGroup label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
                            <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />

                            <SelectGroup
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                options={[
                                    { label: 'Male', value: 'Male' },
                                    { label: 'Female', value: 'Female' },
                                    { label: 'Other', value: 'Other' }
                                ]}
                                required
                            />

                            <InputGroup label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Financial Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Fee Structure</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Monthly Fee (PKR)" name="monthlyFee" type="number" value={formData.monthlyFee} onChange={handleChange} required />
                            <InputGroup label="Discount (PKR)" name="discountAmount" type="number" value={formData.discountAmount} onChange={handleChange} />
                        </div>
                    </div>

                    {isEdit && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Status</h3>
                            <SelectGroup
                                label="Student Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={[
                                    { label: 'Active', value: 'Active' },
                                    { label: 'Inactive', value: 'Inactive' },
                                    { label: 'Passed Out', value: 'PassedOut' },
                                    { label: 'Expelled', value: 'Expelled' }
                                ]}
                                required
                            />
                        </div>
                    )}

                    <div className="pt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all flex items-center disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                            {isEdit ? 'Update Student' : 'Save Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
