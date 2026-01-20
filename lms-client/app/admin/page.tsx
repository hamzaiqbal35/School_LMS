"use client"
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminDashboard() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Quick Stats Cards (Static for now) */}
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Active Teachers</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Pending Fees</h3>
                    <p className="text-2xl font-bold text-orange-600 mt-2">--</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Today's Attendance</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">--%</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        Data visualization coming soon
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                            + Register New Student
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                            + Assign Teacher to Class
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium">
                            + Verify Fee Challans
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
