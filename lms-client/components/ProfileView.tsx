"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import {
  Loader2,
  Camera,
  Save,
  User,
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  FileCheck2,
  BadgeCheck,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface UpdatePayload {
  fullName?: string;
  avatar?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ProfileView() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    currentPassword: ""
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Helper: Client-side Image Compression before Cloudinary Upload
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Canvas to Blob compression failed"));
              }
            },
            "image/jpeg",
            0.7
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, or WebP).");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Compressing and uploading official photograph...");

    try {
      const compressedBlob = await compressImage(file);
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, ".jpg"),
        { type: "image/jpeg" }
      );

      const uploadData = new FormData();
      uploadData.append("file", compressedFile);

      const res = await api.post("/upload/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await updateProfile({ avatar: res.data.url });
      toast.success("Institutional avatar updated successfully.", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const updateProfile = async (data: UpdatePayload) => {
    try {
      const res = await api.put("/auth/update-profile", data);
      setUser(res.data);
      return true;
    } catch (error: unknown) {
      const err = error as AxiosErrorLike;
      const message = err.response?.data?.message || "Failed to update profile.";
      toast.error(message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("New password and confirmation password do not match.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Updating institutional credentials...");
    const payload: UpdatePayload = {};

    if (formData.fullName !== user?.fullName) payload.fullName = formData.fullName;

    // Email Change Logic
    if (formData.email !== user?.email) {
      if (!formData.currentPassword) {
        toast.error("Current password is required to change institutional email.", {
          id: toastId
        });
        setIsLoading(false);
        return;
      }
      payload.email = formData.email;
      payload.currentPassword = formData.currentPassword;
    }

    if (formData.password) payload.password = formData.password;

    if (Object.keys(payload).length === 0) {
      toast.info("No credential modifications detected.", { id: toastId });
      setIsLoading(false);
      return;
    }

    const success = await updateProfile(payload);
    if (success) {
      toast.success("Profile credentials successfully verified & updated.", { id: toastId });
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
        currentPassword: ""
      }));
    }
    setIsLoading(false);
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* EXECUTIVE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {isAdmin ? "Superuser Environment" : "Certified Faculty Portal"}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">OGS-ID: {user?._id?.slice(-6).toUpperCase() || "AUTH-01"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {isAdmin ? "System Administrator Profile" : "Faculty Account & Profile"}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Institutional credentials, cryptographic security parameters, and profile identity records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit-Locked Session</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: OFFICIAL AVATAR & CREDENTIALS OVERVIEW (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AVATAR CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-sm relative bg-slate-100 ring-2 ring-emerald-800/15">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.fullName || "User Avatar"}
                    fill
                    className="object-cover"
                    sizes="128px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white text-3xl font-bold font-mono">
                    {user?.fullName?.charAt(0) || "A"}
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1" />
                    <span className="text-[10px] font-mono">Uploading...</span>
                  </div>
                )}
              </div>

              {/* Upload Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Upload official photo"
                className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-800 text-white rounded-xl shadow-md border-2 border-white hover:bg-emerald-900 hover:scale-105 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                id="avatarUpload"
                name="avatarUpload"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                aria-label="Upload Official Avatar"
              />
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {user?.fullName || "Administrative Officer"}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isAdmin ? "Super Administrator" : "Certified Faculty"}</span>
            </div>

            {/* Verification Metadata Box */}
            <div className="w-full mt-6 pt-5 border-t border-slate-100 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Security Clearance</span>
                <span className="font-semibold text-slate-800">
                  {isAdmin ? "Tier 1 Root Access" : "Classroom Scope"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Session Encryption</span>
                <span className="font-mono text-emerald-800 font-semibold">TLS / JWT Auth</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Document Storage</span>
                <span className="font-semibold text-slate-800">Cloudinary Verified</span>
              </div>
            </div>
          </div>

          {/* POLICY NOTE CARD */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Building2 className="w-4 h-4" />
              <span>Institutional Governance Notice</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Credential modifications are recorded in the institutional audit ledger. Always safeguard your password and ensure official photograph adheres to uniform dress standards.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: IDENTITY & PASSWORD MANAGEMENT (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* CARD 1: INSTITUTIONAL IDENTITY */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-7">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Institutional Identity</h3>
                  <p className="text-xs text-slate-500">Official legal name and authorized communication channel.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Tariq Siddiqui"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none text-xs transition-colors font-medium"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="off"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isAdmin}
                      placeholder="name@school.edu.pk"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs transition-colors font-medium ${
                        isAdmin
                          ? "bg-slate-50/70 text-slate-900 focus:border-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none"
                          : "bg-slate-100 text-slate-500 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {!isAdmin && (
                    <p className="text-[10px] text-slate-400">
                      Faculty email changes require administrative clearance.
                    </p>
                  )}
                </div>
              </div>

              {/* Required Current Password for Email Change */}
              {isAdmin && formData.email !== user?.email && (
                <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Current Password Required For Email Modification</span>
                  </div>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, currentPassword: e.target.value })
                      }
                      placeholder="Enter your current password to verify identity"
                      className="w-full pl-3.5 pr-10 py-2 rounded-lg bg-white border border-amber-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: PASSWORD & SECURITY PARAMETERS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-7">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Password &amp; Security</h3>
                  <p className="text-xs text-slate-500">
                    Leave fields blank to maintain your current institutional password.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none text-xs transition-colors font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none text-xs transition-colors font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Last modified session: <strong className="text-slate-700">Enforced by JWT</strong>
              </span>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-900 shadow-md shadow-emerald-950/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-emerald-200" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
