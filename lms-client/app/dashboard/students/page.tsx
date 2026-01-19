"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Eye } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Student {
    _id: string;
    name: string;
    rollNumber: string;
    class: string;
    section: string;
    parentName: string;
    parentPhone: string;
    status: string;
    registrationNumber?: string;
}

export default function StudentsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        parentName: '',
        parentPhone: '',
        class: '',
        section: '',
        dob: '',
        address: '',
        admissionDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!user) return;
        fetchStudents();
    }, [user]);

    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        setFilteredStudents(students.filter(s =>
            s.name.toLowerCase().includes(lowerSearch) ||
            s.rollNumber.toLowerCase().includes(lowerSearch) ||
            s.class.toLowerCase().includes(lowerSearch)
        ));
    }, [search, students]);

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_URL}/students`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to create student');

            toast.success("Student registered successfully");
            setIsAddOpen(false);
            setFormData({
                name: '',
                rollNumber: '',
                parentName: '',
                parentPhone: '',
                class: '',
                section: '',
                dob: '',
                address: '',
                admissionDate: new Date().toISOString().split('T')[0]
            });
            fetchStudents();
        } catch (error) {
            console.error(error);
            toast.error("Registration failed. Roll number might be duplicate.");
        }
    };

    if (!user) return null;

    if (user.role !== 'admin' && user.role !== 'teacher') {
        return <div className="p-6">Access Denied.</div>;
    }

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Students</h1>
                    <p className="text-muted-foreground">Manage student records and enrollment.</p>
                </div>
                {user.role === 'admin' && (
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg hover:shadow-xl transition-all">
                                <Plus className="mr-2 h-4 w-4" /> Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Register New Student</DialogTitle>
                                <DialogDescription>Enter the student&apos;s details for registration.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input id="name" name="name" required value={formData.name} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="rollNumber">Roll Number *</Label>
                                        <Input id="rollNumber" name="rollNumber" required value={formData.rollNumber} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="class">Class *</Label>
                                        <Input id="class" name="class" required placeholder="e.g. 10" value={formData.class} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="section">Section *</Label>
                                    <Input id="section" name="section" required placeholder="e.g. A" value={formData.section} onChange={handleInputChange} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="parentName">Parent Name *</Label>
                                        <Input id="parentName" name="parentName" required value={formData.parentName} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="parentPhone">Parent Phone *</Label>
                                        <Input id="parentPhone" name="parentPhone" required value={formData.parentPhone} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dob">Date of Birth</Label>
                                        <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admissionDate">Admission Date</Label>
                                        <Input id="admissionDate" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                                </div>

                                <DialogFooter className="mt-4">
                                    <Button type="submit">Register Student</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm max-w-sm">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by name, roll no, or class..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0"
                />
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Reg No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Parent Info</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</TableCell>
                            </TableRow>
                        ) : filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => (
                                <TableRow key={student._id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium">{student.registrationNumber}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.class} - {student.section} (Roll: {student.rollNumber})</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{student.parentName}</span>
                                            <span className="text-muted-foreground text-xs">{student.parentPhone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(student.status) as "default" | "secondary" | "destructive" | "outline"} className="capitalize">
                                            {student.status?.replace('_', ' ') || 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/students/${student._id}`)}>
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    );
}
