"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import api from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';


interface Student { _id: string; name: string; rollNumber: string; class: string; section: string; }

export default function AttendancePage() {
    // const { user } = useAuthStore(); // Unused
    const [students, setStudents] = useState<Student[]>([]);
    const [className, setClassName] = useState('10');
    const [section, setSection] = useState('A');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
    const [msg, setMsg] = useState('');

    useEffect(() => {
        // Fetch students based on Class/Section
        // Ideally from local cache for offline support
        const loadStudents = async () => {
            const cached = await db.students
                .where({ class: className })
                // .and(s => s.section === section) // Dexie specific filtering if multi-index supported or use filter
                .toArray();

            // Dexie simple query, filtering in memory for section
            const filtered = cached.filter(s => s.section === section);

            // If nothing in cache, try API if online
            if (filtered.length === 0 && navigator.onLine) {
                // Mock API call or fetch
                // const res = await api.get(...)
                // setStudents(res)
            } else {
                setStudents(filtered as unknown as Student[]);

                // Initialize default status
                const initial: Record<string, string> = {};
                filtered.forEach(s => initial[s._id] = 'present');
                setAttendanceData(initial);
            }
        };
        loadStudents();
    }, [className, section]);

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        const formattedRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
            studentId,
            status,
        }));

        const payload = {
            uuid: uuidv4(),
            date: new Date(date),
            class: className,
            section: section,
            records: formattedRecords,
        };

        try {
            if (navigator.onLine) {
                await api.post('/attendance', payload);
                setMsg('Attendance marked ONLINE');
            } else {
                throw new Error('Offline');
            }
        } catch {
            await db.attendance.add({
                ...payload,
                offlineCreatedAt: new Date(),
                syncStatus: 'pending'
            });
            setMsg('Attendance saved OFFLINE');
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Mark Attendance</h1>
            {msg && <p className="mb-4 bg-blue-100 p-2 text-blue-800 rounded">{msg}</p>}

            <div className="flex gap-4 mb-6">
                <div>
                    <label className="block text-sm text-gray-600">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600">Class</label>
                    <input type="text" value={className} onChange={e => setClassName(e.target.value)} className="border p-2 rounded w-20" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600">Section</label>
                    <input type="text" value={section} onChange={e => setSection(e.target.value)} className="border p-2 rounded w-20" />
                </div>
            </div>

            <table className="min-w-full border">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="p-3 text-left">Roll No</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? students.map(s => (
                        <tr key={s._id} className="border-b">
                            <td className="p-3">{s.rollNumber}</td>
                            <td className="p-3">{s.name}</td>
                            <td className="p-3">
                                <select
                                    value={attendanceData[s._id] || 'present'}
                                    onChange={(e) => handleStatusChange(s._id, e.target.value)}
                                    className="border p-1 rounded"
                                >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                </select>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={3} className="p-4 text-center">No students found locally. Sync Data first.</td></tr>
                    )}
                </tbody>
            </table>

            <div className="mt-6 text-right">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700"
                >
                    Save Attendance
                </button>
            </div>
        </div>
    );
}
