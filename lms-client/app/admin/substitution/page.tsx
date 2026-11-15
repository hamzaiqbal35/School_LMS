"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { formatTime12Hour } from "@/lib/utils";
import {
  Loader2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  UserX,
  Clock,
  ArrowRight,
  X,
  UserCheck,
  ArrowLeftRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface TimeSlot {
  _id: string;
  startTime: string;
  endTime: string;
  day: string;
}

interface ClassEntity {
  _id: string;
  name: string;
}

interface Teacher {
  _id: string;
  fullName: string;
  qualification?: string;
  isFree?: boolean;
  reason?: string;
  avatar?: string;
}

interface NeedSubstitution {
  class: ClassEntity;
  section: ClassEntity;
  subject: ClassEntity;
  timeSlot: TimeSlot;
  originalTeacher: Teacher;
  status: "Pending" | "Covered";
  substitution?: {
    _id: string;
    substituteTeacherId: Teacher;
  };
}

export default function AdminSubstitutionPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [neededSubs, setNeededSubs] = useState<NeedSubstitution[]>([]);
  const [loading, setLoading] = useState(false);

  // Selection state for assigning
  const [selectedSlot, setSelectedSlot] = useState<NeedSubstitution | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [searchingTeachers, setSearchingTeachers] = useState(false);

  const fetchNeededSubstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/substitution/needed?date=${date}`);
      setNeededSubs(res.data);
    } catch (error) {
      console.error("Failed to fetch substitutions", error);
      toast.error("Failed to load daily substitution requests.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchNeededSubstitutions();
  }, [fetchNeededSubstitutions]);

  const handleSelectSlot = async (item: NeedSubstitution) => {
    if (item.status === "Covered") return;
    setSelectedSlot(item);
    setSearchingTeachers(true);
    try {
      const res = await api.get(
        `/substitution/available-teachers?date=${date}&timeSlotId=${item.timeSlot._id}`
      );
      setAvailableTeachers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to query faculty availability.");
    } finally {
      setSearchingTeachers(false);
    }
  };

  const assignSubstitute = async (teacherId: string) => {
    if (!selectedSlot) return;
    try {
      await api.post("/substitution", {
        date,
        classId: selectedSlot.class._id,
        sectionId: selectedSlot.section._id,
        subjectId: selectedSlot.subject._id,
        timeSlotId: selectedSlot.timeSlot._id,
        originalTeacherId: selectedSlot.originalTeacher._id,
        substituteTeacherId: teacherId,
      });

      toast.success("Period substitution successfully assigned.");
      setSelectedSlot(null);
      fetchNeededSubstitutions();
    } catch (error) {
      console.error("Assignment failed", error);
      toast.error("Failed to assign substitute faculty.");
    }
  };

  const deleteSubstitution = async (subId: string) => {
    if (!confirm("Are you sure you want to cancel this period substitution?")) return;
    try {
      await api.delete(`/substitution/${subId}`);
      toast.success("Substitution assignment canceled.");
      fetchNeededSubstitutions();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to cancel substitution.");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Real-Time Instructional Continuity</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Faculty Timetable Substitutions
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Detect unattended periods due to faculty absence and route available certified substitutes.
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white p-2 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <input
            id="substitutionDate"
            name="substitutionDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-none outline-none text-slate-800 font-bold font-mono-code text-xs bg-transparent cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Substitution Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-4 bg-emerald-700 rounded-full"></span>
              <span>Absence &amp; Substitution Queue</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold">
                {neededSubs.length} slots
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="bg-white p-16 rounded-2xl shadow-xs border border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin text-emerald-800 w-8 h-8 mb-3" />
              <p className="text-xs font-semibold">Scanning faculty absence logs...</p>
            </div>
          ) : neededSubs.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl shadow-xs border border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3 border border-emerald-200/80 text-emerald-800">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-slate-900 font-bold text-sm">Full Instructional Coverage</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                No teacher absences detected for this calendar date. All scheduled periods are attended.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              <AnimatePresence>
                {neededSubs.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`relative overflow-hidden p-0 rounded-2xl border transition-all cursor-pointer ${
                      item.status === "Covered"
                        ? "bg-white border-slate-200"
                        : selectedSlot === item
                        ? "bg-emerald-50/50 border-emerald-700/60 ring-1 ring-emerald-500/30 shadow-xs"
                        : "bg-white border-slate-200 hover:border-emerald-600/50 hover:shadow-xs"
                    }`}
                    onClick={() => handleSelectSlot(item)}
                  >
                    <div className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            item.status === "Covered"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                          }`}
                        >
                          {item.status === "Covered" ? (
                            <UserCheck className="w-5 h-5" />
                          ) : (
                            <UserX className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 text-sm">
                              {item.class.name} &bull; Section {item.section.name}
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded uppercase tracking-wider">
                              {item.subject.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold mb-1">
                            <span className="flex items-center gap-1 bg-rose-50 border border-rose-100 px-2 py-0.2 rounded">
                              <UserX className="w-3 h-3" />
                              Absent: {item.originalTeacher.fullName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono-code">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{item.timeSlot.day}</span>
                            <span>&bull;</span>
                            <span>
                              {formatTime12Hour(item.timeSlot.startTime)} &ndash;{" "}
                              {formatTime12Hour(item.timeSlot.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-4 sm:pl-0 border-l sm:border-l-0 border-slate-100">
                        {item.status === "Covered" ? (
                          <>
                            <div className="text-right">
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1">
                                <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Resolved
                              </span>
                              <div className="text-xs text-slate-600">
                                Substitute:{" "}
                                <span className="font-bold text-slate-900">
                                  {item.substitution?.substituteTeacherId?.fullName}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.substitution?._id) deleteSubstitution(item.substitution._id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancel Substitution"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">
                              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Needs Cover
                            </span>
                            <ArrowRight className="w-4 h-4 text-emerald-800" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Column: Free Faculty Assignment Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50/60">
                <h2 className="font-bold text-slate-900 text-xs">
                  Available Faculty Specialist
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Route verified substitute for selected period
                </p>
              </div>

              <div className="p-5">
                {!selectedSlot ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <p className="text-slate-800 text-xs font-bold">
                      No period slot selected
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                      Click any &quot;Needs Cover&quot; period on the left to view free certified teachers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs">
                      <div className="font-bold text-emerald-950 mb-1">Target Period</div>
                      <div className="text-emerald-900 font-semibold">
                        {selectedSlot.class.name}-{selectedSlot.section.name} &bull; {selectedSlot.subject.name}
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5 font-mono-code">
                        {formatTime12Hour(selectedSlot.timeSlot.startTime)} &ndash;{" "}
                        {formatTime12Hour(selectedSlot.timeSlot.endTime)}
                      </div>
                    </div>

                    <div>
                      {searchingTeachers ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-2">
                          <Loader2 className="animate-spin w-5 h-5 text-emerald-800" />
                          <span className="text-xs text-slate-500">Checking faculty timetables...</span>
                        </div>
                      ) : availableTeachers.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <UserX className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs font-semibold">No teachers available for this slot</p>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                            Available Faculty
                          </h3>
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                            {availableTeachers.map((teacher) => (
                              <button
                                key={teacher._id}
                                onClick={() => {
                                  if (
                                    !teacher.isFree &&
                                    !confirm(
                                      `This teacher is logged as "${teacher.reason}". Assign anyway?`
                                    )
                                  )
                                    return;
                                  assignSubstitute(teacher._id);
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left border cursor-pointer ${
                                  teacher.isFree
                                    ? "bg-white border-slate-200 hover:border-emerald-700 hover:bg-emerald-50/30"
                                    : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-100"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold font-mono-code text-emerald-900 shrink-0">
                                    {(teacher.fullName || "T").charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      {teacher.fullName}
                                    </div>
                                  </div>
                                </div>

                                <div className="ml-2 shrink-0">
                                  {teacher.isFree ? (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase rounded">
                                      Free Slot
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold uppercase rounded">
                                      {teacher.reason}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedSlot(null)}
                      className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Dismiss Selection
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}