"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import {
  Loader2,
  Search,
  ArrowLeft,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Assignment {
  _id: string;
  classId: { _id: string; name: string };
  sectionId: { _id: string; name: string };
  subjectId: { _id: string; name: string };
  timeSlotId: { day: string; startTime: string; endTime: string };
}

interface Student {
  _id: string;
  registrationNumber: string;
  fullName: string;
  fatherName: string;
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  avatar?: string;
}

export default function MyStudentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/teacher/assignments");
        // Filter unique class-sections to avoid duplicates
        const unique: Assignment[] = [];
        const seen = new Set();
        res.data.forEach((a: Assignment) => {
          if (a.classId?._id && a.sectionId?._id) {
            const key = `${a.classId._id}-${a.sectionId._id}`;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(a);
            }
          }
        });
        setAssignments(unique);
      } catch (error) {
        console.error("Failed to load assignments:", error);
        toast.error("Failed to load your assigned classes.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleClassSelect = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setLoadingStudents(true);
    setSearchTerm("");
    try {
      const res = await api.get(
        `/teacher/students?classId=${assignment.classId._id}&sectionId=${assignment.sectionId._id}`
      );
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to load students:", error);
      toast.error("Failed to fetch students for this class.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-12">
      <AnimatePresence mode="wait">
        {!selectedAssignment ? (
          /* STEP 1: CLASS COHORT SELECTION */
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full w-fit mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Assigned Class Roster</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                My Student Cohorts
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Select an allocated curriculum class to review enrolled student dossiers.
              </p>
            </div>

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
                <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No classes assigned</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your teaching timetable currently has no active classroom period allocations.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    onClick={() => handleClassSelect(assignment)}
                    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-700/60 hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Class Roster
                        </span>
                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                        Class {assignment.classId.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Section {assignment.sectionId.name}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Click to open roster</span>
                      <span className="text-emerald-800 font-bold group-hover:translate-x-1 transition-transform inline-block">
                        View Scholars &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* STEP 2: STUDENT DIRECTORY FOR SELECTED CLASS */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Class Header & Navigation */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors border border-slate-200 cursor-pointer"
                  title="Back to Class List"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-800" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Class {selectedAssignment.classId.name} &bull; Section {selectedAssignment.sectionId.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {filteredStudents.length} {filteredStudents.length === 1 ? "Scholar" : "Scholars"} enrolled
                  </p>
                </div>
              </div>

              <div className="w-full md:w-72 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="searchStudents"
                  name="searchStudents"
                  type="text"
                  placeholder="Search scholar or roll ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-all text-slate-900"
                  aria-label="Search Students"
                />
              </div>
            </div>

            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                <Loader2 className="animate-spin text-emerald-800 w-8 h-8 mb-2" />
                <p className="text-xs font-semibold">Loading classroom scholars...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-700/50 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      {/* Top Identity Row */}
                      <div className="flex items-start gap-3.5 mb-3.5">
                        {/* Student Avatar (Read-Only) */}
                        <div
                          className="relative w-14 h-14 rounded-2xl bg-slate-100 border-2 border-emerald-700/20 shadow-xs shrink-0 flex items-center justify-center font-bold text-lg text-emerald-950 font-mono overflow-hidden select-none"
                        >
                          {student.avatar ? (
                            <Image
                              src={student.avatar}
                              alt={student.fullName}
                              fill
                              sizes="56px"
                              className="object-cover rounded-xl"
                            />
                          ) : (
                            student.fullName.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Student Names & Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 truncate" title={student.fullName}>
                            {student.fullName}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold border border-slate-200/80">
                              {student.registrationNumber}
                            </span>
                            {student.gender && (
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                &bull; {student.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Metadata Details */}
                      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Father / Guardian:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[130px]" title={student.fatherName}>
                            {student.fatherName || "N/A"}
                          </span>
                        </div>

                        {student.phoneNumber && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">Contact Phone:</span>
                            <span className="font-mono text-slate-700 text-[11px]">
                              {student.phoneNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No scholars found matching &quot;{searchTerm}&quot; in this cohort.
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
