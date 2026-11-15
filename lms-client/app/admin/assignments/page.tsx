"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { formatTime12Hour } from "@/lib/utils";
import {
  Loader2,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Check,
  Search,
  X,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";

interface TimeSlot {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  name?: string;
}

interface MasterData {
  classes: { _id: string; name: string }[];
  sections: { _id: string; name: string }[];
  subjects: { _id: string; name: string }[];
  teachers: { _id: string; fullName: string }[];
  timeslots: TimeSlot[];
}

interface Assignment {
  _id: string;
  classId: { _id: string; name: string };
  sectionId: { _id: string; name: string };
  subjectId: { _id: string; name: string };
  teacherId: { _id: string; fullName: string; avatar?: string };
  timeSlotId: TimeSlot;
}

export default function AssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MasterData>({
    classes: [],
    sections: [],
    subjects: [],
    teachers: [],
    timeslots: [],
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    teacherId: "",
    classId: "",
    sectionId: "",
    subjectId: "",
    timeSlotIds: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [masterRes, assignRes] = await Promise.all([
        api.get("/admin/master-data"),
        api.get("/admin/assignments"),
      ]);
      setData(masterRes.data);
      setAssignments(assignRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load timetable schedules.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.timeSlotIds.length === 0) {
      toast.error("Please designate at least one period time slot.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("/admin/assignments", formData);

      if (res.data.assignments) {
        setAssignments([...assignments, ...res.data.assignments]);
        toast.success(res.data.message || "Period allocation confirmed.");
      } else {
        setAssignments([...assignments, res.data]);
        toast.success("Period allocation confirmed.");
      }

      if (res.data.warnings && res.data.warnings.length > 0) {
        toast.warning(`Schedule note: ${res.data.warnings.join(", ")}`);
      }

      fetchData();
      setFormData((prev) => ({ ...prev, timeSlotIds: [] }));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Assignment schedule conflict.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to de-allocate this timetable assignment?")) return;
    try {
      await api.delete(`/admin/assignments/${id}`);
      setAssignments(assignments.filter((a) => a._id !== id));
      toast.success("Period allocation removed.");
    } catch {
      toast.error("Failed to delete period assignment.");
    }
  };

  const toggleSlot = (id: string) => {
    setFormData((prev) => {
      if (prev.timeSlotIds.includes(id)) {
        return { ...prev, timeSlotIds: prev.timeSlotIds.filter((sid) => sid !== id) };
      } else {
        return { ...prev, timeSlotIds: [...prev.timeSlotIds, id] };
      }
    });
  };

  const groupedSlots = data.timeslots.reduce(
    (acc, slot) => {
      if (!acc[slot.day]) acc[slot.day] = [];
      acc[slot.day].push(slot);
      return acc;
    },
    {} as Record<string, TimeSlot[]>
  );

  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      searchTerm === "" ||
      assignment.teacherId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.classId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass === "" || assignment.classId?._id === filterClass;
    const matchesSubject = filterSubject === "" || assignment.subjectId?._id === filterSubject;
    const matchesTeacher = filterTeacher === "" || assignment.teacherId?._id === filterTeacher;

    return matchesSearch && matchesClass && matchesSubject && matchesTeacher;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterClass("");
    setFilterSubject("");
    setFilterTeacher("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-3" />
        <p className="text-xs font-semibold">Loading period timetable matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Master Period Allocation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Teacher Schedule Allocations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Map qualified faculty specialists to classes, sections, and daily lecture slots.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs">
                  Allocate New Period
                </h3>
                <p className="text-[10px] text-slate-500">
                  Assign faculty to lecture slots
                </p>
              </div>
            </div>

            <div className="p-5">
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label htmlFor="teacherId" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designated Faculty
                  </label>
                  <select
                    id="teacherId"
                    name="teacherId"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all cursor-pointer"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    required
                  >
                    <option value="">Select Faculty Member</option>
                    {data.teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="classId" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Class Level
                    </label>
                    <select
                      id="classId"
                      name="classId"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all cursor-pointer"
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      required
                    >
                      <option value="">Class</option>
                      {data.classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sectionId" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cohort Section
                    </label>
                    <select
                      id="sectionId"
                      name="sectionId"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all cursor-pointer"
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      required
                    >
                      <option value="">Section</option>
                      {data.sections.map((s) => (
                        <option key={s._id} value={s._id}>
                          Section {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subjectId" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Subject
                  </label>
                  <select
                    id="subjectId"
                    name="subjectId"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all cursor-pointer"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                  >
                    <option value="">Select Subject</option>
                    {data.subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Daily Time Slots
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.2 rounded">
                      {formData.timeSlotIds.length} chosen
                    </span>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar border border-slate-200 rounded-xl p-2.5 bg-slate-50/50">
                    {daysOrder.map((day) => {
                      const slots = groupedSlots[day];
                      if (!slots || slots.length === 0) return null;

                      return (
                        <div key={day} className="bg-white rounded-lg p-2 border border-slate-200/80">
                          <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>{day}</span>
                            <span className="text-slate-400 font-mono-code text-[9px]">{slots.length} slots</span>
                          </div>
                          <div className="space-y-1">
                            {slots.map((slot) => {
                              const isChecked = formData.timeSlotIds.includes(slot._id);
                              return (
                                <label
                                  key={slot._id}
                                  className={`flex items-start gap-2 p-1.5 rounded-lg cursor-pointer transition-colors border text-xs ${
                                    isChecked
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                      : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isChecked}
                                    onChange={() => toggleSlot(slot._id)}
                                  />
                                  <div
                                    className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                      isChecked
                                        ? "bg-emerald-800 border-emerald-800 text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isChecked && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[11px] font-bold text-slate-900 truncate">
                                      {slot.name || `Period ${slot.day}`}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono-code">
                                      {formatTime12Hour(slot.startTime)} &ndash; {formatTime12Hour(slot.endTime)}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {data.timeslots.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        No time slots configured. Add them under Classes &gt; Time Slots.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs p-3 rounded-xl shadow-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin w-4 h-4 text-emerald-200" />
                  ) : (
                    "Confirm Period Assignment"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Assignments Ledger Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Active Timetable Matrix
                </h3>
                <p className="text-[11px] text-slate-500">
                  Confirmed weekly faculty lectures
                </p>
              </div>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-mono-code font-bold">
                {filteredAssignments.length} Scheduled
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex flex-col md:flex-row gap-2.5">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    id="searchAssignments"
                    name="searchAssignments"
                    type="text"
                    placeholder="Search by faculty, subject or class..."
                    className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    id="filterClass"
                    name="filterClass"
                    className="px-2.5 py-2 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 outline-none focus:border-emerald-700 cursor-pointer"
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {data.classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    id="filterSubject"
                    name="filterSubject"
                    className="px-2.5 py-2 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 outline-none focus:border-emerald-700 cursor-pointer"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {data.subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {(searchTerm || filterClass || filterSubject || filterTeacher) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Faculty &amp; Discipline
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Cohort
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Weekly Period
                    </th>
                    <th className="px-5 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredAssignments.map((assignment) => (
                      <motion.tr
                        key={assignment._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-9 w-9 text-xs font-bold font-mono-code rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center justify-center shrink-0 relative overflow-hidden">
                              {assignment.teacherId?.avatar ? (
                                <Image
                                  src={assignment.teacherId.avatar}
                                  alt={assignment.teacherId.fullName}
                                  fill
                                  className="object-cover"
                                  sizes="36px"
                                />
                              ) : (
                                (assignment.teacherId?.fullName || "T").charAt(0)
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="font-bold text-slate-900">
                                {assignment.teacherId?.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <BookOpen className="w-2.5 h-2.5 text-emerald-700" />
                                {assignment.subjectId?.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {assignment.classId?.name} &bull; Section {assignment.sectionId?.name}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="font-medium text-slate-900 flex items-center gap-1.5 font-mono-code">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatTime12Hour(assignment.timeSlotId?.startTime)} &ndash;{" "}
                              {formatTime12Hour(assignment.timeSlotId?.endTime)}
                            </div>
                            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                              {assignment.timeSlotId?.day}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(assignment._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Period Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {filteredAssignments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3 text-slate-400">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-slate-800 text-xs">No active assignments found</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Use the form on the left to allocate periods to teachers.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}