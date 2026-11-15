"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import DotGrid from "@/components/reactbits/DotGrid";

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { isAuthenticated, isCheckingAuth, checkAuth, user } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else if (user.role === "TEACHER") {
        router.replace("/teacher");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isCheckingAuth, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Verifying institutional credentials...");

    try {
      const { data } = await api.post("/auth/login", { email, password, remember });
      login(data);

      toast.success(`Welcome, ${data.fullName || "User"}!`, { id: toastId });

      if (data.role === "ADMIN") {
        router.replace("/admin");
      } else if (data.role === "TEACHER") {
        router.replace("/teacher");
      } else {
        router.replace("/");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const err = error as AxiosErrorLike;
      const message = err.response?.data?.message || "Invalid email or password.";
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950">
      {/* LEFT SIDE - ACADEMIC VISUAL PANEL */}
      <div className="hidden lg:flex w-1/2 min-h-screen bg-slate-950 text-white relative overflow-hidden flex-col justify-between p-12">
        <DotGrid gap={24} dotSize={1} color="rgba(255, 255, 255, 0.08)" fadeEdges={true} />

        {/* School Crest & Identity */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="w-13 h-13 rounded-2xl bg-white shadow-md p-1.5 flex items-center justify-center shrink-0 border border-slate-100">
              <div className="relative w-full h-full">
                <Image src="/Logo2.png" fill sizes="48px" className="object-contain" alt="School Crest" />
              </div>
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-white leading-tight">
                Oxford Grammar School
              </span>
              <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
                Cambridge EdTech Campus
              </span>
            </div>
          </Link>
        </div>

        {/* Academic Centerpiece */}
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px] font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Encrypted Academic Portal &bull; Role-Based Access
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
            Institutional Management with Integrity &amp; Precision
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light mb-8">
            Access administrative control boards, submit daily student roll calls, reconcile fee challans,
            and monitor timetable substitution schedules through an audit-locked environment.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex gap-6 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Oxford Grammar School</span>
          <Link href="/about" className="hover:text-slate-300 transition-colors">Academic Mission</Link>
          <Link href="/contact" className="hover:text-slate-300 transition-colors">Inquiries</Link>
        </div>
      </div>

      {/* RIGHT SIDE - SECURE FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-auto">
        <DotGrid gap={28} dotSize={1.1} color="rgba(15, 23, 42, 0.05)" fadeEdges={true} />

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-900/5 p-8 sm:p-10 border border-slate-200/80 relative">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800 mx-auto mb-4 border border-emerald-200/60">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Portal Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized Faculty, Staff &amp; Administrative Personnel
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  autoComplete="off"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu.pk"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none text-xs transition-colors"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Account Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer accent-emerald-800"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
                Remember institutional session for 30 days
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-full bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-900 transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Sign In to Academic Portal</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Overview
            </Link>
            <Link href="/contact" className="hover:text-emerald-800 transition-colors">
              Help Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
