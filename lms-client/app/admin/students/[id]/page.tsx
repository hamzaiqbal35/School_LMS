"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, ArrowLeft, Phone, BookOpen, Calendar, Clock, User as UserIcon, DollarSign, Edit } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface Student {
    _id: string;
    fullName: string;
    registrationNumber: string;
    status: string;
    admissionDate?: string;
    fatherName: string;
    gender: string;
    classId?: { name: string };
    sectionId?: { name: string };
    dob?: string;
    phoneNumber?: string;
    bFormNumber?: string;
    fatherCnic?: string;
    cast?: string;
    religion?: string;
    monthlyFee: number;
    discountAmount?: number;
    isAdmissionPaid?: boolean;
}

interface Fee {
    _id: string;
    month: string;
    totalAmount: number;
    status: string;
    paymentDate?: string;
}

interface Attendance {
    _id: string;
    date: string;
    status: string;
    markedBy: { fullName: string; role: string };
}
export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [fees, setFees] = useState<Fee[]>([]);
    const [classFee, setClassFee] = useState(0);
    const [loading, setLoading] = useState(true);
    const [feeFilter, setFeeFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');

    // Attendance State
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [attMonth, setAttMonth] = useState(new Date().getMonth() + 1);
    const [attYear, setAttYear] = useState(new Date().getFullYear());
    const [attLoading, setAttLoading] = useState(false);

    // Extract unique years from fees
    const availableYears = [...new Set(fees.map(f => f.month?.split('-')[0]).filter(Boolean))].sort().reverse();

    const fetchData = useCallback(async () => {
        try {
            // First fetch student and fees
            const [studentRes, feesRes] = await Promise.all([
                api.get(`/admin/students/${resolvedParams.id}`),
                api.get(`/fees?studentId=${resolvedParams.id}`)
            ]);
            const s = studentRes.data;
            setStudent(s);
            setFees(feesRes.data);

            // Then fetch class fee structure if classId exists
            if (s.classId?._id) {
                try {
                    const feeRes = await api.get(`/fees/structures/${s.classId._id}`);
                    setClassFee(feeRes.data.monthlyTuition || 0);
                } catch {
                    // console.log("No fee structure found");
                    setClassFee(0);
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [resolvedParams.id]);

    useEffect(() => {
        if (resolvedParams.id) {
            fetchData();
        }
    }, [resolvedParams.id, fetchData]);

    // Fetch Attendance
    useEffect(() => {
        if (!resolvedParams.id) return;
        setAttLoading(true);
        api.get(`/attendance?studentId=${resolvedParams.id}&month=${attMonth}&year=${attYear}`)
            .then(res => setAttendance(res.data))
            .catch(err => console.error(err))
            .finally(() => setAttLoading(false));
    }, [resolvedParams.id, attMonth, attYear]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
    if (!student) return <div className="p-10 text-center">Student not found</div>;

    const LabelValue = ({ label, value, icon: Icon }: { label: string, value: string | undefined, icon?: React.ElementType }) => (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5" />}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-gray-900 font-medium">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gray-100/95 backdrop-blur-sm py-4 mb-2 flex justify-between items-start -mx-4 px-4 sm:-mx-0 sm:px-0">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 flex items-center mb-4 transition-colors bg-white/50 p-2 rounded-lg shadow-sm hover:bg-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
                </button>
                <Link href={`/admin/students/${student._id}/edit`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center shadow-sm font-medium">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </Link>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <UserIcon className="w-64 h-64" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 text-green-700 text-5xl font-bold">
                        {student.fullName?.charAt(0)}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-bold">{student.fullName}</h1>
                        <p className="text-green-100 text-lg">Reg No: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">{student.registrationNumber}</span></p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${student.status === 'Active' ? 'bg-white text-green-700' : 'bg-red-500 text-white'
                                }`}>
                                {student.status}
                            </span>
                            <span className="flex items-center text-green-50 text-sm bg-black/10 px-3 py-1 rounded-full">
                                <Calendar className="w-3 h-3 mr-2" /> Admitted: {student.admissionDate?.split('T')[0]}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic & Personal */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center pb-3 border-b">
                        <UserIcon className="w-5 h-5 mr-2 text-green-600" /> Personal & Academic
                    </h3>
                    <div className="space-y-2">
                        <div className="grid grid-cols-2">
                            <LabelValue label="Father Name" value={student.fatherName} icon={UserIcon} />
                            <LabelValue label="Gender" value={student.gender} />
                        </div>
                        <LabelValue label="Class & Section" value={`${student.classId?.name} - ${student.sectionId?.name}`} icon={BookOpen} />
                        <LabelValue label="Date of Birth" value={student.dob?.split('T')[0]} icon={Calendar} />
                        <LabelValue label="Phone Number" value={student.phoneNumber} icon={Phone} />
                        <div className="grid grid-cols-2">
                            <LabelValue label="B-Form Number" value={student.bFormNumber} />
                            <LabelValue label="Father CNIC" value={student.fatherCnic} />
                        </div>
                        <div className="grid grid-cols-2">
                            <LabelValue label="Cast" value={student.cast} />
                            <LabelValue label="Religion" value={student.religion} />
                        </div>
                    </div>
                </div>

                {/* Financial */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center pb-3 border-b">
                            <DollarSign className="w-5 h-5 mr-2 text-green-600" /> Fee Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Monthly Fee</p>
                                <p className="text-2xl font-bold text-gray-800">Rs {classFee.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Discount</p>
                                <p className="text-2xl font-bold text-green-600">Rs {(student.discountAmount || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase">Admission Fee Status</p>
                                <p className={`text-sm font-bold mt-1 ${student.isAdmissionPaid ? 'text-green-600' : 'text-red-500'}`}>
                                    {student.isAdmissionPaid ? 'PAID' : 'PENDING'}
                                </p>
                            </div>
                            <div className={`p-2 rounded-full ${student.isAdmissionPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {student.isAdmissionPaid ? <DollarSign className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900">Net Payable</h4>
                                <p className="text-sm text-blue-700">Calculated after discount</p>
                                <p className="text-3xl font-bold text-blue-800 mt-2">Rs {(Math.max(0, classFee - (student.discountAmount || 0))).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fee History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-purple-600" /> Payment History
                            </h3>
                            <div className="flex gap-2">
                                <select
                                    id="feeYearFilter"
                                    name="feeYearFilter"
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                                >
                                    <option value="All">All Years</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <select
                                    id="feeStatusFilter"
                                    name="feeStatusFilter"
                                    value={feeFilter}
                                    onChange={(e) => setFeeFilter(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                        </div>
                        {fees.filter(f => (feeFilter === 'All' || f.status === feeFilter) && (yearFilter === 'All' || f.month?.startsWith(yearFilter))).length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Month</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Amount</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {fees.filter(f => (feeFilter === 'All' || f.status === feeFilter) && (yearFilter === 'All' || f.month?.startsWith(yearFilter))).map((fee) => (
                                            <tr key={fee._id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{fee.month}</td>
                                                <td className="px-4 py-3">Rs {fee.totalAmount?.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${fee.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                        fee.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {fee.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {fee.status === 'Paid' && fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-center py-4">No payment history available</p>
                        )}
                    </div>

                    {/* Attendance History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Attendance History
                            </h3>
                            <div className="flex gap-2">
                                <select
                                    id="attendanceMonthFilter"
                                    name="attendanceMonthFilter"
                                    value={attMonth}
                                    onChange={(e) => setAttMonth(Number(e.target.value))}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                                <select
                                    id="attendanceYearFilter"
                                    name="attendanceYearFilter"
                                    value={attYear}
                                    onChange={(e) => setAttYear(Number(e.target.value))}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                >
                                    {availableYears.length > 0 ? availableYears.map(y => <option key={y} value={y}>{y}</option>) : <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
                                </select>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        {!attLoading && attendance.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                <div className="bg-green-50 p-2 rounded-lg text-center border border-green-100">
                                    <div className="text-xs font-bold text-green-600 uppercase">Present</div>
                                    <div className="text-lg font-bold text-green-800">{attendance.filter(a => a.status === 'Present').length}</div>
                                </div>
                                <div className="bg-red-50 p-2 rounded-lg text-center border border-red-100">
                                    <div className="text-xs font-bold text-red-600 uppercase">Absent</div>
                                    <div className="text-lg font-bold text-red-800">{attendance.filter(a => a.status === 'Absent').length}</div>
                                </div>
                                <div className="bg-amber-50 p-2 rounded-lg text-center border border-amber-100">
                                    <div className="text-xs font-bold text-amber-600 uppercase">Leave</div>
                                    <div className="text-lg font-bold text-amber-800">{attendance.filter(a => a.status === 'Leave').length}</div>
                                </div>
                                <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                                    <div className="text-xs font-bold text-blue-600 uppercase">Late</div>
                                    <div className="text-lg font-bold text-blue-800">{attendance.filter(a => a.status === 'Late').length}</div>
                                </div>
                            </div>
                        )}

                        {attLoading ? (
                            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" /></div>
                        ) : attendance.length > 0 ? (
                            <div className="overflow-x-auto max-h-60 overflow-y-auto custom-scrollbar">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Marked By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {attendance.map((record) => (
                                            <tr key={record._id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2 font-medium text-gray-800">
                                                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                        record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                            record.status === 'Leave' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-xs text-gray-500">
                                                    {record.markedBy?.role === 'ADMIN' ? 'Admin' : record.markedBy?.fullName || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-center py-8 bg-gray-50/50 rounded-lg">No attendance records found for this period</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
