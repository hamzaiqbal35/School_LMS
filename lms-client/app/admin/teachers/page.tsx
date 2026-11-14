"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  MoreVertical,
  Eye,
  EyeOff,
  Mail,
  Phone,
  BookOpen,
  Filter,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface Subject {
  _id: string;
  name: string;
}

interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  qualifications?: string[];
  qualifiedSubjects?: Subject[];
  assignedSubjects?: Subject[];
  avatar?: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");

  const fetchInitialData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        api.get("/admin/teachers"),
        api.get("/admin/master-data"),
      ]);
      setTeachers(tRes.data);
      setSubjects(sRes.data.subjects || []);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error("Failed to load faculty roster.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (selectedSubject) params.append("subjectId", selectedSubject);
      params.append("t", new Date().getTime().toString());

      const res = await api.get(`/admin/teachers?${params.toString()}`);
      setTeachers(res.data);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      toast.error("Failed to filter faculty members.");
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedSubject]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchTeachers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeachers();
  };

  const filteredTeachers = teachers;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    qualifiedSubjects: [] as string[],
    qualifications: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/teachers/${editingId}`, formData);
        toast.success("Faculty member profile updated.");
      } else {
        await api.post("/admin/teachers", formData);
        toast.success("New faculty member successfully registered.");
      }
      setShowModal(false);
      fetchTeachers();
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        qualifiedSubjects: [],
        qualifications: [],
      });
      setEditingId(null);
    } catch (error) {
      const err = error as AxiosErrorLike;
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher._id);
    setFormData({
      fullName: teacher.fullName,
      email: teacher.email,
      password: "",
      phoneNumber: teacher.phoneNumber || "",
      qualifiedSubjects: teacher.qualifiedSubjects?.map((s) => s._id) || [],
      qualifications: teacher.qualifications || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate faculty member "${name}"? This will terminate class assignments.`))
      return;
    try {
      await api.delete(`/admin/teachers/${id}`);
      toast.success(`Faculty profile for "${name}" deactivated.`);
      fetchTeachers();
    } catch {
      toast.error("Failed to deactivate faculty profile.");
    }
  };

  const toggleSubject = (subjectId: string) => {
    setFormData((prev) => {
      const current = prev.qualifiedSubjects;
      if (current.includes(subjectId)) {
        return { ...prev, qualifiedSubjects: current.filter((id) => id !== subjectId) };
      } else {
        return { ...prev, qualifiedSubjects: [...current, subjectId] };
      }
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
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
            <span>Academic Faculty Registry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Faculty &amp; Teaching Staff
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Certified subject specialists, departmental credentials, and contact profiles.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              fullName: "",
              email: "",
              password: "",
              phoneNumber: "",
              qualifiedSubjects: [],
              qualifications: [],
            });
            setShowModal(true);
          }}
          className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Faculty</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1">
            <label htmlFor="teacherSearch" className="sr-only">
              Search teachers
            </label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              id="teacherSearch"
              name="teacherSearch"
              type="text"
              placeholder="Search by faculty name or institutional email..."
              className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
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
          </form>

          <div className="w-full md:w-64">
            <label htmlFor="subjectFilter" className="sr-only">
              Filter by subject
            </label>
            <div className="relative">
              <select
                id="subjectFilter"
                name="subjectFilter"
                className="w-full pl-3.5 pr-8 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 appearance-none transition-all cursor-pointer"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Academic Subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Teachers */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin text-emerald-800 w-8 h-8 mb-3" />
            <p className="text-xs font-semibold">Loading faculty profiles...</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredTeachers.map((teacher) => (
                  <motion.div
                    key={teacher._id}
                    variants={item}
                    className="group bg-white rounded-2xl shadow-xs border border-slate-200 hover:shadow-md hover:border-emerald-700/50 transition-all duration-200 flex flex-col relative overflow-hidden"
                  >
                    {/* Top Institutional Crest Pattern Banner */}
                    <div className="h-20 bg-slate-950 relative border-b border-slate-800 flex items-center justify-between px-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                        Faculty Specialist
                      </span>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === teacher._id ? null : teacher._id)
                          }
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {openMenuId === teacher._id && (
                            <>
                              <div
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 6 }}
                                className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 overflow-hidden text-xs"
                              >
                                <Link
                                  href={`/admin/teachers/${teacher._id}`}
                                  className="flex items-center px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" /> View Record
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleEdit(teacher);
                                  }}
                                  className="w-full flex items-center px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-2 text-slate-400" /> Edit Profile
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleDelete(teacher._id, teacher.fullName);
                                  }}
                                  className="w-full flex items-center px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Deactivate
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="px-5 pb-5 flex-1 flex flex-col">
                      {/* Avatar Overlap */}
                      <div className="relative -mt-10 mb-3 flex justify-between items-end">
                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md border-2 border-emerald-600/30 relative overflow-hidden shrink-0">
                          {teacher.avatar ? (
                            <Image
                              src={teacher.avatar}
                              alt={teacher.fullName}
                              fill
                              className="object-cover rounded-xl"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-emerald-800 font-bold text-2xl font-mono-code border border-slate-200">
                              {(teacher.fullName || "T").charAt(0)}
                            </div>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-600" /> ACTIVE
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3
                          className="font-bold text-slate-900 text-base truncate"
                          title={teacher.fullName}
                        >
                          {teacher.fullName}
                        </h3>

                        <div className="flex flex-col gap-1 mt-1.5 text-xs text-slate-500">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </div>
                          {teacher.phoneNumber && (
                            <div className="flex items-center gap-2 text-[11px] font-mono-code">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{teacher.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto space-y-3 pt-3 border-t border-slate-100">
                        {/* Qualifications */}
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Qualifications
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {!teacher.qualifications || teacher.qualifications.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">Unspecified</span>
                            ) : (
                              teacher.qualifications.slice(0, 2).map((q, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded"
                                >
                                  {q}
                                </span>
                              ))
                            )}
                            {teacher.qualifications && teacher.qualifications.length > 2 && (
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                +{teacher.qualifications.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subjects */}
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Qualified Subjects
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {!teacher.qualifiedSubjects ||
                            teacher.qualifiedSubjects.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">No assigned subjects</span>
                            ) : (
                              teacher.qualifiedSubjects.slice(0, 3).map((s) => (
                                <span
                                  key={s._id}
                                  className="bg-emerald-50 text-emerald-900 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200/80 flex items-center gap-1"
                                >
                                  <BookOpen className="w-2.5 h-2.5 text-emerald-700" />
                                  {s.name}
                                </span>
                              ))
                            )}
                            {(teacher.qualifiedSubjects?.length || 0) > 3 && (
                              <span className="bg-slate-50 text-slate-600 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                                +{(teacher.qualifiedSubjects?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredTeachers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-2xs text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No matching faculty members</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm text-center">
                  Adjust your search keyword or selected subject filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setSelectedSubject("");
                  }}
                  className="mt-3 text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Faculty Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1 inline-block">
                    {editingId ? "Faculty Update" : "Faculty Provisioning"}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingId ? "Edit Faculty Profile" : "Onboard New Faculty Member"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Dr. Tariq Siddiqui"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Institutional Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="faculty@oxfordgrammar.edu.pk"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Contact Phone
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      autoComplete="tel"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all font-mono-code"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Portal Password{" "}
                      {editingId && (
                        <span className="text-slate-400 font-normal lowercase">(leave blank to preserve)</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required={!editingId}
                        className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={editingId ? "••••••••" : "Minimum 6 characters"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="qualifications"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Academic Qualifications (Comma-separated)
                  </label>
                  <input
                    id="qualifications"
                    name="qualifications"
                    type="text"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition-all"
                    placeholder="e.g. M.Sc. Chemistry (KU), B.Ed., CAIE Certified"
                    value={formData.qualifications.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualifications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>

                <div>
                  <p className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Designated Teaching Disciplines
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-slate-200 p-3 rounded-xl bg-slate-50/50 max-h-44 overflow-y-auto custom-scrollbar">
                    {subjects.length === 0 && (
                      <div className="col-span-3 text-center text-xs text-slate-400 py-3">
                        No subjects available. Please add subjects first.
                      </div>
                    )}
                    {subjects.map((subject) => {
                      const isSelected = formData.qualifiedSubjects.includes(subject._id);
                      return (
                        <label
                          key={subject._id}
                          className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors border text-xs ${
                            isSelected
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="qualifiedSubjects"
                            checked={isSelected}
                            onChange={() => toggleSubject(subject._id)}
                            className="rounded text-emerald-800 focus:ring-emerald-700 w-3.5 h-3.5 border-slate-300 accent-emerald-800"
                          />
                          <span className="truncate">{subject.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 font-bold text-xs shadow-xs disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin w-4 h-4 text-emerald-200" />
                    ) : editingId ? (
                      "Save Profile Changes"
                    ) : (
                      "Complete Onboarding"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}