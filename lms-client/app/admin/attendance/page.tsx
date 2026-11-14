"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import {
  Loader2,
  Lock,
  Unlock,
  History,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  Users,
  GraduationCap,
  ChevronDown,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";

interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    registrationNumber: string;
  };
  classId?: { _id: string; name: string };
  sectionId?: { _id: string; name: string };
  status: string;
  markedBy?: { fullName: string; avatar?: string };
  markedAt: string;
  isFrozen: boolean;
  history?: { status: string; timestamp: string; reason?: string }[];
}

interface TeacherRecord {
  teacherId: { _id: string; fullName: string; avatar?: string };
  status: string;
  markedAt?: string;
  markedBy?: { fullName: string };
}

interface MasterData {
  classes: { _id: string; name: string }[];
  sections: { _id: string; name: string }[];
}

export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState<"STUDENT" | "TEACHER">("STUDENT");

  // Common
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Student State
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [masterData, setMasterData] = useState<MasterData>({ classes: [], sections: [] });
  const [isFrozen, setIsFrozen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Teacher State
  const [teachers, setTeachers] = useState<
    { _id: string; fullName: string; email: string; avatar?: string }[]
  >([]);
  const [teacherRecords, setTeacherRecords] = useState<TeacherRecord[]>([]);

  useEffect(() => {
    api.get("/admin/master-data").then((res) => setMasterData(res.data));
  }, []);

  const fetchStudentAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const attendanceParams = new URLSearchParams({ date });
      const studentParams = new URLSearchParams({ status: "Active" });

      if (classId) {
        attendanceParams.append("classId", classId);
        studentParams.append("classId", classId);
      }
      if (sectionId) {
        attendanceParams.append("sectionId", sectionId);
        studentParams.append("sectionId", sectionId);
      }

      const [attendanceRes, studentsRes] = await Promise.all([
        api.get(`/attendance?${attendanceParams.toString()}`),
        api.get(`/admin/students?${studentParams.toString()}`),
      ]);

      const attendanceRecords = attendanceRes.data;
      const allStudents = studentsRes.data;
      const frozenStatus = attendanceRecords.length > 0 ? attendanceRecords[0].isFrozen : false;
      setIsFrozen(frozenStatus);

      const mergedRecords: AttendanceRecord[] = allStudents.map(
        (student: {
          _id: string;
          fullName: string;
          registrationNumber: string;
          classId: { _id: string; name: string };
          sectionId: { _id: string; name: string };
        }) => {
          const existingRecord = attendanceRecords.find(
            (r: AttendanceRecord) => r.studentId._id === student._id
          );
          if (existingRecord) {
            return existingRecord;
          }
          return {
            _id: `temp-${student._id}`,
            studentId: {
              _id: student._id,
              fullName: student.fullName,
              registrationNumber: student.registrationNumber,
            },
            classId: student.classId,
            sectionId: student.sectionId,
            status: "Not Marked",
            markedAt: "",
            isFrozen: frozenStatus,
          };
        }
      );

      setStudentRecords(mergedRecords);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load student attendance roll call.");
    } finally {
      setLoading(false);
    }
  }, [date, classId, sectionId]);

  const fetchTeacherAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const [teachersRes, attendanceRes] = await Promise.all([
        api.get("/admin/teachers"),
        api.get(`/teacher-attendance?date=${date}`),
      ]);

      setTeachers(teachersRes.data);
      setTeacherRecords(attendanceRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load faculty attendance.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (activeTab === "STUDENT") {
      fetchStudentAttendance();
    } else if (activeTab === "TEACHER") {
      fetchTeacherAttendance();
    }
  }, [activeTab, date, classId, sectionId, fetchStudentAttendance, fetchTeacherAttendance]);

  const markTeacherStatus = async (teacherId: string, status: string) => {
    try {
      const updatedRecords = teacherRecords.some((r) => r.teacherId._id === teacherId)
        ? teacherRecords.map((r) => (r.teacherId._id === teacherId ? { ...r, status } : r))
        : [
            ...teacherRecords,
            {
              teacherId: { _id: teacherId, fullName: "" },
              status,
              markedAt: new Date().toISOString(),
              markedBy: { fullName: "Admin" },
            },
          ];

      setTeacherRecords(updatedRecords);

      await api.post("/teacher-attendance", {
        date,
        records: [{ teacherId, status }],
      });

      toast.success(`Faculty status recorded as ${status}.`);
      const res = await api.get(`/teacher-attendance?date=${date}`);
      setTeacherRecords(res.data);
    } catch {
      toast.error("Failed to record faculty attendance.");
      fetchTeacherAttendance();
    }
  };

  const toggleFreeze = async () => {
    if (!classId || !sectionId) {
      toast.warning("Please select a specific Class and Section to freeze or unfreeze.");
      return;
    }
    try {
      await api.post("/attendance/freeze", {
        date,
        classId,
        sectionId,
        action: isFrozen ? "UNFREEZE" : "FREEZE",
      });
      setIsFrozen(!isFrozen);
      toast.success(isFrozen ? "Attendance audit unlocked." : "Attendance audit locked.");
      fetchStudentAttendance();
    } catch {
      toast.error("Failed to update freeze status.");
    }
  };

  const markStudentStatus = async (studentId: string, status: string) => {
    if (!classId || !sectionId) {
      toast.warning("Please filter by a specific Class and Section before recording attendance.");
      return;
    }
    try {
      const updatedRecords = studentRecords.map((r) =>
        r.studentId._id === studentId ? { ...r, status } : r
      );
      setStudentRecords(updatedRecords);

      await api.post("/attendance", {
        date,
        classId,
        sectionId,
        records: [{ studentId, status }],
      });

      toast.success(`Student attendance marked: ${status}`);
      fetchStudentAttendance();
    } catch (err) {
      console.error(err);
      toast.error("Failed to record student status.");
      fetchStudentAttendance();
    }
  };

  const filteredStudentRecords = studentRecords.filter(
    (record) => statusFilter === "ALL" || record.status === statusFilter
  );

  const filteredTeacherRecords = teachers.filter((teacher) => {
    if (statusFilter === "ALL") return true;
    const record = teacherRecords.find((r) => r.teacherId._id === teacher._id);
    const status = record ? record.status : "Not Marked";
    return status === statusFilter;
  });

  const currentCount =
    activeTab === "STUDENT" ? filteredStudentRecords.length : filteredTeacherRecords.length;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Daily Attendance &amp; Institutional Audit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Attendance Roll Call &amp; Freeze Matrix
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Audit-locked homeroom attendance for students and faculty compliance tracking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-2xl shadow-xs border border-slate-200">
          <button
            onClick={() => setActiveTab("STUDENT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "STUDENT"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Roll Call</span>
          </button>
          <button
            onClick={() => setActiveTab("TEACHER")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "TEACHER"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Faculty Attendance</span>
          </button>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-wrap items-end gap-3.5">
          <div>
            <label
              htmlFor="filterDate"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Calendar Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                id="filterDate"
                name="filterDate"
                type="date"
                className="pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-800 font-medium focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all bg-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {activeTab === "STUDENT" && (
            <>
              <div>
                <label
                  htmlFor="filterClass"
                  className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Class Cohort
                </label>
                <div className="relative">
                  <select
                    id="filterClass"
                    name="filterClass"
                    className="pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none min-w-[150px] appearance-none transition-all bg-white cursor-pointer"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {masterData.classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="filterSection"
                  className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Section
                </label>
                <div className="relative">
                  <select
                    id="filterSection"
                    name="filterSection"
                    className="pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none min-w-[140px] appearance-none transition-all bg-white cursor-pointer"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                  >
                    <option value="">All Sections</option>
                    {masterData.sections.map((s) => (
                      <option key={s._id} value={s._id}>
                        Section {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                </div>
              </div>

              {classId && sectionId && (
                <div className="ml-auto">
                  <button
                    onClick={toggleFreeze}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isFrozen
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
                    }`}
                  >
                    {isFrozen ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        <span>Attendance Locked (Compliance Active)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Lock Roll Call (Audit Freeze)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Status Filter */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-mono-code font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              {currentCount} Entries
            </span>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Not Marked">Not Marked</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-emerald-800 w-8 h-8 mb-3" />
            <p className="text-xs font-semibold">Synchronizing roll call records...</p>
          </div>
        ) : activeTab === "STUDENT" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Student Scholar
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Cohort
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Audit Toggles
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Audited By
                  </th>
                  <th className="px-5 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Modifications
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <AnimatePresence>
                  {filteredStudentRecords.map((record) => (
                    <motion.tr
                      key={record._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-900 font-bold font-mono-code text-xs shrink-0">
                            {(record.studentId?.fullName || "?").charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {record.studentId?.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono-code">
                              {record.studentId?.registrationNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                        {record.classId?.name} &bull; Section {record.sectionId?.name}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${
                            record.status === "Present"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : record.status === "Absent"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : record.status === "Leave"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : record.status === "Late"
                              ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {record.status === "Present" && <UserCheck className="w-3 h-3 mr-1" />}
                          {record.status === "Absent" && <UserX className="w-3 h-3 mr-1" />}
                          {record.status === "Leave" && <Calendar className="w-3 h-3 mr-1" />}
                          {record.status === "Late" && <Clock className="w-3 h-3 mr-1" />}
                          {record.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex bg-slate-100 rounded-xl p-0.5 w-fit border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => markStudentStatus(record.studentId._id, "Present")}
                            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              record.status === "Present"
                                ? "bg-emerald-800 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                            title="Mark Present"
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => markStudentStatus(record.studentId._id, "Absent")}
                            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              record.status === "Absent"
                                ? "bg-rose-700 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                            title="Mark Absent"
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => markStudentStatus(record.studentId._id, "Leave")}
                            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              record.status === "Leave"
                                ? "bg-amber-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                            title="Mark Leave"
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => markStudentStatus(record.studentId._id, "Late")}
                            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              record.status === "Late"
                                ? "bg-indigo-700 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                            title="Mark Late"
                          >
                            Lt
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                        <div className="font-semibold text-slate-900">
                          {record.markedBy?.fullName || "Unrecorded"}
                        </div>
                        {record.markedAt && (
                          <div className="text-[10px] text-slate-400 font-mono-code flex items-center mt-0.5">
                            <Clock className="w-2.5 h-2.5 mr-1" />
                            {new Date(record.markedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        {record.history && record.history.length > 1 && (
                          <span className="text-[10px] font-mono-code font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                            {record.history.length} audits
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {filteredStudentRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                          <Users className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="font-bold text-slate-800 text-xs">No attendance roll calls found</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Select a Class Cohort and Section from the toolbar above.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Faculty Member
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Current Daily Status
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Audit Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <AnimatePresence>
                  {filteredTeacherRecords.map((teacher) => {
                    const record = teacherRecords.find((r) => r.teacherId._id === teacher._id);
                    const status = record ? record.status : null;

                    return (
                      <motion.tr
                        key={teacher._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-900 font-bold font-mono-code text-xs relative overflow-hidden shrink-0">
                              {teacher.avatar ? (
                                <Image
                                  src={teacher.avatar}
                                  alt={teacher.fullName}
                                  fill
                                  className="object-cover"
                                  sizes="36px"
                                />
                              ) : (
                                teacher.fullName.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{teacher.fullName}</div>
                              <div className="text-[11px] text-slate-500">{teacher.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {status ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${
                                status === "Present"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : status === "Absent"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {status === "Present" && <UserCheck className="w-3 h-3 mr-1" />}
                              {status === "Absent" && <UserX className="w-3 h-3 mr-1" />}
                              {status === "Leave" && <Calendar className="w-3 h-3 mr-1" />}
                              {status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                              Unrecorded
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex bg-slate-100 rounded-xl p-0.5 w-fit border border-slate-200/80">
                            <button
                              type="button"
                              onClick={() => markTeacherStatus(teacher._id, "Present")}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                status === "Present"
                                  ? "bg-emerald-800 text-white shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <UserCheck className="w-3 h-3" />
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => markTeacherStatus(teacher._id, "Absent")}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                status === "Absent"
                                  ? "bg-rose-700 text-white shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <UserX className="w-3 h-3" />
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => markTeacherStatus(teacher._id, "Leave")}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                status === "Leave"
                                  ? "bg-amber-600 text-white shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              Leave
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>

                {filteredTeacherRecords.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-16 text-center text-slate-400">
                      No matching faculty records found for selected date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}