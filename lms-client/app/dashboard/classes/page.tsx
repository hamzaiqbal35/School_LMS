"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
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
import { Loader2, Plus, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ClassesPage() {
    interface Teacher { _id: string; name: string; }
    interface ClassItem { _id: string; name: string; teacherId?: Teacher; }

    const { user } = useAuthStore();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    // Create Class Form
    const [formData, setFormData] = useState({
        name: '',
        teacherId: ''
    });

    // Assign Teacher Form
    const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
    const [assignTeacherId, setAssignTeacherId] = useState('');

    useEffect(() => {
        if (!user) return;
        fetchClasses();
        fetchTeachers();
    }, [user]);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${API_URL}/classes`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setClasses(data);
        } catch {
            toast.error("Failed to load classes");
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await fetch(`${API_URL}/teachers`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setTeachers(data);
        } catch {
            console.error("Failed to load teachers");
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed');
            toast.success("Class created successfully");
            setIsCreateOpen(false);
            setFormData({ name: '', teacherId: '' });
            fetchClasses();
        } catch {
            toast.error("Failed to create class");
        }
    };

    const handleAssignTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;
        try {
            const res = await fetch(`${API_URL}/classes/${selectedClass._id}/assign-teacher`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherId: assignTeacherId })
            });
            if (!res.ok) throw new Error('Failed');
            toast.success("Teacher assigned successfully");
            setIsAssignOpen(false);
            setSelectedClass(null);
            setAssignTeacherId('');
            fetchClasses();
        } catch {
            toast.error("Failed to assign teacher");
        }
    };

    const openAssignDialog = (cls: ClassItem) => {
        setSelectedClass(cls);
        setAssignTeacherId(cls.teacherId?._id || '');
        setIsAssignOpen(true);
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-6">Access Denied</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Classes Management</h1>
                    <p className="text-muted-foreground">Create classes and assign teachers.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Class</DialogTitle>
                            <DialogDescription>Add a new class to the system.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateClass} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Class Name / Section</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. 10-A"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="teacher">Class Teacher (Optional)</Label>
                                <Select
                                    value={formData.teacherId}
                                    onValueChange={(val) => setFormData({ ...formData, teacherId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((t) => (
                                            <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Class</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Assigned Teacher</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</TableCell>
                            </TableRow>
                        ) : classes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No classes found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            classes.map((cls) => (
                                <TableRow key={cls._id}>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell>
                                        {cls.teacherId ? (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{cls.teacherId.name}</Badge>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {/* Placeholder for student count if we populate it later */}
                                        <span className="text-muted-foreground">-</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => openAssignDialog(cls)}>
                                            <UserPlus className="h-4 w-4 mr-2" /> Assign Teacher
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Assign Teacher Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Teacher</DialogTitle>
                        <DialogDescription>Assign a class teacher to <strong>{selectedClass?.name}</strong></DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignTeacher} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Teacher</Label>
                            <Select
                                value={assignTeacherId}
                                onValueChange={setAssignTeacherId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Search or select teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((t) => (
                                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Assignment</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
