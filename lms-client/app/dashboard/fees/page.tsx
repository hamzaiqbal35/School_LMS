"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, OfflinePayment } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { syncUp, syncDown } from '@/lib/sync';
import { useAuthStore } from '@/store/useAuthStore';
export default function FeesPage() {
    const { user } = useAuthStore();
    // const [onlinePayments, setOnlinePayments] = useState<any[]>([]); // Unused
    const [syncing, setSyncing] = useState(false);

    // Real-time query for offline pending payments
    const offlinePayments = useLiveQuery(() => db.payments.where('syncStatus').equals('pending').toArray());

    useEffect(() => {
        // Placeholder for future online payments fetch
    }, []);

    const handleSync = async () => {
        if (!user?.token) return;
        setSyncing(true);
        await syncUp(user.token);
        await syncDown(user.token);
        setSyncing(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Fees & Payments</h1>
                <div className="space-x-4">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {syncing ? 'Syncing...' : 'Sync Data'}
                    </button>
                    <Link href="/dashboard/fees/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Record Payment
                    </Link>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Pending Offline Payments ({offlinePayments?.length || 0})</h2>
                {offlinePayments && offlinePayments.length > 0 ? (
                    <div className="bg-white rounded shadow overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-left">Amount</th>
                                    <th className="p-3 text-left">Method</th>
                                    <th className="p-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offlinePayments.map((p: OfflinePayment) => (
                                    <tr key={p.id} className="border-t">
                                        <td className="p-3">{new Date(p.offlineCreatedAt).toLocaleDateString()}</td>
                                        <td className="p-3">{p.amountPaid}</td>
                                        <td className="p-3">{p.paymentMethod}</td>
                                        <td className="p-3 text-yellow-600">Pending Sync</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No pending offline payments.</p>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Recent Payments (Online)</h2>
                <p className="text-gray-500">Feature to view online history coming soon...</p>
            </div>
        </div>
    );
}
