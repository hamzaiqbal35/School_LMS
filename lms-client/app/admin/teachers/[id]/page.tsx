"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatTime12Hour } from "@/lib/utils";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  UserCheck,
  Award,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";

interface Teacher {
  fullName: string;
  email: string;
  isActive: boolean;
  phoneNumber?: string;
  qualifications?: string[];
  qualifiedSubjects?: Array<{ _id: string; name: string }>;
  avatar?: string;
}

interface Assignment {
  _id: string;
  active: boolean;
  timeSlotId: {
    startTime: string;
    endTime: string;
    day: string;
    label: string;
  };
  subjectId: {
    name: string;
    code: string;
  };
  classId: {
    name: string;
  };
  sectionId: {
    name: string;
  };
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: string;
  markedBy?: { fullName: string };
}

export default function TeacherDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const historyQuery = selectedMonth
        ? `/teacher-attendance?teacherId=${resolvedParams.id}&month=${selectedMonth}`
        : `/teacher-attendance?teacherId=${resolvedParams.id}&limit=10`;

      const [teacherRes, assignRes, attendanceRes] = await Promise.all([
        api.get(`/admin/teachers/${resolvedParams.id}`),
        api.get(`/admin/assignments?teacherId=${resolvedParams.id}`),
        api.get(historyQuery),
      ]);
      setTeacher(teacherRes.data);
      setAssignments(assignRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, selectedMonth]);

  useEffect(() => {
    if (resolvedParams.id) {
      fetchData();
    }
  }, [resolvedParams.id, fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-2" />
        <p className="text-xs font-semibold">Loading faculty record...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-600 mb-4">Faculty record not found.</p>
        <button
          onClick={() => router.push("/admin/teachers")}
          className="px-5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
        >
          Return to Faculty Registry
        </button>
      </div>
    );
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const otherAssignments = assignments.filter((a) => a.active && !days.includes(a.timeSlotId?.day));
  const activeCount = assignments.filter((a) => a.active).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* TOP BREADCRUMB & BACK NAVIGATION */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin/teachers")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-800" />
          <span>Back to Faculty Roster</span>
        </button>

        <div className="text-xs text-slate-400 font-mono">
          REF: FAC-{resolvedParams.id.slice(-6).toUpperCase()}
        </div>
      </div>

      {/* EXECUTIVE PROFILE HERO BANNER (OXFORD NAVY) */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar Showcase */}
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-emerald-500/30 relative overflow-hidden shrink-0">
            {teacher.avatar ? (
              <Image
                src={teacher.avatar}
                alt={teacher.fullName}
                fill
                className="object-cover rounded-xl"
                sizes="128px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white text-4xl font-bold font-mono">
                {(teacher.fullName || "T").charAt(0)}
              </div>
            )}
          </div>

          {/* Profile Identity Details */}
          <div className="flex-1 text-center md:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/90 border border-emerald-800/60 px-3 py-0.5 rounded-full">
                Certified Faculty
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full ${
                  teacher.isActive !== false
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {teacher.isActive !== false ? "Active Status" : "Deactivated"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              {teacher.fullName}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono">{teacher.email}</span>
              </div>
              {teacher.phoneNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono">{teacher.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-4 flex flex-wrap gap-4 text-xs text-slate-300 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Classroom Load:</span>
                <strong className="text-white font-mono">{activeCount} Periods / Week</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Qualified Subjects:</span>
                <strong className="text-white font-mono">{teacher.qualifiedSubjects?.length || 0} Registered</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: QUALIFICATIONS & DETAILS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Qualifications Dossier */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Academic Qualifications</h3>
                <p className="text-[11px] text-slate-500">Certified degrees and background</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="block font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                  Degrees &amp; Certifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.qualifications && teacher.qualifications.length > 0 ? (
                    teacher.qualifications.map((q, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200"
                      >
                        {q}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No degrees recorded</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="block font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                  Qualified Teaching Disciplines
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.qualifiedSubjects && teacher.qualifiedSubjects.length > 0 ? (
                    teacher.qualifiedSubjects.map((s) => (
                      <span
                        key={s._id}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-semibold text-xs border border-emerald-200/80 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>{s.name}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMETABLE & ATTENDANCE (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* WEEKLY TIMETABLE SCHEDULE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Weekly Teaching Timetable</h3>
                  <p className="text-[11px] text-slate-500">Allocated classroom periods by weekday</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {activeCount} Classes / Week
              </span>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-4">
                {days.map((day) => {
                  const dayAssignments = assignments.filter(
                    (a) => a.active && a.timeSlotId?.day === day
                  );
                  if (dayAssignments.length === 0) return null;

                  return (
                    <div
                      key={day}
                      className="rounded-xl border border-slate-200/90 overflow-hidden bg-slate-50/40"
                    >
                      <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{day}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {dayAssignments.length} {dayAssignments.length === 1 ? "Period" : "Periods"}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100 bg-white">
                        {dayAssignments.map((assign) => (
                          <div
                            key={assign._id}
                            className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-24 text-center shrink-0">
                                <p className="font-bold font-mono text-slate-900 text-xs">
                                  {formatTime12Hour(assign.timeSlotId?.startTime)}
                                </p>
                                <p className="text-[10px] font-mono text-slate-500">
                                  {formatTime12Hour(assign.timeSlotId?.endTime)}
                                </p>
                              </div>

                              <div>
                                <p className="font-bold text-slate-900 text-xs">
                                  {assign.subjectId?.name}{" "}
                                  <span className="text-slate-400 font-mono text-[10px]">
                                    ({assign.subjectId?.code || "SUBJ"})
                                  </span>
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Class {assign.classId?.name} &bull; Section {assign.sectionId?.name}
                                </p>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-semibold">
                              {assign.timeSlotId?.label || "Regular Period"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {otherAssignments.length > 0 && (
                  <div className="rounded-xl border border-amber-200 overflow-hidden bg-amber-50/30">
                    <div className="bg-amber-100/70 px-4 py-2 border-b border-amber-200 text-amber-900 font-bold text-xs">
                      Unscheduled / Flexible Assignments
                    </div>
                    <div className="divide-y divide-amber-100 bg-white">
                      {otherAssignments.map((assign) => (
                        <div
                          key={assign._id}
                          className="p-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{assign.subjectId?.name}</p>
                            <p className="text-[11px] text-slate-500">
                              Class {assign.classId?.name} - {assign.sectionId?.name}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                            {assign.timeSlotId?.day || "Special"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">No active classes assigned.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Assign classroom periods through Teacher Assignments.
                </p>
              </div>
            )}
          </div>

          {/* FACULTY ATTENDANCE AUDIT LEDGER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Attendance Log</h3>
                  <p className="text-[11px] text-slate-500">Daily check-in verification records</p>
                </div>
              </div>

              <div>
                <input
                  type="month"
                  id="attendanceMonth"
                  name="attendanceMonth"
                  aria-label="Filter by Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-700 bg-slate-50 text-slate-700"
                />
              </div>
            </div>

            {attendance.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-900">
                          {new Date(record.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              record.status === "Present"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : record.status === "Absent"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : record.status === "Leave"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-sky-50 text-sky-800 border border-sky-200"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                          {record.markedBy?.fullName || "Administrative Audit"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs">
                <p>No attendance records found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
