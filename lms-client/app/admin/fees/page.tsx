"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import {
  Loader2,
  Plus,
  Download,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  ChevronDown,
  RefreshCw,
  X,
  Trash2,
  Eye,
  Receipt,
  CreditCard,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Student {
  _id: string;
  fullName: string;
  registrationNumber: string;
  status: string;
}
interface Class {
  _id: string;
  name: string;
}

interface Challan {
  _id: string;
  challanNumber: string;
  studentId: Student;
  month: string;
  totalAmount: number;
  status: string;
  pdfUrl?: string;
  dueDate?: string;
  // Breakdown
  admissionFee: number;
  tuitionFee: number;
  examFee: number;
  miscCharges: number;
  lateFee: number;
  discount: number;
  // Verification
  paymentReference?: string;
  paymentDate?: string;
  verificationNote?: string;
}

export default function FeesPage() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  // Generation Modal State
  const [showGen, setShowGen] = useState(false);
  const [genData, setGenData] = useState({
    month: "",
    dueDate: "",
    studentIds: [] as string[],
    includeExamFee: false,
    includeMisc: false,
  });
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [generating, setGenerating] = useState(false);

  const [classes, setClasses] = useState<Class[]>([]);
  const [filters, setFilters] = useState({ search: "", classId: "", month: "" });

  // Verify Modal State
  const [verifyId, setVerifyId] = useState("");
  const [verifyData, setVerifyData] = useState({
    paymentReference: "",
    paymentDate: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [verifying, setVerifying] = useState(false);

  // View Modal State
  const [viewChallan, setViewChallan] = useState<Challan | null>(null);

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filters.search) params.append("search", filters.search);
      if (filters.classId) params.append("classId", filters.classId);
      if (filters.month) params.append("month", filters.month);

      const res = await api.get(`/fees?${params.toString()}`);
      setChallans(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load fee ledger.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filters]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get("/admin/students?status=Active"),
        api.get("/admin/classes"),
      ]);
      setAllStudents(studentsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchChallans();
    fetchDropdowns();
  }, [fetchChallans, fetchDropdowns]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const ids = genData.studentIds.length > 0 ? genData.studentIds : allStudents.map((s) => s._id);

      const res = await api.post("/fees/generate", {
        month: genData.month,
        dueDate: genData.dueDate,
        studentIds: ids,
        includeExamFee: genData.includeExamFee,
        includeMisc: genData.includeMisc,
      });

      const { successCount, errorCount, errors } = res.data;

      if (successCount > 0) {
        fetchChallans();
      }

      setShowGen(false);

      if (errorCount === 0) {
        toast.success(`Successfully generated ${successCount} verified challans.`);
      } else if (successCount > 0) {
        toast.warning(
          `Generated ${successCount} challans. ${errorCount} failed: ${errors[0]?.error || ""}`
        );
      } else {
        toast.error(`Generation failed: ${errors[0]?.error || "Unknown server error"}`);
      }
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to generate fee challans.");
    } finally {
      setGenerating(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await api.post(`/fees/verify/${verifyId}`, { ...verifyData, status: "Paid" });
      toast.success("Bank payment reconciled and marked as Paid.");
      setVerifyId("");
      fetchChallans();
    } catch {
      toast.error("Bank payment verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async (id: string, challanNo: string) => {
    if (!confirm(`Are you sure you want to delete challan ${challanNo}?`)) return;
    try {
      await api.delete(`/fees/${id}`);
      toast.success(`Challan ${challanNo} removed.`);
      fetchChallans();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete challan.");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const item = {
    hidden: { y: 14, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const totalRevenue = challans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const collectedRevenue = challans
    .filter((c) => c.status === "Paid")
    .reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const pendingRevenue = challans
    .filter((c) => c.status === "Pending" || c.status === "Overdue")
    .reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
            <Receipt className="w-3.5 h-3.5" />
            <span>Bank Fee Reconciliation Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Institutional Fee &amp; Challan Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Standardized triple-copy bank challans, QR transaction audit, and payment reconciliation.
          </p>
        </div>

        <button
          onClick={() => setShowGen(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Challan Batch</span>
        </button>
      </div>

      {/* Summary KPI Ribbon */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Issued Challans
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono-code">{challans.length}</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-700">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Billed
              </span>
            </div>
            <p className="text-xl font-black text-slate-900 font-mono-code truncate">
              PKR {totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Reconciled (Paid)
              </span>
            </div>
            <p className="text-xl font-black text-emerald-800 font-mono-code truncate">
              PKR {collectedRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-800">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Outstanding Dues
              </span>
            </div>
            <p className="text-xl font-black text-amber-800 font-mono-code truncate">
              PKR {pendingRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="searchChallans"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Search Transactions
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                id="searchChallans"
                name="searchChallans"
                type="text"
                placeholder="Search by student name, roll ID or challan #..."
                className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div className="md:col-span-3">
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
                className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none appearance-none bg-white transition-all cursor-pointer"
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
              >
                <option value="">All Academic Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="filterMonth"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Billing Month
            </label>
            <input
              id="filterMonth"
              name="filterMonth"
              type="month"
              placeholder="YYYY-MM"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => {
                setFilters({ search: "", classId: "", month: "" });
                setFilterStatus("");
                fetchChallans();
              }}
              className="w-full py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
          {["", "Pending", "Paid", "Overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                filterStatus === status
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-2xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {status || "All Statuses"}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin text-emerald-800 w-8 h-8 mb-3" />
            <p className="text-xs font-semibold">Synchronizing banking ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Challan Number
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Student Scholar
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Due Date
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Payable Amount
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show" className="divide-y divide-slate-100 bg-white">
                <AnimatePresence>
                  {challans.map((c) => (
                    <motion.tr key={c._id} variants={item} className="group hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-center text-emerald-800 shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-mono-code text-xs font-bold text-slate-900">
                              {c.challanNumber}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Billing: {c.month}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs">
                          {c.studentId?.fullName}
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono-code bg-slate-100 text-slate-600 mt-0.5">
                          {c.studentId?.registrationNumber}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono-code text-[11px]">
                        {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : "N/A"}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-black font-mono-code text-slate-900">
                          PKR {c.totalAmount.toLocaleString()}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            c.status === "Paid"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : c.status === "Pending"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {c.status === "Paid" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {c.status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                          {c.status === "Overdue" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {c.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {c.status === "Paid" && (
                            <button
                              type="button"
                              onClick={() => setViewChallan(c)}
                              className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="View Breakdown Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {(c.pdfUrl || c.status !== "Pending") && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/fees/download/${c._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Download Bank Copy PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          {c.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setVerifyId(c._id)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors border border-emerald-200/80 cursor-pointer"
                              >
                                Reconcile
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(c._id, c.challanNumber)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Challan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {challans.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                          <Receipt className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="font-bold text-slate-800 text-xs">No fee challans found</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Generate a new challan batch or adjust search filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generation Modal */}
      <AnimatePresence>
        {showGen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1">
                    <Building2 className="w-3 h-3 text-emerald-700" />
                    Triple-Copy Bank Issuance
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Generate Batch Fee Challans
                  </h3>
                </div>
                <button
                  onClick={() => setShowGen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <label
                      htmlFor="genStudent"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Target Student Scholar
                    </label>
                    <div className="relative">
                      <select
                        id="genStudent"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none appearance-none bg-white cursor-pointer"
                        value={genData.studentIds[0] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGenData({
                            ...genData,
                            studentIds: val ? [val] : [],
                          });
                        }}
                      >
                        <option value="">All Enrolled Active Scholars ({allStudents.length})</option>
                        {allStudents.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.fullName} &bull; {s.registrationNumber}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="genMonth"
                        className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Billing Month
                      </label>
                      <input
                        id="genMonth"
                        name="genMonth"
                        type="month"
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono-code focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                        value={genData.month}
                        onChange={(e) => setGenData({ ...genData, month: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="genDueDate"
                        className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Bank Due Date
                      </label>
                      <input
                        id="genDueDate"
                        name="genDueDate"
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono-code focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                        value={genData.dueDate}
                        onChange={(e) => setGenData({ ...genData, dueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl space-y-2.5 border border-slate-200/80 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        id="includeExamFee"
                        name="includeExamFee"
                        checked={genData.includeExamFee}
                        onChange={(e) =>
                          setGenData({ ...genData, includeExamFee: e.target.checked })
                        }
                        className="rounded text-emerald-800 focus:ring-emerald-700 w-3.5 h-3.5 border-slate-300 accent-emerald-800"
                      />
                      <span className="font-semibold text-slate-800">Include Term Exam Assessment Fee</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        id="includeMisc"
                        name="includeMisc"
                        checked={genData.includeMisc}
                        onChange={(e) =>
                          setGenData({ ...genData, includeMisc: e.target.checked })
                        }
                        className="rounded text-emerald-800 focus:ring-emerald-700 w-3.5 h-3.5 border-slate-300 accent-emerald-800"
                      />
                      <span className="font-semibold text-slate-800">Include Laboratory &amp; Misc Dues</span>
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowGen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={generating}
                      className="px-5 py-2 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 font-bold text-xs shadow-xs disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                      {generating ? (
                        <Loader2 className="animate-spin w-4 h-4 text-emerald-200" />
                      ) : (
                        "Issue Challan Batch"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verification Modal */}
      <AnimatePresence>
        {verifyId && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 bg-slate-50/80 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Reconcile Bank Payment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm receipt of funds against official bank challan
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label
                      htmlFor="payRef"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Bank Transaction ID / Reference
                    </label>
                    <input
                      id="payRef"
                      name="payRef"
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono-code focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                      value={verifyData.paymentReference}
                      onChange={(e) =>
                        setVerifyData({ ...verifyData, paymentReference: e.target.value })
                      }
                      placeholder="e.g. HBL-DEP-993810"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="payDate"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Deposit Date
                    </label>
                    <input
                      id="payDate"
                      name="payDate"
                      type="date"
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono-code focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                      value={verifyData.paymentDate}
                      onChange={(e) =>
                        setVerifyData({ ...verifyData, paymentDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="payNote"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Audit Note (Optional)
                    </label>
                    <textarea
                      id="payNote"
                      name="payNote"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none min-h-[70px]"
                      value={verifyData.note}
                      onChange={(e) => setVerifyData({ ...verifyData, note: e.target.value })}
                      placeholder="e.g. Verified via Habib Bank campus counter slip"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setVerifyId("")}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verifying}
                      className="px-5 py-2 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      {verifying ? <Loader2 className="animate-spin w-4 h-4" /> : "Reconcile as Paid"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewChallan && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1 inline-block">
                    Official Fee Breakdown
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Challan #{viewChallan.challanNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setViewChallan(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs">
                {/* Scholar Meta */}
                <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-xl flex items-center justify-center font-bold font-mono-code text-sm">
                    {viewChallan.studentId.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{viewChallan.studentId.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono-code">
                      {viewChallan.studentId.registrationNumber}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Month
                    </span>
                    <span className="font-bold text-slate-900 font-mono-code">
                      {viewChallan.month}
                    </span>
                  </div>
                </div>

                {/* Breakdown items */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Itemized Components
                  </h4>
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Monthly Tuition Fee</span>
                      <span className="font-bold font-mono-code text-slate-900">
                        PKR {viewChallan.tuitionFee?.toLocaleString()}
                      </span>
                    </div>
                    {viewChallan.admissionFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Admission Fee</span>
                        <span className="font-bold font-mono-code text-slate-900">
                          PKR {viewChallan.admissionFee?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {viewChallan.examFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Term Assessment / Exam</span>
                        <span className="font-bold font-mono-code text-slate-900">
                          PKR {viewChallan.examFee?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {viewChallan.miscCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Laboratory &amp; Robotics Dues</span>
                        <span className="font-bold font-mono-code text-slate-900">
                          PKR {viewChallan.miscCharges?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-900">Total Challan Amount</span>
                      <span className="font-black font-mono-code text-emerald-800">
                        PKR {viewChallan.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Verification Audit */}
                {viewChallan.paymentReference && (
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 mb-1">
                      Bank Reconciled Verification
                    </div>
                    <div className="font-mono-code text-xs font-bold text-emerald-950">
                      Ref: {viewChallan.paymentReference}
                    </div>
                    {viewChallan.paymentDate && (
                      <div className="text-[11px] text-emerald-800 mt-0.5">
                        Deposited: {new Date(viewChallan.paymentDate).toLocaleDateString()}
                      </div>
                    )}
                    {viewChallan.verificationNote && (
                      <div className="text-[11px] text-slate-600 italic mt-1 pt-1 border-t border-emerald-200/60">
                        &quot;{viewChallan.verificationNote}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}