"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  Camera,
  Upload,
  X,
  BookOpen,
  User as UserIcon,
  CreditCard,
  Save
} from "lucide-react";
import { toast } from "sonner";

interface ReferenceData {
  _id: string;
  name: string;
}

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// CNIC Format Helper (xxxxx-xxxxxxx-x)
const formatCnic = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export default function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [masterData, setMasterData] = useState<{
    classes: ReferenceData[];
    sections: ReferenceData[];
  }>({ classes: [], sections: [] });

  const [formData, setFormData] = useState({
    registrationNumber: "",
    fullName: "",
    fatherName: "",
    dob: "",
    gender: "Male",
    phoneNumber: "",
    bFormNumber: "",
    fatherCnic: "",
    cast: "",
    religion: "Islam",
    classId: "",
    sectionId: "",
    campusId: "Main Campus",
    discountAmount: 0,
    admissionDate: "",
    status: "Active",
    isAdmissionPaid: false,
    avatar: "",
  });

  const [classFee, setClassFee] = useState<number>(0);

  const fetchMasterData = useCallback(async () => {
    try {
      const res = await api.get("/admin/master-data");
      setMasterData(res.data);
    } catch (error) {
      console.error("Failed to load master data:", error);
      toast.error("Failed to load academic classes and sections.");
    }
  }, []);

  const fetchStudent = useCallback(async () => {
    try {
      const res = await api.get(`/admin/students/${studentId}`);
      const s = res.data;
      setFormData({
        registrationNumber: s.registrationNumber || "",
        fullName: s.fullName || "",
        fatherName: s.fatherName || "",
        dob: s.dob ? s.dob.split("T")[0] : "",
        gender: s.gender || "Male",
        phoneNumber: s.phoneNumber || "",
        bFormNumber: s.bFormNumber || "",
        fatherCnic: s.fatherCnic || "",
        cast: s.cast || "",
        religion: s.religion || "Islam",
        classId: s.classId?._id || s.classId || "",
        sectionId: s.sectionId?._id || s.sectionId || "",
        campusId: s.campusId || "Main Campus",
        discountAmount: Number(s.discountAmount) || 0,
        admissionDate: s.admissionDate ? s.admissionDate.split("T")[0] : "",
        status: s.status || "Active",
        isAdmissionPaid: !!s.isAdmissionPaid,
        avatar: s.avatar || "",
      });
    } catch (error) {
      console.error("Failed to load student:", error);
      toast.error("Failed to load student record.");
    } finally {
      setInitialLoading(false);
    }
  }, [studentId]);

  // Fetch Fee Structure when class changes
  useEffect(() => {
    if (formData.classId) {
      const fetchFee = async () => {
        try {
          const res = await api.get(`/fees/structures/${formData.classId}`);
          setClassFee(res.data?.monthlyTuition || 0);
        } catch {
          setClassFee(0);
        }
      };
      fetchFee();
    } else {
      setClassFee(0);
    }
  }, [formData.classId]);

  useEffect(() => {
    fetchMasterData();
    if (studentId) {
      fetchStudent();
    }
  }, [studentId, fetchMasterData, fetchStudent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === "discountAmount") {
      setFormData({
        ...formData,
        [name]: Number(value) || 0,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCnicChange = (name: string, rawVal: string) => {
    setFormData({ ...formData, [name]: formatCnic(rawVal) });
  };

  // Student Photo Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    setUploadingPhoto(true);
    const toastId = toast.loading("Uploading student photograph...");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await api.post("/upload/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((prev) => ({ ...prev, avatar: res.data.url }));
      toast.success("Student photograph updated successfully.", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload student photograph.", { id: toastId });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter the student's full name.");
      return;
    }
    if (!formData.registrationNumber.trim()) {
      toast.error("Please provide a valid registration number.");
      return;
    }
    if (!formData.classId) {
      toast.error("Please allocate an academic class.");
      return;
    }
    if (!formData.sectionId) {
      toast.error("Please allocate a class section.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating student institutional dossier...");

    try {
      await api.put(`/admin/students/${studentId}`, formData);
      toast.success("Student record updated successfully!", { id: toastId });
      router.push(`/admin/students/${studentId}`);
    } catch (error: unknown) {
      const err = error as AxiosErrorLike;
      toast.error(err.response?.data?.message || "Failed to update student.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-2" />
        <p className="text-xs font-semibold">Loading student record for editing...</p>
      </div>
    );
  }

  const netPayable = Math.max(0, classFee - (formData.discountAmount || 0));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      {/* TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/admin/students/${studentId}`)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800" />
            <span>Back to Student Record</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Edit Student Profile
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Modify official academic placement, demographic data, and fee structures.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
          Reg: {formData.registrationNumber || "N/A"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CARD 1: STUDENT PHOTOGRAPH & BIOMETRIC RECORD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scholar Photograph</h3>
              <p className="text-[11px] text-slate-500">Official student identity photograph</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Photo Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative shadow-inner">
                {uploadingPhoto ? (
                  <div className="flex flex-col items-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-800 mb-1" />
                    <span className="text-[10px] font-semibold">Uploading...</span>
                  </div>
                ) : formData.avatar ? (
                  <Image
                    src={formData.avatar}
                    alt="Student Preview"
                    fill
                    sizes="112px"
                    className="object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <UserIcon className="w-10 h-10 mx-auto opacity-30 text-slate-500 mb-1" />
                    <span className="text-[10px] font-semibold block text-slate-400">No Photo</span>
                  </div>
                )}
              </div>

              {formData.avatar && !uploadingPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  title="Remove Photograph"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Upload Controls & Guidelines */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  id="studentEditPhotoInput"
                />
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-emerald-800" />
                      <span>{formData.avatar ? "Replace Photograph" : "Upload Student Photo"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>Accepted formats: <strong>PNG, JPG, or WebP</strong> (Max 5MB).</p>
                <p className="text-[11px] text-slate-400">
                  Ensure the photograph has clear lighting, uniform dress, and a plain light background.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: ACADEMIC PLACEMENT & COHORT ALLOCATION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Placement</h3>
              <p className="text-[11px] text-slate-500">Official cohort division and enrollment metadata</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label
                htmlFor="registrationNumber"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Registration Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                required
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. Reg-12345678"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="admissionDate"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Admission Date
              </label>
              <input
                id="admissionDate"
                name="admissionDate"
                type="date"
                value={formData.admissionDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="classId"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Academic Class <span className="text-rose-500">*</span>
              </label>
              <select
                id="classId"
                name="classId"
                required
                value={formData.classId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-all cursor-pointer"
              >
                <option value="">Select Academic Class...</option>
                {masterData.classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sectionId"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Section Allocation <span className="text-rose-500">*</span>
              </label>
              <select
                id="sectionId"
                name="sectionId"
                required
                value={formData.sectionId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-all cursor-pointer"
              >
                <option value="">Select Section...</option>
                {masterData.sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="campusId"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Campus Location
              </label>
              <input
                id="campusId"
                name="campusId"
                type="text"
                value={formData.campusId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Enrollment Standing
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-all cursor-pointer"
              >
                <option value="Active">Active Standing</option>
                <option value="Inactive">Inactive / Suspended</option>
                <option value="PassedOut">Passed Out / Graduated</option>
                <option value="Expelled">Expelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 3: PERSONAL & FAMILY DOSSIER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Personal &amp; Guardian Information</h3>
              <p className="text-[11px] text-slate-500">Student identity, guardian contacts, and demographics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label
                htmlFor="fullName"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Muhammad Aizaz Khan"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="fatherName"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Father / Guardian Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="fatherName"
                name="fatherName"
                type="text"
                required
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="e.g. Hassan Khan"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="dob"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-all cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Contact Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="0300-1234567"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="bFormNumber"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Government B-Form No.
              </label>
              <input
                id="bFormNumber"
                name="bFormNumber"
                type="text"
                maxLength={15}
                value={formData.bFormNumber}
                onChange={(e) => handleCnicChange("bFormNumber", e.target.value)}
                placeholder="xxxxx-xxxxxxx-x"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="fatherCnic"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Father / Guardian CNIC
              </label>
              <input
                id="fatherCnic"
                name="fatherCnic"
                type="text"
                maxLength={15}
                value={formData.fatherCnic}
                onChange={(e) => handleCnicChange("fatherCnic", e.target.value)}
                placeholder="xxxxx-xxxxxxx-x"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="cast"
                  className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Cast (Optional)
                </label>
                <input
                  id="cast"
                  name="cast"
                  type="text"
                  value={formData.cast}
                  onChange={handleChange}
                  placeholder="e.g. Rajput"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="religion"
                  className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Religion
                </label>
                <input
                  id="religion"
                  name="religion"
                  type="text"
                  value={formData.religion}
                  onChange={handleChange}
                  placeholder="Islam"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: FINANCIAL STRUCTURE & TUITION LEDGER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Financial Structure</h3>
              <p className="text-[11px] text-slate-500">Monthly tuition rate, scholarship discount, and admission clearance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Standard Class Tuition
              </span>
              <p className="text-xl font-bold font-mono text-slate-900">
                Rs {classFee.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Set by class fee policy</span>
            </div>

            <div>
              <label
                htmlFor="discountAmount"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Scholarship / Discount (PKR)
              </label>
              <input
                id="discountAmount"
                name="discountAmount"
                type="number"
                min="0"
                value={formData.discountAmount}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Institutional fee waiver</span>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                Calculated Net Payable
              </span>
              <p className="text-xl font-bold font-mono text-emerald-950">
                Rs {netPayable.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-700 mt-1 block">Post-scholarship rate</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isAdmissionPaid"
                checked={formData.isAdmissionPaid}
                onChange={handleChange}
                className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-700"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Admission Fee Cleared
                </span>
                <span className="text-[11px] text-slate-500">
                  Mark if registration / admission fee challan has been settled.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push(`/admin/students/${studentId}`)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Student Record</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
