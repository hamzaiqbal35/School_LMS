"use client"
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Loader2, Plus } from 'lucide-react';

interface Student {
    _id: string;
    fullName: string;
    registrationNumber: string;
    status: string;
}

interface Challan {
    _id: string;
    challanNumber: string;
    studentId: Student;
    month: string;
    totalAmount: number;
    status: string;
}

export default function FeesPage() {
    const [challans, setChallans] = useState<Challan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    // Generation Modal State
    const [showGen, setShowGen] = useState(false);
    const [genData, setGenData] = useState({ month: '', dueDate: '', studentIds: [] as string[] });
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [generating, setGenerating] = useState(false);

    // Verify Modal State
    const [verifyId, setVerifyId] = useState('');
    const [verifyData, setVerifyData] = useState({ paymentReference: '', paymentDate: new Date().toISOString().split('T')[0], note: '' });

    const fetchChallans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/fees${filterStatus ? `?status=${filterStatus}` : ''}`);
            setChallans(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    const fetchStudents = useCallback(async () => {
        try {
            const res = await api.get('/admin/students?status=Active');
            setAllStudents(res.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchChallans();
        fetchStudents();
    }, [fetchChallans, fetchStudents]); // Correct dependencies

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            // Select all active students by default for now if none selected (Bulk)
            const ids = genData.studentIds.length > 0 ? genData.studentIds : allStudents.map(s => s._id);

            await api.post('/fees/generate', {
                month: genData.month,
                dueDate: genData.dueDate,
                studentIds: ids
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
        try {
            await api.post(`/fees/verify/${verifyId}`, verifyData);
            setVerifyId('');
            fetchChallans();
        } catch {
            alert('Verification failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Fee Management</h1>
                <button
                    onClick={() => setShowGen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Challans
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
                {['', 'Pending', 'Paid', 'Overdue'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-1 rounded-full text-sm font-medium ${filterStatus === status
                            ? 'bg-gray-800 text-white'
                            : 'bg-white border text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {status || 'All'}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challan #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {challans.map(c => (
                                    <tr key={c._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{c.challanNumber}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {c.studentId?.fullName} <br />
                                            <span className="text-xs text-gray-500">{c.studentId?.registrationNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{c.month}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">Rs. {c.totalAmount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${c.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                    c.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}
                                            `}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {c.status === 'Pending' && (
                                                <button
                                                    onClick={() => setVerifyId(c._id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {challans.length === 0 && <tr><td colSpan={6} className="text-center p-8 text-gray-500">No records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Generation Modal */}
            {showGen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Generate Monthly Challans</h3>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label htmlFor="genMonth" className="block text-sm font-medium text-gray-700">Month (e.g. Jan-2025)</label>
                                <input
                                    id="genMonth"
                                    name="genMonth"
                                    type="text" required
                                    className="w-full border rounded p-2"
                                    value={genData.month}
                                    onChange={e => setGenData({ ...genData, month: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="genDueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                                <input
                                    id="genDueDate"
                                    name="genDueDate"
                                    type="date" required
                                    className="w-full border rounded p-2"
                                    value={genData.dueDate}
                                    onChange={e => setGenData({ ...genData, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="text-xs text-gray-500">
                                Will generate for all {allStudents.length} active students.
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowGen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" disabled={generating} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
                                    {generating ? 'Processing...' : 'Generate All'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {verifyId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Manual Payment Verification</h3>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                                Confirm that you have received payment in the bank account. This action cannot be undone by teachers.
                            </div>
                            <div>
                                <label htmlFor="payRef" className="block text-sm font-medium text-gray-700">Transaction Ref / Cheque No</label>
                                <input
                                    id="payRef"
                                    name="payRef"
                                    type="text" required
                                    className="w-full border rounded p-2"
                                    value={verifyData.paymentReference}
                                    onChange={e => setVerifyData({ ...verifyData, paymentReference: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="payDate" className="block text-sm font-medium text-gray-700">Payment Date</label>
                                <input
                                    id="payDate"
                                    name="payDate"
                                    type="date" required
                                    className="w-full border rounded p-2"
                                    value={verifyData.paymentDate}
                                    onChange={e => setVerifyData({ ...verifyData, paymentDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="payNote" className="block text-sm font-medium text-gray-700">Note (Optional)</label>
                                <textarea
                                    id="payNote"
                                    name="payNote"
                                    className="w-full border rounded p-2"
                                    value={verifyData.note}
                                    onChange={e => setVerifyData({ ...verifyData, note: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setVerifyId('')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
