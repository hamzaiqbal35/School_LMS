"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import api from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
// useAuthStore removed

// Assuming we might have types for Student and Fee
interface Student { _id: string; name: string; class: string; }
interface Fee { _id: string; name: string; amount: number; }

export default function CreatePaymentPage() {
    const router = useRouter();
    // const { user } = useAuthStore(); // Unused

    const [students, setStudents] = useState<Student[]>([]);
    const [fees, setFees] = useState<Fee[]>([]);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedFee, setSelectedFee] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const loadData = async () => {
            // try to load from API first
            try {
                await Promise.all([
                    api.get('/sync/down').then(r => r.data.students || []),
                    api.get('/fees').then(r => r.data)
                ]);
                // For this demo, let's mix strategies. 
                // Ideally we should have a useData hook.
                // Let's just FETCH FROM CACHE for offline-first speed, and background refresh if needed.
            } catch { }

            // Load from Dexie (Source of Truth for offline dropdowns)
            const cachedStudents = await db.students.toArray();
            const cachedFees = await db.fees.toArray();

            setStudents(cachedStudents as unknown as Student[]);
            setFees(cachedFees as unknown as Fee[]);
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const paymentData = {
            studentId: selectedStudent,
            feeId: selectedFee,
            amountPaid: Number(amount),
            paymentMethod: method,
        };

        try {
            if (navigator.onLine) {
                // Online: Send to API
                await api.post('/fees/payment', paymentData);
                setMsg('Payment recorded online!');
            } else {
                throw new Error("Offline");
            }
        } catch {
            // Offline: Save to Dexie
            await db.payments.add({
                uuid: uuidv4(),
                ...paymentData,

                offlineCreatedAt: new Date(),
                syncStatus: 'pending',
                // We need to match the key names exactly with the interface
                // studentId, feeId, amountPaid, paymentMethod
            });
            setMsg('Payment recorded OFFLINE. Will sync later.');
        }

        setLoading(false);
        setTimeout(() => {
            router.push('/dashboard/fees');
        }, 1500);
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Record New Payment</h1>
            {msg && <p className="mb-4 bg-green-100 p-2 rounded">{msg}</p>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2">Student</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={selectedStudent}
                        onChange={e => setSelectedStudent(e.target.value)}
                        required
                    >
                        <option value="">Select Student</option>
                        {students.map(s => (
                            <option key={s._id} value={s._id}>{s.name} ({s.class})</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Fee Type</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={selectedFee}
                        onChange={e => {
                            setSelectedFee(e.target.value);
                            const fee = fees.find(f => f._id === e.target.value);
                            if (fee) setAmount(fee.amount.toString());
                        }}
                        required
                    >
                        <option value="">Select Fee</option>
                        {fees.map(f => (
                            <option key={f._id} value={f._id}>{f.name} - {f.amount}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Amount</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2">Method</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={method}
                        onChange={e => setMethod(e.target.value)}
                    >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="online">Online Transfer</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Record Payment'}
                </button>
            </form>
        </div>
    );
}
