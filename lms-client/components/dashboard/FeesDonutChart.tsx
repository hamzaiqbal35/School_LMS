"use client"
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

interface FeeStats {
    count: number;
    amount: number;
}

interface FeeData {
    Paid: FeeStats;
    Pending: FeeStats;
    Overdue: FeeStats;
}

export default function FeesDonutChart() {
    const [data, setData] = useState<FeeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const res = await api.get('/admin/dashboard/fees-chart');
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch fee chart", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchFees();
    }, []);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-600" /></div>;
    if (error || !data) return <div className="h-64 flex items-center justify-center text-red-500"><AlertCircle className="mr-2" /> Failed to load data</div>;

    const chartData = [
        { name: 'Paid', value: data.Paid.amount, count: data.Paid.count, color: '#10b981' }, // Emerald-500
        { name: 'Pending', value: data.Pending.amount, count: data.Pending.count, color: '#f59e0b' }, // Amber-500
        { name: 'Overdue', value: data.Overdue.amount, count: data.Overdue.count, color: '#ef4444' }, // Red-500
    ];

    const totalAmount = chartData.reduce((acc, curr) => acc + curr.value, 0);

    interface TooltipProps {
        active?: boolean;
        payload?: { payload: { name: string; value: number; count: number }; }[];
    }

    const CustomTooltip = ({ active, payload }: TooltipProps) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-xs z-50 relative">
                    <p className="font-bold text-slate-900 mb-1">{d.name}</p>
                    <p className="text-slate-500">Amount: <span className="font-mono font-bold text-slate-700">PKR {d.value.toLocaleString()}</span></p>
                    <p className="text-slate-500">Challans: <span className="font-bold text-slate-700">{d.count}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Fees Collection</h3>
            <div className="h-64 relative w-full">
                <ResponsiveContainer width="99%" height="100%" debounce={1}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text - lower z-index so tooltip appears on top */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8" style={{ zIndex: 1 }}>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                    <span className="text-lg font-black text-slate-900 mt-1">
                        {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(totalAmount)}
                    </span>
                </div>
            </div>
        </div>
    );
}
