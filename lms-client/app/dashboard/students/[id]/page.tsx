"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertTriangle,
    Loader2
} from 'lucide-react';
// Separator, Calendar, and unused icons removed
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
// cn removed if unused
// import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Payment {
    _id: string;
    createdAt: string;
    amountPaid: number;
    paymentMethod: string;
    fee?: { name: string };
}
interface AttendanceStats {
    percentage: number;
    presentDays: number;
    totalDays: number;
}
interface StudentDetailData {
    student: {
        name: string;
        registrationNumber: string;
        class: string;
        section: string;
        rollNumber: string;
        status: string;
        parentName?: string;
        parentPhone?: string;
        address?: string;
        dob?: string;
        createdAt: string;
        admissionDate?: string;
        frozenAttendance?: { isFrozen: boolean; reason?: string; };
    };
    payments: Payment[];
    attendanceStats: AttendanceStats;
}

export default function StudentDetailPage() {
    const params = useParams();
    // router removed
    const [studentData, setStudentData] = useState<StudentDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    // Actions State
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [newClass, setNewClass] = useState('');
    const [newSection, setNewSection] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const fetchStudent = useCallback(async () => {
        if (!params.id) return;
        try {
            const res = await fetch(`${API_URL}/students/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch student');
            const data = await res.json();
            setStudentData(data);
            setNewStatus(data.student.status);
        } catch {
            // console.error(error);
            toast.error("Failed to load student details");
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchStudent();
    }, [fetchStudent]);

    const handleClassUpdate = async () => {
        try {
            const res = await fetch(`${API_URL}/students/${params.id}/class`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ className: newClass, section: newSection })
            });
            if (!res.ok) throw new Error('Failed to update class');
            toast.success("Class updated successfully");
            setIsClassOpen(false);
            fetchStudent();
        } catch {
            toast.error("Update failed");
        }
    };

    const handleStatusUpdate = async () => {
        try {
            const res = await fetch(`${API_URL}/students/${params.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
            toast.success("Status updated successfully");
            setIsStatusOpen(false);
            fetchStudent();
        } catch {
            toast.error("Update failed");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!studentData) return <div className="p-10 text-center">Student not found</div>;

    const { student, payments, attendanceStats } = studentData;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            case 'suspended': return 'destructive';
            case 'passed_out': return 'outline';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex gap-6">
                    <Avatar className="h-24 w-24 border-4 border-slate-50">
                        <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 font-bold">
                            {student.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-800">{student.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>Reg: {student.registrationNumber}</span>
                            <span>•</span>
                            <span>Class {student.class} - {student.section} (Roll: {student.rollNumber})</span>
                        </div>
                        <div className="pt-2">
                            <Badge variant={getStatusColor(student.status) as "default" | "destructive" | "outline" | "secondary"} className="capitalize px-3 py-1">
                                {student.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Dialog open={isClassOpen} onOpenChange={setIsClassOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Change Class</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Promote / Change Class</DialogTitle>
                                <DialogDescription>Update class and section for {student.name}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Class</Label>
                                    <Input placeholder="e.g. 10" value={newClass} onChange={e => setNewClass(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Section</Label>
                                    <Input placeholder="e.g. A" value={newSection} onChange={e => setNewSection(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleClassUpdate}>Update</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">Manage Status</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Manage Student Status</DialogTitle>
                                <DialogDescription>
                                    Current Status: <span className="font-bold capitalize">{student.status}</span>
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>New Status</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                            <SelectItem value="passed_out">Passed Out</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleStatusUpdate}>Confirm Change</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-white border w-full justify-start h-12 p-1">
                    <TabsTrigger value="overview" className="h-full px-6">Overview</TabsTrigger>
                    <TabsTrigger value="fees" className="h-full px-6">Fee History</TabsTrigger>
                    <TabsTrigger value="attendance" className="h-full px-6">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Admission Date</p>
                                        <p className="font-medium">{new Date(student.admissionDate || student.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Father&apos;s Name</p>
                                        <p className="font-medium">{student.parentName}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Contact</p>
                                        <p className="font-medium">{student.parentPhone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Address</p>
                                        <p className="font-medium">{student.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                    Administrative Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {student.frozenAttendance?.isFrozen ? (
                                    <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 text-sm">
                                        <strong>Attendance Frozen</strong>
                                        <br />
                                        Reason: {student.frozenAttendance.reason}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No active restrictions.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="fees" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>All fee transactions for this student.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No payments found</TableCell>
                                        </TableRow>
                                    ) : (
                                        payments.map((p) => (
                                            <TableRow key={p._id}>
                                                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>{p.fee?.name || 'Fee Payment'}</TableCell>
                                                <TableCell className="capitalize">{p.paymentMethod}</TableCell>
                                                <TableCell className="text-right font-medium">${p.amountPaid}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="mt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">Attendance Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-slate-800">{attendanceStats.percentage}%</div>
                                <p className="text-xs text-muted-foreground mt-1">Present Days: {attendanceStats.presentDays} / {attendanceStats.totalDays}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
