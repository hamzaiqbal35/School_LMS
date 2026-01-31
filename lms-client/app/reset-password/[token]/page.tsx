"use client";

import { useState, use } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";

type Params = Promise<{ token: string }>;

export default function ResetPasswordPage({ params }: { params: Params }) {
    // Unwrap params using React.use()
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
            toast.error("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Updating password...");

        try {
            await api.put(`/auth/resetpassword/${token}`, { password });
            toast.success("Password updated successfully!", { id: toastId });
            router.push("/login");
        } catch (error) {
            console.error("Reset Password error:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (error as any).response?.data?.message || "Invalid or expired token";
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-white font-sans text-slate-800 selection:bg-cyan-100 selection:text-cyan-900">

            {/* LEFT SIDE - VISUAL */}
            <div className="hidden lg:flex w-1/2 h-screen top-0 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">

                {/* Blob Backgrounds */}
                <motion.div
                    animate={{ opacity: [0.32, 0.44, 0.32] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-130 h-130 bg-cyan-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"
                />
                <motion.div
                    animate={{ opacity: [0.2, 0.34, 0.2] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-0 left-0 w-105 h-105 bg-teal-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-10"></div>

                {/* Logo Area */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden">
                            <Image src="/Logo2.png" fill sizes="64px" className="object-contain p-1" alt="Logo" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white uppercase italic">Oxford Grammar</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                            Secure Your <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-teal-400">Digital Access</span>
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed mb-8 font-light">
                            Create a strong, unique password to protect your account. Your security is our top priority.
                        </p>
                    </motion.div>
                </div>

                {/* Footer Strip */}
                <div className="relative z-10 flex gap-8 text-sm text-slate-500 font-medium">
                    <span>© {new Date().getFullYear()} Oxford Grammar School</span>
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="flex-1 flex flex-col justify-start items-center p-8 bg-slate-50/50 backdrop-blur-sm relative overflow-auto">

                {/* Decorative background for mobile */}
                <div className="lg:hidden absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/40 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45 }}
                    className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-12 border border-slate-100 relative group mt-10 md:mt-20"
                >
                    {/* Top Accent Bar */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-linear-to-r from-cyan-500 to-teal-500 rounded-b-full"></div>

                    <div className="mb-8 text-center">
                        <motion.div
                            whileHover={{ rotate: 5 }}
                            className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mx-auto mb-6 shadow-sm border border-cyan-100/50"
                        >
                            <Lock className="w-8 h-8" />
                        </motion.div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Set New Password</h2>
                        <p className="text-base text-slate-500 font-medium px-4">Please enter your new password below. Make sure it&apos;s strong!</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* PASSWORD */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all font-medium shadow-sm hover:border-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all font-medium shadow-sm hover:border-slate-300"
                                />
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <motion.button
                            disabled={isLoading}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-xl hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Reset Password</span>
                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-cyan-600 transition-all group px-4 py-2 rounded-xl hover:bg-cyan-50">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                        </Link>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
