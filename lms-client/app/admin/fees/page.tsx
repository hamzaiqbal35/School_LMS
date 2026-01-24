"use client"
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Loader2, Plus, Download, Search, Filter, CheckCircle, AlertCircle, Clock, FileText, ChevronDown, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
    _id: string;
    fullName: string;
    registrationNumber: string;
    status: string;
}
interface Class {
    _id: string;
    name: string;
}

interface Challan {
    _id: string;
    challanNumber: string;
    studentId: Student;
    month: string;
    totalAmount: number;
    status: string;
    pdfUrl?: string;
    dueDate?: string;
}

export default function FeesPage() {
    const [challans, setChallans] = useState<Challan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    // Generation Modal State
    const [showGen, setShowGen] = useState(false);
    const [genData, setGenData] = useState({
        month: '',
        dueDate: '',
        studentIds: [] as string[],
        includeExamFee: false,
        includeMisc: false
    });
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [generating, setGenerating] = useState(false);

    const [classes, setClasses] = useState<Class[]>([]);
    const [filters, setFilters] = useState({ search: '', classId: '', month: '' });

    // Verify Modal State
    const [verifyId, setVerifyId] = useState('');
    const [verifyData, setVerifyData] = useState({ paymentReference: '', paymentDate: new Date().toISOString().split('T')[0], note: '' });
    const [verifying, setVerifying] = useState(false);

    const fetchChallans = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filters.search) params.append('search', filters.search);
            if (filters.classId) params.append('classId', filters.classId);
            if (filters.month) params.append('month', filters.month);

            const res = await api.get(`/fees?${params.toString()}`);
            setChallans(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filters]);

    const fetchDropdowns = useCallback(async () => {
        try {
            const [studentsRes, classesRes] = await Promise.all([
                api.get('/admin/students?status=Active'),
                api.get('/admin/classes')
            ]);
            setAllStudents(studentsRes.data);
            setClasses(classesRes.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchChallans();
        fetchDropdowns();
    }, [fetchChallans, fetchDropdowns]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const ids = genData.studentIds.length > 0 ? genData.studentIds : allStudents.map(s => s._id);

            await api.post('/fees/generate', {
                month: genData.month,
                dueDate: genData.dueDate,
                studentIds: ids,
                includeExamFee: genData.includeExamFee,
                includeMisc: genData.includeMisc
            });
            setShowGen(false);
            fetchChallans();
            alert('Challans Generated Successfully');
        } catch {
            alert('Failed to generate');
        } finally {
            setGenerating(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        try {
            await api.post(`/fees/verify/${verifyId}`, { ...verifyData, status: 'Paid' });
            setVerifyId('');
            fetchChallans();
        } catch {
            alert('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fee Management</h1>
                    <p className="text-slate-500 mt-1">Generate, track and verify student fee challans</p>
                </div>
                <button
                    onClick={() => setShowGen(true)}
                    className="group bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Generate Challans
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="grid md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                        <label htmlFor="searchStudent" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Search Student</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <input
                                id="searchChallans"
                                name="searchChallans"
                                type="text"
                                placeholder="Search by student name, class, or month..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <label htmlFor="filterClass" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Class</label>
                        <div className="relative">
                            <select
                                id="filterClass"
                                name="filterClass"
                                className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none appearance-none bg-white transition-all"
                                value={filters.classId}
                                onChange={e => setFilters({ ...filters, classId: e.target.value })}
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <label htmlFor="filterMonth" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Month</label>
                        <input
                            id="filterMonth"
                            name="filterMonth"
                            type="text"
                            placeholder="YYYY-MM"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                            value={filters.month}
                            onChange={e => setFilters({ ...filters, month: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            onClick={() => { setFilters({ search: '', classId: '', month: '' }); setFilterStatus(''); fetchChallans(); }}
                            className="w-full py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Reset
                        </button>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {['', 'Pending', 'Paid', 'Overdue'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${filterStatus === status
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200 shadow-sm'
                                : 'bg-white text-slate-500 border-transparent hover:bg-slate-50 hover:border-slate-200'
                                }`}
                        >
                            {status || 'All Status'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-cyan-600 w-10 h-10 mb-4" />
                        <p className="text-slate-500 font-medium">Loading transactions...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="divide-y divide-slate-100 bg-white"
                            >
                                <AnimatePresence>
                                    {challans.map(c => (
                                        <motion.tr
                                            key={c._id}
                                            variants={item}
                                            className="group hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-mono text-sm font-bold text-slate-900">{c.challanNumber}</div>
                                                        <div className="text-xs text-slate-500 font-medium">{c.month}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{c.studentId?.fullName}</div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 mt-1">
                                                    {c.studentId?.registrationNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                                {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-slate-900">PKR {c.totalAmount.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${c.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    c.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {c.status === 'Paid' && <CheckCircle className="w-3 h-3 mr-1.5" />}
                                                    {c.status === 'Pending' && <Clock className="w-3 h-3 mr-1.5" />}
                                                    {c.status === 'Overdue' && <AlertCircle className="w-3 h-3 mr-1.5" />}
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {(c.pdfUrl || c.status !== 'Pending') && (
                                                        <a
                                                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/fees/download/${c._id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {c.status === 'Pending' && (
                                                        <button
                                                            onClick={() => setVerifyId(c._id)}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Verify
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {challans.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                    <Filter className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="font-medium">No fee records found matches your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </motion.tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Generation Modal */}
            <AnimatePresence>
                {showGen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900">Generate Challans</h3>
                                <button onClick={() => setShowGen(false)} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleGenerate} className="space-y-5">
                                    <div>
                                        <label htmlFor="genStudent" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Target Student(s)</label>
                                        <div className="relative">
                                            <select
                                                id="genStudent"
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none appearance-none bg-white"
                                                value={genData.studentIds[0] || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setGenData({
                                                        ...genData,
                                                        studentIds: val ? [val] : []
                                                    });
                                                }}
                                            >
                                                <option value="">All Active Students</option>
                                                {allStudents.map(s => (
                                                    <option key={s._id} value={s._id}>
                                                        {s.fullName} ({s.registrationNumber})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="genMonth" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Month</label>
                                            <input
                                                id="genMonth"
                                                name="genMonth"
                                                type="month" required
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                                                value={genData.month}
                                                onChange={e => setGenData({ ...genData, month: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="genDueDate" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Due Date</label>
                                            <input
                                                id="genDueDate"
                                                name="genDueDate"
                                                type="date" required
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                                                value={genData.dueDate}
                                                onChange={e => setGenData({ ...genData, dueDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={genData.includeExamFee}
                                                    onChange={e => setGenData({ ...genData, includeExamFee: e.target.checked })}
                                                />
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-cyan-600 peer-checked:border-cyan-600 transition-all"></div>
                                                <CheckCircle className="w-3.5 h-3.5 text-white absolute left-0.5 top-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Include Exam Fee</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={genData.includeMisc}
                                                    onChange={e => setGenData({ ...genData, includeMisc: e.target.checked })}
                                                />
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-cyan-600 peer-checked:border-cyan-600 transition-all"></div>
                                                <CheckCircle className="w-3.5 h-3.5 text-white absolute left-0.5 top-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Include Misc Charges</span>
                                        </label>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl text-sm leading-relaxed">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p>
                                            {genData.studentIds.length > 0
                                                ? `1 challan will be generated for the selected student.`
                                                : `${allStudents.length} challans will be generated for all active students.`}
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => setShowGen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                                        <button
                                            type="submit"
                                            disabled={generating}
                                            className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-bold shadow-lg shadow-cyan-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {generating ? <Loader2 className="animate-spin w-4 h-4" /> : 'Generate Now'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Verification Modal */}
            <AnimatePresence>
                {verifyId && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">Verify Payment</h3>
                                <p className="text-sm text-slate-500 mt-1">Manual verification for cash/cheque payments</p>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleVerify} className="space-y-4">
                                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm font-medium border border-yellow-100 flex gap-3">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p>This action marks the challan as PAID and updates records. Ensure you have received the funds.</p>
                                    </div>

                                    <div>
                                        <label htmlFor="payRef" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Reference No / Cheque No</label>
                                        <input
                                            id="payRef"
                                            name="payRef"
                                            type="text" required
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={verifyData.paymentReference}
                                            onChange={e => setVerifyData({ ...verifyData, paymentReference: e.target.value })}
                                            placeholder="e.g. TRX-8839201"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="payDate" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Payment Date</label>
                                        <input
                                            id="payDate"
                                            name="payDate"
                                            type="date" required
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={verifyData.paymentDate}
                                            onChange={e => setVerifyData({ ...verifyData, paymentDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="payNote" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Note (Optional)</label>
                                        <textarea
                                            id="payNote"
                                            name="payNote"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[80px]"
                                            value={verifyData.note}
                                            onChange={e => setVerifyData({ ...verifyData, note: e.target.value })}
                                            placeholder="Any additional details..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button type="button" onClick={() => setVerifyId('')} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                                        <button
                                            type="submit"
                                            disabled={verifying}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                        >
                                            {verifying ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm Payment'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
