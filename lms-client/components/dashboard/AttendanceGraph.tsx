"use client"
import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '@/lib/api';
import { Loader2, Filter } from 'lucide-react';

interface AttendanceDay {
    _id: string; // Date YYYY-MM-DD
    present: number;
    absent: number;
    leave: number;
    late: number;
}

export default function AttendanceGraph() {
    const [data, setData] = useState<AttendanceDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState<'student' | 'teacher'>('student');
    const [range, setRange] = useState<'week' | 'month' | 'year'>('week');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/dashboard/attendance-chart?type=${type}&range=${range}`);
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch attendance chart", error);
        } finally {
            setLoading(false);
        }
    }, [type, range]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    interface TooltipPayload {
        name: string;
        value: number;
        color: string;
    }

    interface TooltipProps {
        active?: boolean;
        payload?: TooltipPayload[];
        label?: string;
    }

    const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
        if (active && payload && payload.length && label) {
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-xs">
                    <p className="font-bold text-slate-900 mb-2">{new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    {payload.map((p) => (
                        <div key={p.name} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                            <span className="text-slate-500 capitalize">{p.name}:</span>
                            <span className="font-bold text-slate-900 ml-auto">{p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Attendance Trends</h3>
                    <p className="text-xs text-slate-500">Monitor {type} presence over time</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <div className="flex">
                        <button
                            onClick={() => setType('student')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${type === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setType('teacher')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${type === 'teacher' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Teachers
                        </button>
                    </div>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <select
                        id="attendanceRange"
                        name="attendanceRange"
                        aria-label="Attendance Range"
                        value={range}
                        onChange={(e) => setRange(e.target.value as 'week' | 'month' | 'year')}
                        className="bg-transparent text-xs font-bold text-slate-700 hover:text-slate-900 outline-none cursor-pointer pr-2"
                    >
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                        <option value="year">Past Year</option>
                    </select>
                </div>
            </div>

            <div className="h-72 w-full">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-cyan-600" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Filter className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">No attendance data found for this period</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" debounce={1}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="_id"
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                            <Area
                                type="monotone"
                                dataKey="present"
                                name="Present"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPresent)"
                            />
                            <Area
                                type="monotone"
                                dataKey="absent"
                                name="Absent"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorAbsent)"
                            />
                            <Area
                                type="monotone"
                                dataKey="leave"
                                name="Leave"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fill="none"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
