"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Custom Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">Welcome back, <span className="font-semibold text-primary">{user.name}</span></p>
                </div>

                <div className="flex items-center gap-4 flex-1 md:justify-end">
                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-md hidden md:block group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search modules, teachers..."
                            className="pl-12 h-12 bg-white/80 backdrop-blur-md border-slate-200 focus-visible:ring-primary/50 focus-visible:border-primary rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md"
                        />
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white shadow-sm hover:bg-slate-50 text-slate-600 hover:text-primary hover:scale-105 transition-all duration-200">
                            <Bell className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white shadow-sm hover:bg-slate-50 text-slate-600 hover:text-primary hover:scale-105 transition-all duration-200">
                            <MessageSquare className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Widget */}
                <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-50 to-white opacity-100 group-hover:opacity-90 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">User Profile</CardTitle>
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <span className="text-lg font-bold">{user.name.charAt(0)}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-slate-800">{user.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="px-2 py-1 rounded-md bg-white/60 text-xs font-medium border border-primary/10 text-primary capitalize shadow-sm">
                                {user.role}
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    </CardContent>
                </Card>

                {/* Active Modules Widget */}
                <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white opacity-100" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Modules</CardTitle>
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                            <span className="text-lg font-bold">M</span>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-slate-800">2</div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Fees & Attendance Active</p>
                        <div className="w-full bg-blue-100 h-1.5 mt-4 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[40%] rounded-full animate-pulse" />
                        </div>
                    </CardContent>
                </Card>

                {/* System Status Widget */}
                <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-white" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Status</CardTitle>
                        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                            <div className="h-3 w-3 rounded-full bg-green-600 animate-ping absolute opacity-75" />
                            <div className="h-3 w-3 rounded-full bg-green-600 relative" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-green-700">Online</div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-muted-foreground font-medium">System stable</p>
                            <span className="text-xs bg-white/80 px-2 py-1 rounded-md text-slate-500 border shadow-sm">v1.2.0</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions (Placeholder for future) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Can add more widgets here later */}
            </div>
        </div>
    );
}
