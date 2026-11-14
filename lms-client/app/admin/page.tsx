"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Users,
  BookOpen,
  Receipt,
  CalendarCheck,
  ArrowUpRight,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import FeesDonutChart from "@/components/dashboard/FeesDonutChart";
import AttendanceGraph from "@/components/dashboard/AttendanceGraph";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    pendingFees: 0,
    attendancePercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard/stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { y: 16, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 font-sans"
    >
      {/* ========================================================
          EXECUTIVE HERO BANNER
      ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-7 md:p-9 border border-slate-800 shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[11px] font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Oxford Academic Governance &bull; Session 2026–2027</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2.5">
              Welcome back,{" "}
              <span className="text-emerald-400">
                {user?.fullName || "Administrator"}
              </span>
            </h1>

            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Consolidated institutional overview for Oxford Grammar &amp; Cambridge EdTech School.
              Daily student attendance, timetable substitution sync, and verified bank challans.
            </p>
          </div>

          {/* Date & Campus Pill */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Operations
              </div>
              <div className="text-xs font-semibold text-white">
                {currentDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          KPI METRICS GRID (SPOTLIGHT CARDS)
      ======================================================== */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Students */}
        <motion.div variants={item}>
          <SpotlightCard
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-full"
            spotlightColor="rgba(15, 81, 50, 0.08)"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" /> Active Roster
                </span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Enrolled Students
              </span>
              <div className="mt-2">
                {loading ? (
                  <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg"></div>
                ) : (
                  <div className="text-3xl font-extrabold text-slate-900 font-mono-code">
                    <CountUp to={stats.students} duration={1.2} />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Class 1 through O-2</span>
              <Link href="/admin/students" className="font-semibold text-emerald-800 hover:underline flex items-center gap-0.5">
                Directory &rarr;
              </Link>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Metric 2: Teachers */}
        <motion.div variants={item}>
          <SpotlightCard
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-full"
            spotlightColor="rgba(30, 41, 59, 0.08)"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-800">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                  Verified Faculty
                </span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Academic Staff &amp; Faculty
              </span>
              <div className="mt-2">
                {loading ? (
                  <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-lg"></div>
                ) : (
                  <div className="text-3xl font-extrabold text-slate-900 font-mono-code">
                    <CountUp to={stats.teachers} duration={1.2} />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>All departments assigned</span>
              <Link href="/admin/teachers" className="font-semibold text-indigo-900 hover:underline flex items-center gap-0.5">
                Faculty Roster &rarr;
              </Link>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Metric 3: Pending Fees */}
        <motion.div variants={item}>
          <SpotlightCard
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-full"
            spotlightColor="rgba(217, 119, 6, 0.08)"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                  Unreconciled
                </span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pending Fee Challans
              </span>
              <div className="mt-2">
                {loading ? (
                  <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-lg"></div>
                ) : (
                  <div
                    className="text-2xl font-extrabold text-slate-900 font-mono-code truncate"
                    title={formatCurrency(stats.pendingFees)}
                  >
                    {formatCurrency(stats.pendingFees)}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>3-Part Bank Challans</span>
              <Link href="/admin/fees" className="font-semibold text-amber-900 hover:underline flex items-center gap-0.5">
                Ledger &rarr;
              </Link>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Metric 4: Daily Attendance */}
        <motion.div variants={item}>
          <SpotlightCard
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-full"
            spotlightColor="rgba(15, 81, 50, 0.08)"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  Today&apos;s Roll Call
                </span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Overall Attendance Rate
              </span>
              <div className="mt-2">
                {loading ? (
                  <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-lg"></div>
                ) : (
                  <div className="text-3xl font-extrabold text-slate-900 font-mono-code">
                    <CountUp to={stats.attendancePercentage} duration={1.2} />%
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Audit compliance locked</span>
              <Link href="/admin/attendance" className="font-semibold text-emerald-800 hover:underline flex items-center gap-0.5">
                Attendance &rarr;
              </Link>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* ========================================================
          ANALYTICS GRIDS (ATTENDANCE & FINANCE)
      ======================================================== */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Attendance Chart - 3 Columns */}
        <motion.div variants={item} className="lg:col-span-3">
          <AttendanceGraph />
        </motion.div>

        {/* Fees Distribution - 1 Column */}
        <motion.div variants={item} className="lg:col-span-1">
          <FeesDonutChart />
        </motion.div>
      </div>

      {/* ========================================================
          INSTITUTIONAL QUICK ACTIONS
      ======================================================== */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-4 bg-emerald-700 rounded-full"></span>
              Institutional Quick Actions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rapid access to essential administrative tasks and records
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Admin Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/students/create"
            className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-emerald-700/60 hover:bg-emerald-50/40 transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900 truncate">
                Admit New Student
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                Generate registration ID
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
          </Link>

          <Link
            href="/admin/classes"
            className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-indigo-700/60 hover:bg-indigo-50/40 transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-950 truncate">
                Curriculum Structure
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                Classes, sections &amp; fees
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 transition-colors" />
          </Link>

          <Link
            href="/admin/fees"
            className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-amber-700/60 hover:bg-amber-50/40 transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 group-hover:text-amber-950 truncate">
                Generate Fee Challans
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                Monthly tuition batch
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
          </Link>

          <Link
            href="/admin/substitution"
            className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-emerald-700/60 hover:bg-emerald-50/40 transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-950 truncate">
                Faculty Substitution
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                Cover unattended periods
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
