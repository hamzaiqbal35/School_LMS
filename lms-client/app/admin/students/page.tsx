"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Loader2,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Eye,
  GraduationCap,
  X,
  Filter,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  _id: string;
  registrationNumber: string;
  fullName: string;
  fatherName: string;
  status: string;
  classId?: { name: string };
  sectionId?: { name: string };
}

interface ReferenceData {
  _id: string;
  name: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [masterData, setMasterData] = useState<{
    classes: ReferenceData[];
    sections: ReferenceData[];
  }>({ classes: [], sections: [] });
  const [loading, setLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchInitialData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        api.get("/admin/students"),
        api.get("/admin/master-data"),
      ]);
      setStudents(sRes.data);
      setMasterData(mRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (selectedClass) params.append("classId", selectedClass);
      if (selectedSection) params.append("sectionId", selectedSection);
      if (statusFilter && statusFilter !== "All") params.append("status", statusFilter);

      const res = await api.get(`/admin/students?${params.toString()}`);
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedClass, selectedSection, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { y: 16, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Institutional Enrollment Ledger</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Student Directory
            </h1>
            {!loading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {students.length} {students.length === 1 ? "Scholar" : "Scholars"}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage student registrations, cohort placements, and official academic records.
          </p>
        </div>

        <Link
          href="/admin/students/create"
          className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Admit New Student</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="searchKeyword"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Search Registry
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="searchKeyword"
                name="searchKeyword"
                type="text"
                placeholder="Search by student name or roll ID (e.g. OGS-)..."
                className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor="filterClass"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Academic Class
            </label>
            <select
              id="filterClass"
              name="filterClass"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all appearance-none cursor-pointer"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Curriculum Classes</option>
              {masterData.classes.map((c: ReferenceData) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="filterSection"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Section
            </label>
            <select
              id="filterSection"
              name="filterSection"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all appearance-none cursor-pointer"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {masterData.sections.map((s: ReferenceData) => (
                <option key={s._id} value={s._id}>
                  Section {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="filterStatus"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Status
            </label>
            <select
              id="filterStatus"
              name="filterStatus"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="PassedOut">Passed Out</option>
              <option value="Expelled">Expelled</option>
            </select>
          </div>
        </form>
      </div>

      {/* Directory Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-3" />
            <p className="text-xs font-semibold">Loading enrollment directory...</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence>
                {students.map((student) => (
                  <motion.div
                    key={student._id}
                    variants={item}
                    className="group bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-emerald-700/50 hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === student._id ? null : student._id)
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === student._id && (
                          <>
                            <div
                              className="fixed inset-0 z-40 cursor-default"
                              onClick={() => setOpenMenuId(null)}
                            ></div>
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 overflow-hidden text-xs">
                              <Link
                                href={`/admin/students/${student._id}`}
                                className="flex items-center px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" /> View Record
                              </Link>
                              <Link
                                href={`/admin/students/${student._id}/edit`}
                                className="flex items-center px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-2 text-slate-400" /> Edit Record
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-3.5 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-sm font-bold font-mono-code text-emerald-900 shrink-0">
                          {student.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1 pr-6">
                          <h3
                            className="font-bold text-sm text-slate-900 truncate"
                            title={student.fullName}
                          >
                            {student.fullName}
                          </h3>
                          <p className="text-[11px] font-mono-code text-slate-500 mt-0.5">
                            {student.registrationNumber}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1.5 ${
                              student.status === "Active"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                                : "bg-rose-50 text-rose-700 border border-rose-200/60"
                            }`}
                          >
                            {student.status}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Class &amp; Section
                          </span>
                          <span className="text-slate-800 font-semibold bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded text-xs inline-block truncate max-w-full">
                            {student.classId?.name || "Unassigned"}{" "}
                            {student.sectionId?.name && `(${student.sectionId.name})`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Guardian / Father
                          </span>
                          <span
                            className="text-slate-700 font-medium truncate block mt-0.5 text-xs"
                            title={student.fatherName}
                          >
                            {student.fatherName || "Not Recorded"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {students.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-2xs text-slate-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No student records found</h3>
                <p className="text-xs text-slate-500 max-w-sm text-center mt-1">
                  Adjust your search keyword or selected class filters, or admit a new student into the cohort.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}