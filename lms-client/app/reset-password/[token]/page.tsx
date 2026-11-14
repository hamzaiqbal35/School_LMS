"use client";

import { useState, use } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import DotGrid from "@/components/reactbits/DotGrid";

type Params = Promise<{ token: string }>;

export default function ResetPasswordPage({ params }: { params: Params }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Updating institutional credentials...");

    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      toast.success("Password updated successfully! Please sign in with your new password.", { id: toastId });
      router.push("/login");
    } catch (error) {
      console.error("Reset Password error:", error);
      const message = (error as any).response?.data?.message || "Invalid or expired token.";
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950">
      {/* LEFT SIDE - ACADEMIC VISUAL PANEL */}
      <div className="hidden lg:flex w-1/2 min-h-screen bg-slate-950 text-white relative overflow-hidden flex-col justify-between p-12">
        <DotGrid gap={24} dotSize={1} color="rgba(255, 255, 255, 0.08)" fadeEdges={true} />

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

        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px] font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cryptographic Credential Update
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
            Configure Your New Portal Password
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light mb-8">
            Create an encrypted, high-strength password. Upon confirmation, your session token will be
            reissued and your institutional privileges updated across all administrative and faculty modules.
          </p>
        </div>

        <div className="relative z-10 flex gap-6 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Oxford Grammar School</span>
          <Link href="/about" className="hover:text-slate-300 transition-colors">Academic Mission</Link>
          <Link href="/contact" className="hover:text-slate-300 transition-colors">Inquiries</Link>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-auto">
        <DotGrid gap={28} dotSize={1.1} color="rgba(15, 23, 42, 0.05)" fadeEdges={true} />

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-900/5 p-8 sm:p-10 border border-slate-200/80 relative">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800 mx-auto mb-4 border border-emerald-200/60">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Set New Password
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Minimum 6 characters, combining letters and numerals
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none text-xs transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-full bg-emerald-800 text-white font-semibold text-xs hover:bg-emerald-900 transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Update Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
