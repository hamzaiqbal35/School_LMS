"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  UserCheck,
  Users,
  BookOpen,
  Award,
  LayoutGrid,
  List,
  Phone,
  Calendar,
  ArrowRight,
  User as UserIcon,
  RotateCcw,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Student {
  _id: string;
  registrationNumber: string;
  fullName: string;
  fatherName: string;
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  bFormNumber?: string;
  admissionDate?: string;
  avatar?: string;
  status: string;
  classId?: { _id?: string; name: string };
  sectionId?: { _id?: string; name: string };
  campusId?: string;
}

interface ReferenceData {
  _id: string;
  name: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudentsRaw, setAllStudentsRaw] = useState<Student[]>([]);
  const [masterData, setMasterData] = useState<{
    classes: ReferenceData[];
    sections: ReferenceData[];
  }>({ classes: [], sections: [] });
  const [loading, setLoading] = useState(true);

  // View Mode: grid or ledger table
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filters
  const [keyword, setKeyword] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Admin Photo Upload State & Handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const triggerPhotoUpload = (studentId: string) => {
    setActiveStudentId(studentId);
    setOpenMenuId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeStudentId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading("Updating student photograph...");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await api.post("/upload/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const avatarUrl = res.data.url;

      await api.put(`/admin/students/${activeStudentId}/avatar`, {
        avatar: avatarUrl,
      });

      setStudents((prev) =>
        prev.map((s) => (s._id === activeStudentId ? { ...s, avatar: avatarUrl } : s))
      );
      setAllStudentsRaw((prev) =>
        prev.map((s) => (s._id === activeStudentId ? { ...s, avatar: avatarUrl } : s))
      );
      toast.success("Student profile photograph updated successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to update student photo:", error);
      toast.error("Failed to update student photograph.", { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
      setActiveStudentId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fetchInitialData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        api.get("/admin/students"),
        api.get("/admin/master-data"),
      ]);
      setAllStudentsRaw(sRes.data);
      setStudents(sRes.data.filter((s: Student) => s.status === "Active"));
      setMasterData(mRes.data);
    } catch (error) {
      console.error("Failed to load initial student data:", error);
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
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedClass, selectedSection, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleResetFilters = () => {
    setKeyword("");
    setSelectedClass("");
    setSelectedSection("");
    setStatusFilter("Active");
  };

  const isFiltered =
    keyword !== "" ||
    selectedClass !== "" ||
    selectedSection !== "" ||
    statusFilter !== "Active";

  // Executive Statistics Metrics
  const stats = useMemo(() => {
    const totalEnrolled = allStudentsRaw.length;
    const activeScholars = allStudentsRaw.filter((s) => s.status === "Active").length;
    const uniqueClasses = new Set(
      allStudentsRaw.map((s) => s.classId?.name).filter(Boolean)
    ).size;
    const recentAdmissions = allStudentsRaw.filter((s) => {
      if (!s.admissionDate) return false;
      const adm = new Date(s.admissionDate);
      const now = new Date();
      return (
        adm.getFullYear() === now.getFullYear() &&
        now.getMonth() - adm.getMonth() <= 3
      );
    }).length;

    return {
      totalEnrolled,
      activeScholars,
      uniqueClasses: uniqueClasses || masterData.classes.length,
      recentAdmissions,
    };
  }, [allStudentsRaw, masterData.classes.length]);

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
    hidden: { y: 14, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-12">
      {/* Hidden File Input for Admin Direct Student Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        id="adminDirectoryStudentPhotoInput"
      />

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {students.length} {students.length === 1 ? "Scholar" : "Scholars"}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage student registrations, cohort placements, and official academic records.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-emerald-900 shadow-2xs font-bold"
                  : "hover:text-slate-900"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-emerald-900 shadow-2xs font-bold"
                  : "hover:text-slate-900"
              }`}
              title="Ledger Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ledger</span>
            </button>
          </div>

          <Link
            href="/admin/students/create"
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Admit New Student</span>
          </Link>
        </div>
      </div>

      {/* EXECUTIVE ROSTER METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Total Enrolled Scholars
            </span>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {stats.totalEnrolled}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Official roster archive
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Active Attendance Standing
            </span>
            <p className="text-2xl font-bold text-emerald-700 font-mono">
              {stats.activeScholars}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              In good academic standing
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Academic Cohorts
            </span>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {stats.uniqueClasses}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Active curriculum grades
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Current Academic Year
            </span>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              2026–27
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Cambridge &amp; Matric Term
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & REGISTRY SEARCH CONTROL BAR */}
      <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          <div className="md:col-span-4">
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
                placeholder="Search by student name or roll ID (e.g. Reg-1234)..."
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

          <div className="md:col-span-1 flex items-end">
            {isFiltered ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="sr-only sm:not-sr-only md:sr-only lg:not-sr-only">Reset</span>
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer"
                title="Apply Filter"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* DIRECTORY DISPLAY AREA */}
      <div className="min-h-[420px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-3" />
            <p className="text-xs font-semibold">Loading enrollment directory...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 shadow-2xs text-emerald-800">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No student records found</h3>
            <p className="text-xs text-slate-500 max-w-sm text-center mt-1">
              Adjust your search keyword or selected class filters, or admit a new student into the cohort.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Applied Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW: INSTITUTIONAL SCHOLAR CARDS */
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {students.map((student) => (
                <motion.div
                  key={student._id}
                  variants={item}
                  className="group bg-white rounded-2xl shadow-xs border border-slate-200 hover:shadow-md hover:border-emerald-700/50 transition-all duration-200 flex flex-col relative overflow-hidden"
                >
                  {/* Top Institutional Header Banner (Oxford Navy) */}
                  <div className="h-16 bg-slate-950 relative border-b border-slate-800 flex items-center justify-end px-4 gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                      {student.classId?.name || "General"}
                      {student.sectionId?.name ? ` • Sec ${student.sectionId.name}` : ""}
                    </span>

                    {/* Quick Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === student._id ? null : student._id)
                        }
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
                              <Pencil className="w-3.5 h-3.5 mr-2 text-slate-400" /> Edit Profile
                            </Link>
                            <button
                              type="button"
                              onClick={() => triggerPhotoUpload(student._id)}
                              className="w-full flex items-center px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium text-left cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 mr-2 text-slate-400" /> Update Photo
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="px-5 pt-0 pb-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Avatar Medallion and Status Tag */}
                      <div className="flex items-end justify-between -mt-8 mb-3.5">
                        <div
                          onClick={() => !isUploadingPhoto && triggerPhotoUpload(student._id)}
                          className="relative group w-16 h-16 rounded-2xl bg-white p-1 shadow-md border-2 border-emerald-700/20 hover:border-emerald-500 overflow-hidden shrink-0 flex items-center justify-center font-bold text-2xl font-mono text-emerald-950 bg-emerald-50/60 select-none cursor-pointer transition-all"
                          title="Click to update student photograph"
                        >
                          {isUploadingPhoto && activeStudentId === student._id ? (
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-800" />
                          ) : student.avatar ? (
                            <Image
                              src={student.avatar}
                              alt={student.fullName}
                              fill
                              sizes="64px"
                              className="object-cover rounded-xl"
                            />
                          ) : (
                            student.fullName ? student.fullName.charAt(0).toUpperCase() : "S"
                          )}

                          {/* Camera Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Camera className="w-4 h-4 text-emerald-300" />
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            student.status === "Active"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : student.status === "Inactive"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {student.status || "Active"}
                        </span>
                      </div>

                      {/* Student Identity */}
                      <Link
                        href={`/admin/students/${student._id}`}
                        className="block group-hover:text-emerald-900 transition-colors"
                      >
                        <h3 className="font-bold text-base text-slate-900 truncate" title={student.fullName}>
                          {student.fullName}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded">
                          Reg: {student.registrationNumber}
                        </span>
                        {student.gender && (
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            &bull; {student.gender}
                          </span>
                        )}
                      </div>

                      {/* Structured Details Matrix */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>Father / Guardian:</span>
                          </span>
                          <span className="font-semibold text-slate-800 truncate max-w-[140px]" title={student.fatherName}>
                            {student.fatherName || "Not Recorded"}
                          </span>
                        </div>

                        {student.phoneNumber && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>Contact Phone:</span>
                            </span>
                            <span className="font-mono text-slate-700 font-medium">
                              {student.phoneNumber}
                            </span>
                          </div>
                        )}

                        {student.admissionDate && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Enrolled:</span>
                            </span>
                            <span className="text-slate-600 text-[11px]">
                              {new Date(student.admissionDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        href={`/admin/students/${student._id}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                      </Link>

                      <Link
                        href={`/admin/students/${student._id}/edit`}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                        title="Edit Student Record"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* TABLE / LEDGER VIEW: HIGH-DENSITY ROSTER */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Enrolled Scholar</th>
                    <th className="px-5 py-3.5">Registration ID</th>
                    <th className="px-5 py-3.5">Academic Cohort</th>
                    <th className="px-5 py-3.5">Guardian / Father</th>
                    <th className="px-5 py-3.5">Contact Phone</th>
                    <th className="px-5 py-3.5">Enrollment Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => !isUploadingPhoto && triggerPhotoUpload(student._id)}
                            className="relative group w-9 h-9 rounded-xl bg-emerald-50 text-emerald-950 font-bold font-mono flex items-center justify-center text-sm border border-emerald-200/80 hover:border-emerald-600 shrink-0 overflow-hidden cursor-pointer select-none transition-all"
                            title="Click to update student photograph"
                          >
                            {isUploadingPhoto && activeStudentId === student._id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-800" />
                            ) : student.avatar ? (
                              <Image
                                src={student.avatar}
                                alt={student.fullName}
                                fill
                                sizes="36px"
                                className="object-cover rounded-xl"
                              />
                            ) : (
                              student.fullName ? student.fullName.charAt(0).toUpperCase() : "S"
                            )}
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Camera className="w-3.5 h-3.5 text-emerald-300" />
                            </div>
                          </div>
                          <div>
                            <Link
                              href={`/admin/students/${student._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-800 transition-colors block text-xs"
                            >
                              {student.fullName}
                            </Link>
                            {student.gender && (
                              <span className="text-[10px] text-slate-400">
                                {student.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3 font-mono text-slate-700 font-semibold">
                        {student.registrationNumber}
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                          {student.classId?.name || "General"}
                          {student.sectionId?.name ? ` • Sec ${student.sectionId.name}` : ""}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-slate-700 font-medium">
                        {student.fatherName || "Not Recorded"}
                      </td>

                      <td className="px-5 py-3 font-mono text-slate-600">
                        {student.phoneNumber || "-"}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            student.status === "Active"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : student.status === "Inactive"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {student.status || "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/students/${student._id}`}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 transition-colors"
                            title="View Full Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/students/${student._id}/edit`}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 transition-colors"
                            title="Edit Student Record"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => triggerPhotoUpload(student._id)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 transition-colors cursor-pointer"
                            title="Update Photograph"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
