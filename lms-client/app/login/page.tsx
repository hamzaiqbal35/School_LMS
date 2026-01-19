"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import LandingNavbar from '@/components/LandingNavbar';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data);
            router.push('/dashboard');
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            setError(error?.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-800">
            {/* Background Shapes */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Main Angled Shape (Purple Light) - The big diagonal background */}
                <div
                    className="absolute top-0 left-0 h-full w-full lg:w-[55%] bg-purple-50"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 75% 100%, 0% 100%)' }}
                ></div>

                {/* Secondary Shape (Overlap/Depth) */}
                <div
                    className="absolute top-0 left-[-10%] h-full w-[40%] bg-purple-100/50 hidden lg:block"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0% 100%)', zIndex: -1 }}
                ></div>
            </div>

            <div className="relative z-10 w-full min-h-screen flex flex-col">
                {/* Navbar */}
                <div className="absolute top-0 w-full z-50">
                    <LandingNavbar hideLoginBtn={true} />
                </div>

                <div className="flex-1 flex flex-col lg:flex-row mt-20 lg:mt-0">
                    {/* Left Side - Illustration */}
                    <div className="w-full lg:w-[45%] flex items-center justify-center lg:pb-12 relative min-h-[400px] lg:min-h-auto">
                        <div className="relative w-[400px] h-[400px] flex items-center justify-center perspective-[1000px]">
                            {/* CSS 3D Abstract Illustration */}

                            {/* Floating Sphere 1 (Top Left) */}
                            <div className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-br from-purple-300 to-violet-500 rounded-full opacity-80 blur-2xl animate-pulse"></div>

                            {/* Floating Sphere 2 (Bottom Right) */}
                            <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-tr from-pink-300 to-purple-400 rounded-full opacity-60 blur-3xl"></div>

                            {/* Main Glass Card (Center) */}
                            <div className="relative w-64 h-80 bg-white/20 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-500 group">

                                {/* Inner Floating Elements */}
                                <div className="absolute -top-12 -right-12 w-20 h-20 bg-gradient-to-br from-orange-300 to-red-400 rounded-2xl shadow-lg rotate-12 flex items-center justify-center animate-float">
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>

                                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-tr from-blue-300 to-cyan-400 rounded-full shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>

                                {/* Central Graphic (Symbolizing LMS/Login) */}
                                <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl shadow-inner mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                    <svg className="w-12 h-12 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="w-full h-2 bg-white/30 rounded-full mb-3"></div>
                                <div className="w-3/4 h-2 bg-white/30 rounded-full"></div>

                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-24 relative">
                        <div className="w-full max-w-[420px]">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Account Login</h2>
                            <p className="text-slate-500 mb-8 text-sm">
                                If you are already a member you can login with <br /> your email address and password.
                            </p>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border border-red-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1.5 ml-1">Email address</label>
                                    <input
                                        type="email"
                                        className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-violet-400 block p-3.5 outline-none transition-all placeholder:text-slate-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1.5 ml-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-violet-400 block p-3.5 outline-none transition-all placeholder:text-slate-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            type="checkbox"
                                            className="w-4 h-4 border-slate-300 rounded text-violet-600 focus:ring-violet-500"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-500">Remember me</label>
                                    </div>
                                    <a href="#" className="text-sm font-bold text-slate-500 hover:text-violet-600">Forgot Password?</a>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full text-white bg-violet-500 hover:bg-violet-600 font-bold rounded-lg text-lg px-5 py-3.5 text-center transition-all duration-300 shadow-md hover:shadow-lg mt-2"
                                >
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
