import Dexie, { Table } from 'dexie';

export interface OfflinePayment {
    id?: number;
    uuid: string;
    studentId: string;
    feeId: string;
    amountPaid: number;
    paymentMethod: string;
    remarks?: string;
    offlineCreatedAt: Date;
    syncStatus: 'pending' | 'synced' | 'failed';
}

export interface OfflineAttendance {
    id?: number;
    uuid: string; // generated uuid for checking duplicates
    date: Date;
    class: string;
    section: string;
    records: { studentId: string; status: string; remarks?: string }[];
    offlineCreatedAt: Date;
    syncStatus: 'pending' | 'synced' | 'failed';
}

export interface CachedStudent {
    _id: string; // Primary key, assuming it's a unique ID from a backend
    name: string;
    rollNumber: string;
    class: string;
    section: string;
    // Add other relevant student properties as needed
}

export interface CachedFee {
    _id: string; // Primary key
    name: string;
    amount: number;
    // Add other relevant fee properties as needed
}

export class SchoolDatabase extends Dexie {
    payments!: Table<OfflinePayment>;
    attendance!: Table<OfflineAttendance>;
    students!: Table<CachedStudent>;
    fees!: Table<CachedFee>;

    constructor() {
        super('SchoolLMSDB');
        this.version(1).stores({
            payments: '++id, uuid, syncStatus, offlineCreatedAt',
            attendance: '++id, uuid, syncStatus, offlineCreatedAt, date',
            students: '_id, name, rollNumber, class', // Indexes
            fees: '_id, name',
        });
    }
}

export const db = new SchoolDatabase();
