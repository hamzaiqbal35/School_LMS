"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, BookOpen, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TeacherProfilePage() {
    const params = useParams();
    interface Teacher { name: string; email: string; isActive: boolean; qualification?: string; createdAt: string; subjects: string[]; }
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock data for now until API endpoints for specific stats are ready
    const [stats] = useState({
        totalClasses: 5,
        attendanceRate: '95%',
        classesThisMonth: 120
    });

    useEffect(() => {
        const fetchTeacher = async () => {
            if (!params.id) return;
            try {
                const res = await fetch(`${API_URL}/teachers/${params.id}`);
                if (!res.ok) throw new Error('Failed to fetch teacher');
                const data = await res.json();
                setTeacher(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
    if (!teacher) return <div className="p-8 text-center">Teacher not found</div>;

    return (
        <div className="space-y-6">
            {/* Header / ID Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-4 border-slate-50">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {teacher.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 bg-clip-text">
                                {teacher.name}
                            </h1>
                            <p className="text-muted-foreground">{teacher.email}</p>
                        </div>
                        <Badge variant={teacher.isActive ? "default" : "destructive"} className="capitalize">
                            {teacher.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>

                    <div className="flex gap-4 pt-2 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span className="font-semibold">Qualification:</span> {teacher.qualification || 'N/A'}
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-semibold">Joined:</span> {new Date(teacher.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {teacher.subjects && teacher.subjects.map((sub: string, i: number) => (
                            <Badge key={i} variant="secondary">{sub}</Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Classes</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClasses}</div>
                        <p className="text-xs text-muted-foreground">Active Sections</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Attendance</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.attendanceRate}</div>
                        <p className="text-xs text-muted-foreground">Present Days</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-100 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Classes Handled</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.classesThisMonth}</div>
                        <p className="text-xs text-muted-foreground">This Month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Detailed Info */}
            <Tabs defaultValue="classes" className="w-full">
                <TabsList className="bg-white border">
                    <TabsTrigger value="classes">Assigned Classes</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance History</TabsTrigger>
                    <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
                </TabsList>

                {/* Assigned Classes Content */}
                <TabsContent value="classes" className="mt-4">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-0">
                            <div className="p-8 text-center text-muted-foreground border rounded-lg bg-slate-50 border-dashed">
                                No classes assigned yet. (Implementation Pending)
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Attendance History Content */}
                <TabsContent value="attendance" className="mt-4">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-0">
                            <div className="p-8 text-center text-muted-foreground border rounded-lg bg-slate-50 border-dashed">
                                No attendance records found.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
