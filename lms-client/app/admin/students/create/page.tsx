"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

// Reusable Input Component (internal)
interface InputGroupProps {
    label: string;
    name: string;
    id?: string;
    type?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

const InputGroup = ({ label, name, id, type = "text", value, onChange, required = false }: InputGroupProps) => {
    const inputId = id || name;
    return (
        <div>
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                id={inputId}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
        </div>
    );
};

// CNIC Format Helper (xxxxx-xxxxxxx-x)
const formatCnic = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

// CNIC Input Component
interface CnicInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
}

const CnicInput = ({ label, name, value, onChange }: CnicInputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCnic(e.target.value);
        onChange(name, formatted);
    };
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                id={name}
                type="text"
                name={name}
                value={value}
                onChange={handleChange}
                placeholder="xxxxx-xxxxxxx-x"
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
        </div>
    );
};

interface SelectGroupProps {
    label: string;
    name: string;
    id?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[];
    required?: boolean;
}

const SelectGroup = ({ label, name, id, value, onChange, options, required = false }: SelectGroupProps) => {
    const selectId = id || name;
    return (
        <div>
            <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                id={selectId}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
                <option value="">Select...</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

interface ReferenceData {
    _id: string;
    name: string;
}

export default function StudentForm({ params }: { params: Promise<{ id?: string }> }) {
    const router = useRouter();

    interface AxiosErrorLike {
        response?: {
            data?: {
                message?: string;
            };
        };
    }

    const resolvedParams = use(params);
    const isEdit = !!resolvedParams?.id;

    const [loading, setLoading] = useState(false);
    const [masterData, setMasterData] = useState<{ classes: ReferenceData[]; sections: ReferenceData[] }>({ classes: [], sections: [] });

    const [formData, setFormData] = useState({
        registrationNumber: '',
        fullName: '',
        fatherName: '',
        dob: '',
        gender: '',
        phoneNumber: '',
        bFormNumber: '',
        fatherCnic: '',
        cast: '',
        religion: '',
        classId: '',
        sectionId: '',
        discountAmount: '0',
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        isAdmissionPaid: false,
    });

    // New State for Helper
    const [classFee, setClassFee] = useState(0);

    // Fetch Fee when class changes
    useEffect(() => {
        if (formData.classId) {
            const fetchFee = async () => {
                try {
                    const res = await api.get(`/fees/structures/${formData.classId}`);
                    setClassFee(res.data.monthlyTuition || 0);
                } catch {
                    setClassFee(0);
                }
            };
            fetchFee();
        }
    }, [formData.classId]);

    const fetchMasterData = async () => {
        try {
            const res = await api.get('/admin/master-data');
            setMasterData(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudent = useCallback(async () => {
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
                bFormNumber: s.bFormNumber || '',
                fatherCnic: s.fatherCnic || '',
                cast: s.cast || '',
                religion: s.religion || '',
                classId: s.classId?._id || s.classId,
                sectionId: s.sectionId?._id || s.sectionId,
                discountAmount: s.discountAmount || '0',
                admissionDate: s.admissionDate ? s.admissionDate.split('T')[0] : '',
                status: s.status,
                isAdmissionPaid: !!s.isAdmissionPaid
            });
        } catch (error) {
            console.error(error);
            alert('Failed to load student');
        }
    }, [resolvedParams?.id]);

    useEffect(() => {
        fetchMasterData();
        if (isEdit) {
            fetchStudent();
        }
    }, [isEdit, fetchStudent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [name]: val });
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
        } catch (error) {
            const err = error as AxiosErrorLike;
            alert(err.response?.data?.message || 'Operation failed');
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
                                options={masterData.classes.map((c: ReferenceData) => ({ label: c.name, value: c._id }))}
                                required
                            />

                            <SelectGroup
                                label="Section"
                                name="sectionId"
                                value={formData.sectionId}
                                onChange={handleChange}
                                options={masterData.sections.map((s: ReferenceData) => ({ label: s.name, value: s._id }))}
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
                            <CnicInput label="B-Form Number" name="bFormNumber" value={formData.bFormNumber} onChange={(name, val) => setFormData({ ...formData, [name]: val })} />
                            <CnicInput label="Father CNIC" name="fatherCnic" value={formData.fatherCnic} onChange={(name, val) => setFormData({ ...formData, [name]: val })} />
                            <InputGroup label="Cast" name="cast" value={formData.cast} onChange={handleChange} />
                            <InputGroup label="Religion" name="religion" value={formData.religion} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Financial Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Fee Structure</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="block text-sm font-medium text-gray-700 mb-1">Monthly Tuition (Class Based)</p>
                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium">
                                    PKR {classFee.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Managed via Class Settings</p>
                            </div>
                            <InputGroup label="Discount (PKR)" name="discountAmount" type="number" value={formData.discountAmount} onChange={handleChange} />

                            <div className="flex items-center pt-6">
                                <input
                                    type="checkbox"
                                    id="isAdmissionPaid"
                                    name="isAdmissionPaid"
                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    checked={formData.isAdmissionPaid}
                                    onChange={handleChange}
                                />
                                <label htmlFor="isAdmissionPaid" className="ml-2 block text-sm font-medium text-gray-700">
                                    Admission Fee Paid?
                                </label>
                            </div>
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
