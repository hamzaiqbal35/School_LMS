"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Signing you in...");

        try {
            const { data } = await api.post("/auth/login", { email, password });
            login(data);

            toast.success(`Welcome, ${data.fullName || "User"}!`, { id: toastId });

            // Redirect based on role
            if (data.role === "ADMIN") {
                router.push("/admin");
            } else if (data.role === "TEACHER") {
                router.push("/teacher");
            } else {
                router.push("/");
            }
        } catch (error: unknown) {
            console.error("Login error:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            const message = err.response?.data?.message || "Invalid email or password";
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
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                            Education <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-teal-400">Reimagined</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-8 font-light">
                            Experience the most intuitive school management platform. Streamline operations, empower teachers, and engage students with a state-of-the-art interface.
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
                    className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-12 border border-slate-100 relative group"
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
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
                        <p className="text-base text-slate-500 font-medium px-4">Securely access your institution&apos;s educational portal.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* EMAIL */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                    <input
                                        id="email"
                                        name="email"
                                        autoComplete="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@institution.edu"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all font-medium shadow-sm hover:border-slate-300"
                                    />
                                </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>
                                <a href="#" className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline underline-offset-4">Forgot Password?</a>
                            </div>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                <input
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
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

                        {/* LOGIN BUTTON */}
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
                                    <span>Sign In</span>
                                    <ArrowLeft className="w-5 h-5 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Need help? <Link href="/contact" className="font-bold text-cyan-600 hover:text-cyan-700 hover:underline underline-offset-4">Support Center</Link>
                        </p>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-cyan-600 transition-all group px-4 py-2 rounded-xl hover:bg-cyan-50">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                        </Link>
                    </div>

                </motion.div>

                {/* Visual Accent */}
                <div className="mt-12 text-slate-400 flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-50">
                    <span className="h-px w-8 bg-slate-200"></span>
                    Trusted by Professionals
                    <span className="h-px w-8 bg-slate-200"></span>
                </div>
            </div>
        </div>
    );
}
