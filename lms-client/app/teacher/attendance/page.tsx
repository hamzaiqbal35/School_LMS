"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { formatTime12Hour } from "@/lib/utils";
import {
  Loader2,
  Save,
  Calendar,
  ArrowLeft,
  Users,
  Clock,
  Filter,
  GraduationCap,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface Assignment {
  _id: string;
  classId: { _id: string; name: string };
  sectionId: { _id: string; name: string };
  subjectId: { _id: string; name: string };
  timeSlotId: { day: string; startTime: string; endTime: string };
  originalTeacherId?: { fullName: string };
}

interface Student {
  _id: string;
  registrationNumber: string;
  fullName: string;
  fatherName: string;
  avatar?: string;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function MarkAttendancePage() {
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get("classId");
  const sectionIdParam = searchParams.get("sectionId");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  // Selection state
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [marks, setMarks] = useState<Record<string, string>>({}); // studentId -> status

  // Get unique classes for filter dropdown
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, string>();
    assignments.forEach((a) => {
      if (a.classId?._id && a.sectionId?._id) {
        const key = `${a.classId._id}-${a.sectionId._id}`;
        if (!classMap.has(key)) {
          classMap.set(key, `${a.classId.name} - ${a.sectionId.name}`);
        }
      }
    });
    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments]);

  // Get unique subjects for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subjectMap = new Map<string, string>();
    assignments.forEach((a) => {
      if (a.subjectId?._id && !subjectMap.has(a.subjectId._id)) {
        subjectMap.set(a.subjectId._id, a.subjectId.name);
      }
    });
    return Array.from(subjectMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [assignments]);

  // Get the day of week from the selected attendance date
  const selectedDateDay = useMemo(() => {
    if (!attendanceDate) return "";
    const date = new Date(attendanceDate + "T00:00:00");
    const dayIndex = date.getDay();
    return DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1];
  }, [attendanceDate]);

  // Filtered assignments based on selected filters
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesDay = !selectedDateDay || a.timeSlotId?.day === selectedDateDay;
      const matchesClass =
        !selectedClass ||
        `${a.classId?._id}-${a.sectionId?._id}` === selectedClass;
      const matchesSubject =
        !selectedSubject || a.subjectId?._id === selectedSubject;
      return matchesDay && matchesClass && matchesSubject;
    });
  }, [assignments, selectedDateDay, selectedClass, selectedSubject]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/teacher/assignments");
        setAssignments(res.data);
      } catch (error) {
        console.error("Failed to load assignments:", error);
        toast.error("Failed to load your assigned classroom periods.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Helper function to get the most recent date for a given day of the week
  const getDateForDay = useCallback((dayName: string): string => {
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDay = dayMap[dayName];
    if (targetDay === undefined) {
      return new Date().toISOString().split("T")[0];
    }

    const today = new Date();
    const currentDay = today.getDay();

    let daysBack = currentDay - targetDay;
    if (daysBack < 0) {
      daysBack += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - daysBack);

    return targetDate.toISOString().split("T")[0];
  }, []);

  const handleClassSelect = useCallback(
    async (assignment: Assignment) => {
      setSelectedAssignment(assignment);
      setLoadingStudents(true);

      let dateToUse = attendanceDate;
      if (assignment.timeSlotId?.day) {
        dateToUse = getDateForDay(assignment.timeSlotId.day);
        setAttendanceDate(dateToUse);
      }

      try {
        const res = await api.get(
          `/teacher/students?classId=${assignment.classId._id}&sectionId=${assignment.sectionId._id}`
        );
        const studList: Student[] = res.data;
        setStudents(studList);

        const attendanceRes = await api.get(
          `/attendance?classId=${assignment.classId._id}&sectionId=${assignment.sectionId._id}&date=${dateToUse}`
        );
        const existingAttendance = attendanceRes.data;

        const initialMarks: Record<string, string> = {};
        studList.forEach((s) => (initialMarks[s._id] = "Not Marked"));

        existingAttendance.forEach(
          (record: {
            studentId: { _id: string } | string;
            status: string;
          }) => {
            const studentId =
              typeof record.studentId === "object"
                ? record.studentId._id
                : record.studentId;
            if (studentId && Object.prototype.hasOwnProperty.call(initialMarks, studentId)) {
              initialMarks[studentId] = record.status;
            }
          }
        );

        setMarks(initialMarks);
      } catch (error) {
        console.error("Failed to load students/attendance:", error);
        toast.error("Failed to load student roster for this class.");
      } finally {
        setLoadingStudents(false);
      }
    },
    [getDateForDay, attendanceDate]
  );

  // Refetch attendance when date changes
  const fetchExistingAttendance = useCallback(async () => {
    if (!selectedAssignment || students.length === 0) return;

    try {
      const attendanceRes = await api.get(
        `/attendance?classId=${selectedAssignment.classId._id}&sectionId=${selectedAssignment.sectionId._id}&date=${attendanceDate}`
      );
      const existingAttendance = attendanceRes.data;

      const updatedMarks: Record<string, string> = {};
      students.forEach((s) => (updatedMarks[s._id] = "Not Marked"));

      existingAttendance.forEach(
        (record: {
          studentId: { _id: string } | string;
          status: string;
        }) => {
          const studentId =
            typeof record.studentId === "object"
              ? record.studentId._id
              : record.studentId;
          if (studentId && Object.prototype.hasOwnProperty.call(updatedMarks, studentId)) {
            updatedMarks[studentId] = record.status;
          }
        }
      );

      setMarks(updatedMarks);
    } catch (error) {
      console.error("Failed to fetch existing attendance:", error);
    }
  }, [selectedAssignment, students, attendanceDate]);

  useEffect(() => {
    if (selectedAssignment && students.length > 0) {
      fetchExistingAttendance();
    }
  }, [attendanceDate, fetchExistingAttendance, selectedAssignment, students.length]);

  // Auto-select based on query params
  useEffect(() => {
    if (
      assignments.length > 0 &&
      classIdParam &&
      sectionIdParam &&
      !selectedAssignment
    ) {
      const target = assignments.find(
        (a) =>
          a.classId?._id === classIdParam && a.sectionId?._id === sectionIdParam
      );
      if (target) {
        handleClassSelect(target);
      }
    }
  }, [
    assignments,
    classIdParam,
    sectionIdParam,
    selectedAssignment,
    handleClassSelect,
  ]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, string> = {};
    students.forEach((s) => (updated[s._id] = "Present"));
    setMarks(updated);
    toast.success("All scholars marked as Present.");
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || students.length === 0) return;

    setSubmitting(true);
    const toastId = toast.loading("Saving daily attendance verification...");

    const payload = {
      date: attendanceDate,
      classId: selectedAssignment.classId._id,
      sectionId: selectedAssignment.sectionId._id,
      records: Object.entries(marks).map(([studentId, status]) => ({
        studentId,
        status,
      })),
    };

    try {
      await api.post("/attendance", payload);
      toast.success("Daily attendance submitted successfully!", { id: toastId });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to submit attendance.", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    present: Object.values(marks).filter((s) => s === "Present").length,
    absent: Object.values(marks).filter((s) => s === "Absent").length,
    leave: Object.values(marks).filter((s) => s === "Leave").length,
    late: Object.values(marks).filter((s) => s === "Late").length,
    notMarked: Object.values(marks).filter((s) => s === "Not Marked").length,
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-12">
      <AnimatePresence mode="wait">
        {!selectedAssignment ? (
          /* STEP 1: CLASS SELECTION & FILTERING */
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Daily Attendance Protocol</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Mark Classroom Attendance
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Select an allocated period cohort and submit daily presence verification.
                </p>
              </div>

              {/* Date Control */}
              <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2.5 w-fit">
                <Calendar className="w-4 h-4 text-emerald-800 shrink-0" />
                <input
                  id="attendanceDate"
                  name="attendanceDate"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 cursor-pointer"
                  aria-label="Attendance Date"
                />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-emerald-800" />
                  <span>Filters</span>
                </div>

                <div className="flex flex-wrap gap-3 flex-1 w-full sm:w-auto">
                  <div className="flex-1 min-w-[160px]">
                    <select
                      id="filterSubject"
                      name="filterSubject"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-700 transition-all cursor-pointer"
                    >
                      <option value="">All Subjects</option>
                      {uniqueSubjects.map((subj) => (
                        <option key={subj.id} value={subj.id}>
                          {subj.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[180px]">
                    <select
                      id="filterClass"
                      name="filterClass"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-700 transition-all cursor-pointer"
                    >
                      <option value="">All Classes</option>
                      {uniqueClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          Class {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(selectedSubject || selectedClass) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubject("");
                        setSelectedClass("");
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Assignments Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-44 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"
                  />
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No classes assigned</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your timetable has no active classroom allocations.
                </p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No classes match your filter</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting or clearing your active subject and class filters.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    onClick={() => handleClassSelect(assignment)}
                    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-700/60 hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            assignment.originalTeacherId
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {assignment.originalTeacherId
                            ? "Substitution Period"
                            : assignment.subjectId.name}
                        </span>

                        {assignment.timeSlotId?.day && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            {assignment.timeSlotId.day}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                        Class {assignment.classId.name} &bull; Sec {assignment.sectionId.name}
                      </h3>

                      {assignment.originalTeacherId ? (
                        <p className="text-xs text-amber-800 font-medium mt-1 bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                          Covering for: <strong>{assignment.originalTeacherId.fullName}</strong>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {assignment.subjectId.name}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-slate-400 font-mono text-xs mt-3">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatTime12Hour(assignment.timeSlotId?.startTime)} &ndash;{" "}
                          {formatTime12Hour(assignment.timeSlotId?.endTime)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Click to conduct roll call</span>
                      <span className="text-emerald-800 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>Conduct Roll Call</span>
                        <span>&rarr;</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* STEP 2: ROLL CALL MARKING INTERFACE */
          <motion.div
            key="marking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header & Sticky Action Bar */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors border border-slate-200 cursor-pointer"
                  title="Return to Class List"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-800" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Class {selectedAssignment.classId.name} &bull; Section {selectedAssignment.sectionId.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedAssignment.subjectId.name} &bull; {new Date(attendanceDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Status Ribbon & Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap justify-end w-full md:w-auto">
                {/* 4-Pill Summary */}
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    P: {stats.present}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                    A: {stats.absent}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    L: {stats.leave}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
                    Late: {stats.late}
                  </span>
                </div>

                {/* Mark All Present Helper */}
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  disabled={loadingStudents || submitting}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Mark all students as Present"
                >
                  Mark All Present
                </button>

                {/* Submit Roll Call */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loadingStudents || submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Submit Roll Call</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                <Loader2 className="animate-spin text-emerald-800 w-8 h-8 mb-2" />
                <p className="text-xs font-semibold">Loading student roll call roster...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-50 px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <div className="hidden md:block md:col-span-2">Registration ID</div>
                  <div className="col-span-5 md:col-span-4">Enrolled Scholar</div>
                  <div className="col-span-7 md:col-span-6 text-center">Daily Presence Status</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <div
                      key={student._id}
                      className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="hidden md:block md:col-span-2 font-mono text-xs font-semibold text-slate-600">
                        {student.registrationNumber}
                      </div>

                      <div className="col-span-5 md:col-span-4 pr-2">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {student.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Father: {student.fatherName || "Not Recorded"}
                        </p>
                        <p className="md:hidden text-[10px] text-slate-400 font-mono mt-0.5">
                          {student.registrationNumber}
                        </p>
                      </div>

                      {/* Presence Segmented Status Controls */}
                      <div className="col-span-7 md:col-span-6 flex justify-center gap-1 sm:gap-1.5">
                        {[
                          { key: "Present", label: "Present", short: "P", activeClass: "bg-emerald-800 text-white border-emerald-800 shadow-2xs font-bold" },
                          { key: "Absent", label: "Absent", short: "A", activeClass: "bg-rose-700 text-white border-rose-700 shadow-2xs font-bold" },
                          { key: "Leave", label: "Leave", short: "L", activeClass: "bg-amber-600 text-white border-amber-600 shadow-2xs font-bold" },
                          { key: "Late", label: "Late", short: "Late", activeClass: "bg-sky-700 text-white border-sky-700 shadow-2xs font-bold" },
                        ].map((btn) => {
                          const isActive = marks[student._id] === btn.key;

                          return (
                            <button
                              key={btn.key}
                              type="button"
                              onClick={() =>
                                setMarks({ ...marks, [student._id]: btn.key })
                              }
                              className={`
                                h-8 sm:h-9 px-2 sm:px-3 rounded-xl border text-xs transition-all cursor-pointer
                                ${
                                  isActive
                                    ? btn.activeClass
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                                }
                              `}
                              title={btn.label}
                            >
                              <span className="hidden sm:inline">{btn.label}</span>
                              <span className="sm:hidden font-mono font-bold">{btn.short}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
