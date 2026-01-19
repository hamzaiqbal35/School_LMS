import axios from 'axios';
import { db } from './db';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const syncUp = async (token: string) => {
    try {
        const pendingPayments = await db.payments.where('syncStatus').equals('pending').toArray();
        const pendingAttendance = await db.attendance.where('syncStatus').equals('pending').toArray();

        if (pendingPayments.length === 0 && pendingAttendance.length === 0) {
            return { status: 'idle', message: 'Nothing to sync' };
        }

        const payload = {
            payments: pendingPayments,
            attendance: pendingAttendance,
        };

        const response = await axios.post(`${API_URL}/sync/up`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const { results } = response.data;

        // Update status for successful payments
        if (results?.payments?.success) {
            for (const uuid of results.payments.success) {
                await db.payments.where('uuid').equals(uuid).modify({ syncStatus: 'synced' });
            }
        }

        // Update status for successful attendance
        if (results?.attendance?.success) {
            for (const uuid of results.attendance.success) {
                // Note: Attendance uses UUID if we added it, or we rely on date+class+section unique logic.
                // In my DB schema I added UUID to offline attendance interface.
                await db.attendance.where('uuid').equals(uuid).modify({ syncStatus: 'synced' });
            }
        }

        // Clean up synced items? Or keep them for history?
        // Let's keep them but maybe delete very old ones later.

        return { status: 'success', results };

    } catch (error) {
        console.error('Sync failed:', error);
        return { status: 'error', error };
    }
};

export const syncDown = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/sync/down`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const { students, fees } = response.data;

        await db.transaction('rw', db.students, db.fees, async () => {
            // Bulk put (update or insert)
            if (students && students.length > 0) {
                await db.students.bulkPut(students);
            }
            if (fees && fees.length > 0) {
                await db.fees.bulkPut(fees);
            }
        });

        return { status: 'success', message: 'Data downloaded' };
    } catch (error) {
        console.error('Sync Down failed:', error);
        return { status: 'error', error };
    }
};

