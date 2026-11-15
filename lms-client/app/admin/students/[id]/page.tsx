"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Pencil,
  FileText,
  CreditCard,
  CalendarCheck,
  CheckCircle2,
  Hash,
  Camera
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  _id: string;
  fullName: string;
  registrationNumber: string;
  status: string;
  admissionDate?: string;
  fatherName: string;
  gender: string;
  classId?: { _id?: string; name: string };
  sectionId?: { _id?: string; name: string };
  campusId?: string;
  dob?: string;
  phoneNumber?: string;
  bFormNumber?: string;
  fatherCnic?: string;
  cast?: string;
  religion?: string;
  monthlyFee?: number;
  discountAmount?: number;
  isAdmissionPaid?: boolean;
  avatar?: string;
}

interface Fee {
  _id: string;
  month: string;
  totalAmount: number;
  status: string;
  paymentDate?: string;
}

interface Attendance {
  _id: string;
  date: string;
  status: string;
  markedBy?: { fullName?: string; role?: string };
}

export default function StudentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [classFee, setClassFee] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fee Filters
  const [feeFilter, setFeeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  // Attendance State
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [attMonth, setAttMonth] = useState(new Date().getMonth() + 1);
  const [attYear, setAttYear] = useState(new Date().getFullYear());
  const [attLoading, setAttLoading] = useState(false);

  // Extract unique years from fees
  const availableYears = [
    ...new Set(fees.map((f) => f.month?.split("-")[0]).filter(Boolean)),
  ]
    .sort()
    .reverse();

  const fetchData = useCallback(async () => {
    try {
      const [studentRes, feesRes] = await Promise.all([
        api.get(`/admin/students/${resolvedParams.id}`),
        api.get(`/fees?studentId=${resolvedParams.id}`),
      ]);
      const s: Student = studentRes.data;
      setStudent(s);
      setFees(feesRes.data);

      if (s.classId?._id) {
        try {
          const feeRes = await api.get(`/fees/structures/${s.classId._id}`);
          setClassFee(feeRes.data?.monthlyTuition || 0);
        } catch {
          setClassFee(0);
        }
      }
    } catch (error) {
      console.error("Failed to load student record:", error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    if (resolvedParams.id) {
      fetchData();
    }
  }, [resolvedParams.id, fetchData]);

  // Fetch Attendance
  useEffect(() => {
    if (!resolvedParams.id) return;
    setAttLoading(true);
    api
      .get(
        `/attendance?studentId=${resolvedParams.id}&month=${attMonth}&year=${attYear}`
      )
      .then((res) => setAttendance(res.data))
      .catch((err) => console.error(err))
      .finally(() => setAttLoading(false));
  }, [resolvedParams.id, attMonth, attYear]);

  // Admin Single-Click Photo Upload & Update Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading("Updating student profile photograph...");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      // 1. Upload to Cloudinary
      const res = await api.post("/upload/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const avatarUrl = res.data.url;

      // 2. Persist to Student record via Admin Route
      await api.put(`/admin/students/${student._id}/avatar`, {
        avatar: avatarUrl,
      });

      // 3. Update local state
      setStudent((prev) => (prev ? { ...prev, avatar: avatarUrl } : prev));
      toast.success("Student profile photograph updated successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to update student photo:", error);
      toast.error("Failed to update student photograph. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-2" />
        <p className="text-xs font-semibold">Loading student record...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-600 mb-4">
          Student record not found.
        </p>
        <button
          onClick={() => router.push("/admin/students")}
          className="px-5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
        >
          Return to Student Directory
        </button>
      </div>
    );
  }

  const netPayable = Math.max(0, classFee - (student.discountAmount || 0));

  const filteredFees = fees.filter(
    (f) =>
      (feeFilter === "All" || f.status === feeFilter) &&
      (yearFilter === "All" || f.month?.startsWith(yearFilter))
  );

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;
  const leaveCount = attendance.filter((a) => a.status === "Leave").length;
  const lateCount = attendance.filter((a) => a.status === "Late").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* TOP BREADCRUMB & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/students")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-800" />
          <span>Back to Student Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-slate-400 font-mono">
            ID: {student._id.slice(-6).toUpperCase()}
          </div>
          <Link
            href={`/admin/students/${student._id}/edit`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-emerald-950 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-emerald-800" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* EXECUTIVE STUDENT HERO BANNER (OXFORD NAVY) */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
        {/* Hidden File Input for Admin Direct Photo Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          id="adminStudentPhotoInput"
        />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar Monogram Medallion with Admin Direct Upload */}
          <div className="relative group shrink-0">
            <div
              onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white p-1 shadow-xl border-2 border-emerald-500/30 relative overflow-hidden flex items-center justify-center font-mono select-none cursor-pointer group-hover:border-emerald-400 transition-all"
              title="Click to update student profile picture"
            >
              {isUploadingPhoto ? (
                <div className="flex flex-col items-center justify-center text-slate-500 p-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-800 mb-1" />
                  <span className="text-[10px] font-sans font-semibold">Updating...</span>
                </div>
              ) : student.avatar ? (
                <Image
                  src={student.avatar}
                  alt={student.fullName}
                  fill
                  sizes="112px"
                  className="object-cover rounded-xl"
                  priority
                />
              ) : (
                <span className="text-emerald-950 font-bold text-4xl">
                  {student.fullName ? student.fullName.charAt(0).toUpperCase() : "S"}
                </span>
              )}

              {/* Hover Camera Overlay for Admin */}
              <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Camera className="w-6 h-6 text-emerald-300 mb-1" />
                <span className="text-[10px] font-sans font-bold">Update Photo</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl shadow-lg border-2 border-slate-950 transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
              title="Update Photograph"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Identity & Institutional Metadata */}
          <div className="flex-1 text-center md:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/90 border border-emerald-800/60 px-3 py-0.5 rounded-full">
                Enrolled Scholar
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full ${
                  student.status === "Active"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : student.status === "Inactive"
                    ? "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {student.status || "Active"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              {student.fullName}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 font-mono">
                <Hash className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reg: {student.registrationNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {student.classId?.name || "General"}
                  {student.sectionId?.name ? ` &bull; Section ${student.sectionId.name}` : ""}
                </span>
              </div>
              {student.admissionDate && (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Admitted:{" "}
                    {new Date(student.admissionDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      </div>

      {/* FINANCIAL SUMMARY METRICS RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Standard Tuition
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
            Rs {classFee.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Class syllabus rate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Scholarship / Discount
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">
            Rs {(student.discountAmount || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Institutional aid</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Net Monthly Payable
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
            Rs {netPayable.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Net billing amount</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Admission Fee Status
            </span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  student.isAdmissionPaid
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {student.isAdmissionPaid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Paid</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pending</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Registration clearance</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PERSONAL & ACADEMIC DOSSIER (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Student Dossier</h3>
                <p className="text-[11px] text-slate-500">
                  Personal, family, and enrollment records
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Father / Guardian
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {student.fatherName || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Gender
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {student.gender || "N/A"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Academic Placement
                </span>
                <span className="font-semibold text-slate-900 text-xs">
                  {student.classId?.name || "Unassigned"} - Section {student.sectionId?.name || "A"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Date of Birth
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {student.dob
                      ? new Date(student.dob).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Contact Phone
                  </span>
                  <span className="font-semibold text-slate-900 text-xs font-mono">
                    {student.phoneNumber || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    B-Form No.
                  </span>
                  <span className="font-semibold text-slate-900 text-xs font-mono">
                    {student.bFormNumber || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Father CNIC
                  </span>
                  <span className="font-semibold text-slate-900 text-xs font-mono">
                    {student.fatherCnic || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Cast
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {student.cast || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Religion
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {student.religion || "N/A"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Campus / Branch
                </span>
                <span className="font-semibold text-slate-900 text-xs">
                  {student.campusId || "Main Campus"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FEE LEDGER & ATTENDANCE AUDIT (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* FEE INVOICES & PAYMENT HISTORY */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Fee Invoices &amp; Ledger</h3>
                  <p className="text-[11px] text-slate-500">Issued challans and settlement history</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  id="feeYearFilter"
                  name="feeYearFilter"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50 text-slate-700"
                >
                  <option value="All">All Years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  id="feeStatusFilter"
                  name="feeStatusFilter"
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50 text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            {filteredFees.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Billing Month</th>
                      <th className="px-4 py-2.5">Challan Amount</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Settlement Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFees.map((fee) => (
                      <tr key={fee._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-900 font-mono">
                          {fee.month}
                        </td>
                        <td className="px-4 py-2.5 font-bold font-mono text-slate-900">
                          Rs {fee.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              fee.status === "Paid"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : fee.status === "Pending"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                          {fee.status === "Paid" && fee.paymentDate
                            ? new Date(fee.paymentDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs">
                <p>No fee records found for the selected filters.</p>
              </div>
            )}
          </div>

          {/* ATTENDANCE AUDIT LOG */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Attendance Audit Log</h3>
                  <p className="text-[11px] text-slate-500">
                    Roll call record by month and academic year
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  id="attendanceMonthFilter"
                  name="attendanceMonthFilter"
                  value={attMonth}
                  onChange={(e) => setAttMonth(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50 text-slate-700"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString("default", { month: "short" })}
                    </option>
                  ))}
                </select>

                <select
                  id="attendanceYearFilter"
                  name="attendanceYearFilter"
                  value={attYear}
                  onChange={(e) => setAttYear(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50 text-slate-700"
                >
                  {availableYears.length > 0 ? (
                    availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))
                  ) : (
                    <option value={new Date().getFullYear()}>
                      {new Date().getFullYear()}
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Attendance Summary Ribbon */}
            {!attLoading && attendance.length > 0 && (
              <div className="grid grid-cols-4 gap-2.5 mb-4">
                <div className="bg-emerald-50/70 p-2.5 rounded-xl text-center border border-emerald-200/60">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Present
                  </div>
                  <div className="text-base font-bold text-emerald-900 font-mono mt-0.5">
                    {presentCount}
                  </div>
                </div>
                <div className="bg-rose-50/70 p-2.5 rounded-xl text-center border border-rose-200/60">
                  <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                    Absent
                  </div>
                  <div className="text-base font-bold text-rose-900 font-mono mt-0.5">
                    {absentCount}
                  </div>
                </div>
                <div className="bg-amber-50/70 p-2.5 rounded-xl text-center border border-amber-200/60">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Leave
                  </div>
                  <div className="text-base font-bold text-amber-900 font-mono mt-0.5">
                    {leaveCount}
                  </div>
                </div>
                <div className="bg-sky-50/70 p-2.5 rounded-xl text-center border border-sky-200/60">
                  <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                    Late
                  </div>
                  <div className="text-base font-bold text-sky-900 font-mono mt-0.5">
                    {lateCount}
                  </div>
                </div>
              </div>
            )}

            {attLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-800 mx-auto" />
              </div>
            ) : attendance.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-2 font-medium text-slate-900">
                          {new Date(record.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-2">
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
                        <td className="px-4 py-2 text-slate-500 text-[11px]">
                          {record.markedBy?.role === "ADMIN"
                            ? "Administration"
                            : record.markedBy?.fullName || "Class Teacher"}
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
