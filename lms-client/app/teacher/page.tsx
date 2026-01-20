"use client"
import { useAuthStore } from "@/store/useAuthStore";

export default function TeacherDashboard() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                <p className="text-gray-500">Here is your schedule for today.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
                <p>No classes scheduled for today.</p>
                <p className="text-sm mt-2">(Assignments Integration pending)</p>
            </div>
        </div>
    );
}
