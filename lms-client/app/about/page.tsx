// Link import removed
import LandingNavbar from "@/components/LandingNavbar";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-purple-100">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in-up">
                        Our Mission
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight animate-fade-in-up [animation-delay:200ms]" style={{ animationFillMode: 'both' }}>
                        Empowering the Future of <span className="text-purple-600">Education.</span>
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed mb-16 animate-fade-in-up [animation-delay:400ms]" style={{ animationFillMode: 'both' }}>
                        CampusAxis is dedicated to streamlining school management, fostering better communication, and enabling students and educators to focus on what matters most: learning.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-purple-50 transition-all duration-300">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Innovation</h3>
                        <p className="text-slate-500">Constantly pushing boundaries to provide state-of-the-art tools for modern education.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-purple-50 transition-all duration-300">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Integrity</h3>
                        <p className="text-slate-500">Building trust with secure, reliable, and transparent systems for all users.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-purple-50 transition-all duration-300">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Community</h3>
                        <p className="text-slate-500">Creating an inclusive environment that brings students, teachers, and parents together.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
