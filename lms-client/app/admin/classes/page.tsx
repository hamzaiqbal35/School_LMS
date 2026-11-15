"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { formatTime12Hour } from "@/lib/utils";
import {
  Loader2,
  Trash2,
  Plus,
  BookOpen,
  Layers,
  Clock,
  GraduationCap,
  Settings,
  X,
  Save,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface BaseItem {
  _id: string;
  name: string;
}

interface ClassItem extends BaseItem {
  order?: number;
}

type SectionItem = BaseItem;

interface SubjectItem extends BaseItem {
  code?: string;
  classes?: (ClassItem | string)[];
}

interface TimeSlotItem extends BaseItem {
  day: string;
  startTime: string;
  endTime: string;
  order?: number;
  days?: string[];
}

interface MasterData {
  classes: ClassItem[];
  sections: SectionItem[];
  subjects: SubjectItem[];
  timeslots: TimeSlotItem[];
}

type MasterDataItem = ClassItem & SubjectItem & TimeSlotItem;
type TabType = "classes" | "sections" | "subjects" | "timeslots";

const TABS = [
  { id: "classes", label: "Classes", icon: GraduationCap, badge: "Curriculum Levels" },
  { id: "sections", label: "Sections", icon: Layers, badge: "Cohort Groups" },
  { id: "subjects", label: "Subjects", icon: BookOpen, badge: "Academic Syllabi" },
  { id: "timeslots", label: "Time Slots", icon: Clock, badge: "Period Schedule" },
] as const;

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>("classes");
  const [data, setData] = useState<MasterData>({
    classes: [],
    sections: [],
    subjects: [],
    timeslots: [],
  });
  const [loading, setLoading] = useState(true);

  // Create Form state
  const [newItem, setNewItem] = useState<Partial<MasterDataItem>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fee Structure Modal State
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [feeStructure, setFeeStructure] = useState({
    admissionFee: 0,
    monthlyTuition: 0,
    examFee: 0,
    miscCharges: 0,
  });
  const [loadingFee, setLoadingFee] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/master-data");
      const d = res.data;
      setData({
        classes: d.classes || [],
        sections: d.sections || [],
        subjects: d.subjects || [],
        timeslots: d.timeslots || [],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch curriculum configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (activeTab === "timeslots" && newItem.days && newItem.days.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { days: _days, ...itemData } = newItem;
        const promises = newItem.days.map((day) =>
          api.post(`/admin/master-data/${activeTab}`, {
            ...itemData,
            day: day,
          })
        );
        await Promise.all(promises);
      } else {
        await api.post(`/admin/master-data/${activeTab}`, newItem);
      }

      toast.success(`${activeTab.slice(0, -1)} created successfully.`);
      setNewItem({});
      fetchData();
    } catch (error: unknown) {
      console.error(error);
      const err = error as AxiosErrorLike;
      toast.error(err.response?.data?.message || "Failed to create item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type: string, id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be reversed.`)) return;
    try {
      await api.delete(`/admin/master-data/${type}/${id}`);
      toast.success(`"${name}" deleted successfully.`);
      fetchData();
    } catch {
      toast.error("Failed to delete record. Please check dependencies.");
    }
  };

  const openFeeModal = async (cls: ClassItem) => {
    setSelectedClass(cls);
    setShowFeeModal(true);
    setLoadingFee(true);
    try {
      const res = await api.get(`/fees/structures/${cls._id}`);
      const d = res.data || {};
      setFeeStructure({
        admissionFee: d.admissionFee || 0,
        monthlyTuition: d.monthlyTuition || 0,
        examFee: d.examFee || 0,
        miscCharges: d.miscCharges || 0,
      });
    } catch (error) {
      console.error(error);
      setFeeStructure({ admissionFee: 0, monthlyTuition: 0, examFee: 0, miscCharges: 0 });
    } finally {
      setLoadingFee(false);
    }
  };

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    try {
      await api.post("/fees/structures", { ...feeStructure, classId: selectedClass._id });
      toast.success(`Fee structure saved for ${selectedClass.name}.`);
      setShowFeeModal(false);
    } catch {
      toast.error("Failed to save fee structure.");
    }
  };

  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Institutional Structure</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Classes, Subjects &amp; Timetable Slots
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Configure primary, matriculation and Cambridge O-Level curricula, sections, and periods.
          </p>
        </div>
      </div>

      {/* Segmented Tab Control */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl shadow-xs border border-slate-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setNewItem({});
              }}
              className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMasterTab"
                  className="absolute inset-0 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="relative z-10">{tab.label}</span>
              <span className="relative z-10 text-[10px] text-slate-400 font-mono-code ml-1">
                ({data[tab.id as TabType]?.length || 0})
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin text-emerald-800 w-8 h-8 mb-3" />
          <p className="text-xs font-semibold">Loading institutional data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* List Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 capitalize">
                  <activeTabConfig.icon className="w-4 h-4 text-emerald-800" />
                  <span>Configured {activeTab} Directory</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeTabConfig.badge}
                </p>
              </div>
              <span className="text-xs font-mono-code font-bold bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full shadow-2xs">
                {data[activeTab]?.length || 0} active
              </span>
            </div>

            <div className="p-5">
              <div className="grid gap-3">
                {data[activeTab]?.length === 0 && (
                  <div className="text-center py-16 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                      <activeTabConfig.icon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No {activeTab} configured yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                      Use the creation form on the right to provision your first {activeTab.slice(0, -1)}.
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {(data[activeTab] as MasterDataItem[]).map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group flex justify-between items-center p-3.5 bg-white border border-slate-200 hover:border-emerald-700/50 rounded-xl hover:shadow-xs transition-all duration-150"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-xs font-bold font-mono-code text-emerald-900 shrink-0">
                            {activeTab === "classes" && (item as ClassItem).order
                              ? (item as ClassItem).order
                              : item.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-slate-900 truncate">
                                {item.name}
                              </h4>
                              {activeTab === "classes" && (
                                <button
                                  type="button"
                                  onClick={() => openFeeModal(item as ClassItem)}
                                  className="text-[10px] font-bold text-emerald-800 hover:text-emerald-900 hover:underline bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                                >
                                  <Settings className="w-3 h-3 text-emerald-700" />
                                  <span>Fee Schedule</span>
                                </button>
                              )}
                            </div>

                            {activeTab === "subjects" && (
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {item.code && (
                                  <span className="text-[10px] font-mono-code font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                    {item.code}
                                  </span>
                                )}
                                {item.classes?.map((c: ClassItem | string) => (
                                  <span
                                    key={typeof c === "string" ? c : c._id}
                                    className="bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 text-[10px] font-semibold px-1.5 py-0.2 rounded"
                                  >
                                    {typeof c === "string" ? "Class" : c.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {activeTab === "timeslots" && (
                              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 font-mono-code">
                                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  {item.day}
                                </span>
                                <span>
                                  {formatTime12Hour(item.startTime)} &ndash; {formatTime12Hour(item.endTime)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(activeTab, item._id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title={`Delete ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Create Form Column */}
          <div className="sticky top-6">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs capitalize">
                    Add New {activeTab.slice(0, -1)}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Register institutional record
                  </p>
                </div>
              </div>

              <div className="p-5">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label
                      htmlFor="itemName"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Name / Title
                    </label>
                    <input
                      id="itemName"
                      name="itemName"
                      type="text"
                      required
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                      placeholder={activeTab === "classes" ? "e.g. Class 10 (Matric)" : "Enter title..."}
                      value={newItem.name || ""}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>

                  {activeTab === "classes" && (
                    <div>
                      <label
                        htmlFor="itemOrder"
                        className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Sequence Order
                      </label>
                      <input
                        id="itemOrder"
                        name="itemOrder"
                        type="number"
                        required
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                        value={newItem.order || ""}
                        onChange={(e) => setNewItem({ ...newItem, order: Number(e.target.value) })}
                        placeholder="e.g. 10"
                      />
                    </div>
                  )}

                  {activeTab === "subjects" && (
                    <>
                      <div>
                        <label
                          htmlFor="subjectCode"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Subject Code
                        </label>
                        <input
                          id="subjectCode"
                          name="subjectCode"
                          type="text"
                          required
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all font-mono-code"
                          placeholder="e.g. CHM-201"
                          value={newItem.code || ""}
                          onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                        />
                      </div>
                      <div>
                        <p className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Applicable Classes
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                          {data.classes.map((cls: ClassItem) => (
                            <label
                              key={cls._id}
                              className={`flex items-center space-x-2 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                                newItem.classes?.includes(cls._id)
                                  ? "bg-emerald-100 text-emerald-900 font-bold"
                                  : "hover:bg-slate-200/60 text-slate-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                value={cls._id}
                                checked={newItem.classes?.includes(cls._id) || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const current = newItem.classes || [];
                                  setNewItem({
                                    ...newItem,
                                    classes: checked
                                      ? [...current, cls._id]
                                      : current.filter((c) => (typeof c === "string" ? c : c._id) !== cls._id),
                                  });
                                }}
                                className="rounded text-emerald-800 focus:ring-emerald-700 w-3.5 h-3.5 border-slate-300 accent-emerald-800"
                              />
                              <span className="truncate">{cls.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "timeslots" && (
                    <>
                      <div>
                        <p className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Applicable Days
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 border border-slate-200 p-2.5 rounded-xl bg-slate-50/50">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                            <label
                              key={d}
                              className={`flex items-center space-x-2 text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                                newItem.days?.includes(d)
                                  ? "bg-emerald-100 text-emerald-900 font-bold"
                                  : "hover:bg-slate-200/60 text-slate-600"
                              }`}
                            >
                              <input
                                type="checkbox"
                                value={d}
                                checked={newItem.days?.includes(d) || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const current = newItem.days || [];
                                  setNewItem({
                                    ...newItem,
                                    days: checked
                                      ? [...current, d]
                                      : current.filter((day) => day !== d),
                                  });
                                }}
                                className="rounded text-emerald-800 focus:ring-emerald-700 w-3.5 h-3.5 border-slate-300 accent-emerald-800"
                              />
                              <span>{d}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label
                            htmlFor="slotStart"
                            className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                          >
                            Start Time
                          </label>
                          <input
                            id="slotStart"
                            name="slotStart"
                            type="time"
                            required
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                            value={newItem.startTime || ""}
                            onChange={(e) => setNewItem({ ...newItem, startTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="slotEnd"
                            className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                          >
                            End Time
                          </label>
                          <input
                            id="slotEnd"
                            name="slotEnd"
                            type="time"
                            required
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                            value={newItem.endTime || ""}
                            onChange={(e) => setNewItem({ ...newItem, endTime: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="slotOrder"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Period Number
                        </label>
                        <input
                          id="slotOrder"
                          name="slotOrder"
                          type="number"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                          value={newItem.order || 0}
                          onChange={(e) => setNewItem({ ...newItem, order: Number(e.target.value) })}
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white p-3 rounded-xl font-bold text-xs shadow-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin w-4 h-4 text-emerald-200" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Provision {activeTab.slice(0, -1)}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Fee Structure Modal */}
      <AnimatePresence>
        {showFeeModal && (
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
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    Official Fee Schedule
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tuition &amp; Dues for {selectedClass?.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowFeeModal(false)}
                  className="bg-white p-2 rounded-xl text-slate-400 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {loadingFee ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="animate-spin text-emerald-800 w-6 h-6 mb-2" />
                    <span className="text-xs">Fetching fee schedule...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveFee} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="admissionFee"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Admission Fee
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs font-mono-code">PKR</span>
                          <input
                            id="admissionFee"
                            name="admissionFee"
                            type="number"
                            className="w-full pl-12 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                            value={feeStructure.admissionFee}
                            onChange={(e) =>
                              setFeeStructure({ ...feeStructure, admissionFee: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="monthlyTuition"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Monthly Tuition
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs font-mono-code">PKR</span>
                          <input
                            id="monthlyTuition"
                            name="monthlyTuition"
                            type="number"
                            required
                            className="w-full pl-12 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                            value={feeStructure.monthlyTuition}
                            onChange={(e) =>
                              setFeeStructure({ ...feeStructure, monthlyTuition: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="examFee"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Exam Assessment Fee
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs font-mono-code">PKR</span>
                          <input
                            id="examFee"
                            name="examFee"
                            type="number"
                            className="w-full pl-12 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                            value={feeStructure.examFee}
                            onChange={(e) =>
                              setFeeStructure({ ...feeStructure, examFee: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="miscCharges"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Lab &amp; Misc Dues
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs font-mono-code">PKR</span>
                          <input
                            id="miscCharges"
                            name="miscCharges"
                            type="number"
                            className="w-full pl-12 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono-code text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                            value={feeStructure.miscCharges}
                            onChange={(e) =>
                              setFeeStructure({ ...feeStructure, miscCharges: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowFeeModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Fee Schedule
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}