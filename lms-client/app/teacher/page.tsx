"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatTime12Hour } from "@/lib/utils";
import {
  Calendar,
  Clock,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  GraduationCap,
  CalendarCheck
} from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Assignment {
  _id: string;
  classId: { _id: string; name: string };
  sectionId: { _id: string; name: string };
  subjectId: { _id: string; name: string };
  timeSlotId: {
    day: string;
    startTime: string;
    endTime: string;
  };
  originalTeacherId?: { fullName: string }; // For substitution
}

interface Stats {
  present: number;
  absent: number;
  leave: number;
  late: number;
  substitutions: number;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Late";
  markedBy?: { fullName?: string };
}

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayStatus, setTodayStatus] = useState<string>("Not Marked");
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyQuery = selectedMonth
          ? `/teacher-attendance?teacherId=${user?._id}&month=${selectedMonth}`
          : `/teacher-attendance?teacherId=${user?._id}&limit=5`;

        const [assignRes, statsRes, historyRes] = await Promise.all([
          api.get("/teacher/assignments"),
          api.get("/teacher-attendance/stats"),
          api.get(historyQuery),
        ]);

        setAssignments(assignRes.data);
        setStats(statsRes.data?.stats || null);
        setTodayStatus(statsRes.data?.todayStatus || "Not Marked");
        setHistory(historyRes.data || []);
      } catch (error) {
        console.error("Failed to fetch teacher dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) {
      fetchData();
    }
  }, [user?._id, selectedMonth]);

  // Filter for today's classes
  const todayClasses = assignments
    .filter((a) => a.timeSlotId && a.timeSlotId.day === todayDay)
    .sort((a, b) =>
      (a.timeSlotId.startTime || "").localeCompare(b.timeSlotId.startTime || "")
    );

  // Chart Data with Cambridge Emerald & Institutional Accents
  const chartData = stats
    ? [
        { name: "Present", value: stats.present, color: "#0F5132" },
        { name: "Absent / Leave", value: stats.absent + stats.leave, color: "#BE123C" },
        { name: "Substitutions", value: stats.substitutions, color: "#B45309" },
      ]
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Absent":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "Leave":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Late":
        return "bg-sky-50 text-sky-800 border-sky-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* EXECUTIVE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty Instruction Desk &bull; Session 2026–27</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome, {user?.fullName || "Faculty Member"}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Review your daily classroom schedule, attendance compliance, and active cohort assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs text-xs font-medium text-slate-700 w-fit">
          <Calendar className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* METRIC RIBBON (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Present This Month
            </span>
            <p className="text-2xl font-bold text-emerald-800 font-mono">
              {stats?.present || 0}{" "}
              <span className="text-xs font-normal text-slate-400">days</span>
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Verified check-in ledger
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Absences &amp; Leaves
            </span>
            <p className="text-2xl font-bold text-rose-700 font-mono">
              {(stats?.absent || 0) + (stats?.leave || 0)}{" "}
              <span className="text-xs font-normal text-slate-400">days</span>
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Documented exceptions
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Valid Substitutions
            </span>
            <p className="text-2xl font-bold text-amber-700 font-mono">
              {stats?.substitutions || 0}{" "}
              <span className="text-xs font-normal text-slate-400">sessions</span>
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Peer coverage duty
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-100">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Today&apos;s Class Load
            </span>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {todayClasses.length}{" "}
              <span className="text-xs font-normal text-slate-400">periods</span>
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Scheduled for {todayDay}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: TODAY'S TEACHING SCHEDULE (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Today&apos;s Classroom Timetable</h2>
                  <p className="text-[11px] text-slate-500">
                    Active academic periods allocated for {todayDay}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {todayClasses.length} {todayClasses.length === 1 ? "Class" : "Classes"} Today
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
                ))}
              </div>
            ) : todayClasses.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No Classroom Periods Scheduled Today</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your teaching timetable has no active classroom sessions allocated for this day.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayClasses.map((cls) => (
                  <div
                    key={cls._id}
                    className="group bg-slate-50/60 hover:bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-700/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Time and Details */}
                      <div className="flex items-start gap-4">
                        <div className="w-24 text-center shrink-0 pt-0.5">
                          <p className="font-bold font-mono text-slate-900 text-sm">
                            {formatTime12Hour(cls.timeSlotId.startTime)}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {formatTime12Hour(cls.timeSlotId.endTime)}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              Class {cls.classId.name} &bull; Section {cls.sectionId.name}
                            </span>
                            {cls.originalTeacherId ? (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                Substitution &bull; For: {cls.originalTeacherId.fullName}
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                {cls.subjectId.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            Academic Subject: <strong className="text-slate-700">{cls.subjectId.name}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Right: Action */}
                      <Link
                        href={`/teacher/attendance?classId=${cls.classId._id}&sectionId=${cls.sectionId._id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>Conduct Roll Call</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ATTENDANCE AUDIT & HISTORY (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* TODAY'S CHECK-IN STATUS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              My Attendance (Today)
            </h3>
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                todayStatus === "Present"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : todayStatus === "Not Marked"
                  ? "bg-slate-50 text-slate-700 border-slate-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              <div>
                <span className="text-sm font-bold block">{todayStatus}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {todayStatus === "Present"
                    ? "Verified institutional check-in"
                    : todayStatus === "Not Marked"
                    ? "Awaiting daily roll call"
                    : "Logged status"}
                </span>
              </div>
              {todayStatus === "Present" ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              ) : (
                <Clock className="w-6 h-6 text-slate-400" />
              )}
            </div>
          </div>

          {/* ATTENDANCE DONUT CHART */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Monthly Attendance Ratio</h3>
            <div className="h-56 w-full relative">
              {chartData.length > 0 && chartData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ zIndex: 50, fontSize: "11px" }} />
                    <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <PieIcon className="w-10 h-10 mb-2 opacity-20" />
                  <span>No Attendance Data Available</span>
                </div>
              )}

              {chartData.some((d) => d.value > 0) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-6">
                  <div className="text-center">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {chartData.reduce((a, b) => a + b.value, 0)}
                    </span>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                      Total Days
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ATTENDANCE AUDIT HISTORY */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Check-in Log</h3>
              <input
                id="historyMonth"
                name="historyMonth"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 focus:outline-none focus:border-emerald-700 bg-slate-50"
                aria-label="Filter History by Month"
              />
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1">
              {history.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-4">
                  No attendance records found for this period.
                </p>
              ) : (
                history.map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {new Date(record.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Marked by {record.markedBy?.fullName || "Administrative Audit"}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
