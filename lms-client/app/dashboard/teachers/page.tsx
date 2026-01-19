"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Teacher {
    _id: string;
    name: string;
    email: string;
    subjects: string[];
    qualification?: string;
    isActive: boolean;
}

interface ClassItem {
    _id: string;
    name: string;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form Stats for Creating Teacher
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        subjects: '',
        qualification: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Assign Schedule States
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [assignData, setAssignData] = useState({
        classId: '',
        subject: '',
        day: 'Monday',
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        fetchTeachers();
        fetchClasses();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await fetch(`${API_URL}/teachers`);
            if (!res.ok) throw new Error('Failed to fetch teachers');
            const data = await res.json();
            setTeachers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${API_URL}/classes`);
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
            }
        } catch {
            console.error("Failed to load classes");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                subjects: formData.subjects.split(',').map(s => s.trim()),
                password: formData.password || 'password123'
            };

            const res = await fetch(`${API_URL}/teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create teacher');
            }

            toast.success("Teacher created successfully");
            setIsAddOpen(false);
            setFormData({ name: '', email: '', password: '', subjects: '', qualification: '' });
            fetchTeachers();
        } catch {
            // error is unknown, we can cast or just log
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const openAssignDialog = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsAssignOpen(true);
    };

    const handleAssignSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher || !assignData.classId) return;

        try {
            const res = await fetch(`${API_URL}/classes/${assignData.classId}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: selectedTeacher._id,
                    day: assignData.day,
                    subject: assignData.subject,
                    startTime: assignData.startTime,
                    endTime: assignData.endTime
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to assign schedule");
            }

            toast.success("Schedule assigned successfully");
            setIsAssignOpen(false);
            setAssignData({
                classId: '',
                subject: '',
                day: 'Monday',
                startTime: '',
                endTime: ''
            });
        } catch {
            toast.error("An error occurred");
        }
    };

    const filteredTeachers = teachers.filter((t: Teacher) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Teachers</h1>
                    <p className="text-muted-foreground">Manage teacher profiles and assignments.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Add Teacher
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Teacher</DialogTitle>
                                <DialogDescription>
                                    Create a new teacher profile. They will receive an email with login details.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qualification">Qualification</Label>
                                    <Input id="qualification" placeholder="e.g. MSc Mathematics" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="subjects">Subjects (comma separated)</Label>
                                    <Input id="subjects" placeholder="Math, Physics" value={formData.subjects} onChange={e => setFormData({ ...formData, subjects: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Initial Password</Label>
                                    <Input id="password" type="password" placeholder="Default: password123" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Teacher
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0"
                />
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead>Qualification</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</TableCell>
                            </TableRow>
                        ) : filteredTeachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No teachers found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredTeachers.map((teacher: Teacher) => (
                                <TableRow key={teacher._id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {teacher.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{teacher.name}</div>
                                            <div className="text-xs text-muted-foreground">{teacher.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.subjects && teacher.subjects.map((sub: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                    {sub}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>{teacher.qualification || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={teacher.isActive ? "default" : "destructive"} className="px-2 py-0.5 text-xs">
                                            {teacher.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openAssignDialog(teacher)}>
                                                    Assign Class Schedule
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(teacher._id)}>
                                                    Copy ID
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Schedule</DialogTitle>
                        <DialogDescription>
                            Assign a class period to <strong>{selectedTeacher?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignSchedule} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Class</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={assignData.classId}
                                onChange={(e) => setAssignData({ ...assignData, classId: e.target.value })}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map((cls) => (
                                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                placeholder="e.g. Mathematics"
                                value={assignData.subject}
                                onChange={(e) => setAssignData({ ...assignData, subject: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Day</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={assignData.day}
                                    onChange={(e) => setAssignData({ ...assignData, day: e.target.value })}
                                >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={assignData.startTime}
                                    onChange={(e) => setAssignData({ ...assignData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={assignData.endTime}
                                    onChange={(e) => setAssignData({ ...assignData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Schedule</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
