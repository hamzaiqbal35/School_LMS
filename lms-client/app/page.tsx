import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "@/components/LandingNavbar";

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-slate-800 selection:bg-purple-100 overflow-x-hidden bg-white">
      {/* Navbar */}
      <LandingNavbar />

      <main>
        {/* NEW HERO SECTION (Learnly Style) */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-6 relative">

            {/* Centered Content */}
            <div className="max-w-4xl mx-auto text-center relative z-20">

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1] animate-fade-in-up [animation-delay:100ms]" style={{ animationFillMode: 'both' }}>
                Manage Your School<br />
                <span className="font-serif italic text-violet-600">With One System</span>
              </h1>

              <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up [animation-delay:200ms]" style={{ animationFillMode: 'both' }}>
                A centralized platform for administrators and teachers to manage students, attendance, and fees efficiently.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up [animation-delay:300ms]" style={{ animationFillMode: 'both' }}>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-purple-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Log In
                </Link>
              </div>
            </div>

            {/* Left Side Image (Male Student) */}
            <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-0 w-[350px] h-[450px] z-10 animate-fade-in-up [animation-delay:400ms]" style={{ animationFillMode: 'both' }}>
              <div className="relative w-full h-full" style={{ clipPath: 'polygon(20% 0%, 100% 0, 100% 20%, 100% 80%, 100% 100%, 0 100%, 0% 80%, 0% 20%)' }}>
                <div className="absolute inset-0 bg-slate-100 transform -rotate-3 rounded-[3rem]"></div>
                <div className="absolute inset-0 overflow-hidden transform rotate-0 hover:rotate-2 transition-transform duration-700 ease-out">
                  <div className="w-full h-full relative" style={{ clipPath: 'polygon(10% 0, 100% 15%, 85% 100%, 0% 75%)' }}>
                    <Image
                      src="/images/student-male.png"
                      alt="Student"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Image (Female Student) */}
            <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-0 w-[350px] h-[450px] z-10 animate-fade-in-up [animation-delay:500ms]" style={{ animationFillMode: 'both' }}>
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-slate-100 transform rotate-3 rounded-[3rem]"></div>
                <div className="absolute inset-0 overflow-hidden transform rotate-0 hover:-rotate-2 transition-transform duration-700 ease-out">
                  <div className="w-full h-full relative" style={{ clipPath: 'polygon(20% 10%, 100% 0, 90% 85%, 0% 100%)' }}>
                    <Image
                      src="/images/student-female.png"
                      alt="Student"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-slate-50 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Student Records */}
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Student Records</h4>
                  <p className="text-sm text-slate-500">Centralized Management</p>
                </div>
              </div>

              {/* Attendance System */}
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-full bg-green-100/50 flex items-center justify-center text-green-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Attendance</h4>
                  <p className="text-sm text-slate-500">Daily Tracking</p>
                </div>
              </div>

              {/* Fee Management */}
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-full bg-yellow-100/50 flex items-center justify-center text-yellow-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Fee Management</h4>
                  <p className="text-sm text-slate-500">Invoices & Reports</p>
                </div>
              </div>

              {/* User Roles */}
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-full bg-purple-100/50 flex items-center justify-center text-purple-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">User Roles</h4>
                  <p className="text-sm text-slate-500">Admin & Teacher Access</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us - Bento Grid */}
        <section className="py-24 bg-white" id="why-us">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-sm font-bold tracking-widest text-purple-600 uppercase mb-3 animate-fade-in-up">Why CampusAxis?</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]" style={{ animationFillMode: 'both' }}>
                More than just an <span className="text-purple-600">LMS.</span>
              </h3>
              <p className="text-lg text-slate-500 animate-fade-in-up [animation-delay:200ms]" style={{ animationFillMode: 'both' }}>
                We&apos;re redefining the educational experience with a platform that&apos;s built for the future of learning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

              {/* Bento Item 1: Large Feature */}
              <div className="md:col-span-2 row-span-1 rounded-3xl bg-slate-50 border border-slate-100 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500 animate-fade-in-up [animation-delay:300ms]" style={{ animationFillMode: 'both' }}>
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/hero-dashboard.png"
                    alt="Dashboard Background"
                    fill
                    className="object-cover opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-sm scale-110 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-purple-50/50"></div>
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-200 transition-colors z-0 opacity-50"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-2">Digital Campus Ecosystem</h4>
                    <p className="text-slate-500 max-w-sm font-medium">Manage entire academic operations from a single, unified dashboard. From admissions to alumni, we cover it all.</p>
                  </div>
                  <div className="w-full h-24 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50 flex items-center p-4 gap-4 mt-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex-shrink-0 animate-pulse"></div>
                    <div className="space-y-2 w-full">
                      <div className="h-2 w-3/4 bg-slate-200 rounded-full"></div>
                      <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Item 2: Stat Card */}
              <div className="rounded-3xl bg-purple-600 p-8 text-white relative overflow-hidden group hover:shadow-xl hover:shadow-purple-200 transition-all duration-500 animate-fade-in-up [animation-delay:400ms]" style={{ animationFillMode: 'both' }}>
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/hero-students.png"
                    alt="Students"
                    fill
                    className="object-cover mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity duration-700 grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-indigo-700/90 mix-blend-multiply"></div>
                </div>

                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mb-10 group-hover:scale-125 transition-transform duration-700"></div>

                <div className="relative z-10 flex flex-col h-full justify-center text-center">
                  <h4 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200">99.9%</h4>
                  <p className="text-purple-100 font-medium text-lg">Uptime Reliability</p>
                  <div className="bg-white/10 rounded-full px-3 py-1 mt-4 inline-flex items-center justify-center mx-auto backdrop-blur-sm border border-white/10">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    <span className="text-xs text-white/90">System Online</span>
                  </div>
                </div>
              </div>

              {/* Bento Item 3: Feature Vertical */}
              <div className="rounded-3xl bg-orange-50 border border-orange-100 p-8 relative overflow-hidden group hover:shadow-xl hover:shadow-orange-100 transition-all duration-500 animate-fade-in-up [animation-delay:500ms]" style={{ animationFillMode: 'both' }}>
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/hero-dashboard.png"
                    alt="Analytics"
                    fill
                    className="object-cover opacity-0 group-hover:opacity-10 transition-opacity duration-700 sepia"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-orange-50/80 to-white/90"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-500 mb-6">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Smart Analytics</h4>
                  <p className="text-slate-500 mb-auto text-sm">AI-driven insights to track student performance and predict outcomes.</p>

                  {/* Mini Chart Mock */}
                  <div className="flex items-end justify-between gap-1 h-32 w-full mt-4 opacity-70 group-hover:opacity-100 transition-opacity duration-500 pb-2 border-b border-orange-200">
                    <div className="w-1/5 bg-orange-300 rounded-t-sm h-[40%] group-hover:h-[60%] transition-all duration-700"></div>
                    <div className="w-1/5 bg-orange-400 rounded-t-sm h-[70%] group-hover:h-[85%] transition-all duration-700 delay-75"></div>
                    <div className="w-1/5 bg-orange-300 rounded-t-sm h-[50%] group-hover:h-[55%] transition-all duration-700 delay-150"></div>
                    <div className="w-1/5 bg-orange-500 rounded-t-sm h-[80%] group-hover:h-[95%] transition-all duration-700 delay-200"></div>
                  </div>
                </div>
              </div>

              {/* Bento Item 4: Feature Horizontal */}
              <div className="md:col-span-2 row-span-1 rounded-3xl bg-white border border-slate-100 p-8 flex flex-col md:flex-row items-center gap-8 group hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 animate-fade-in-up [animation-delay:600ms] relative overflow-hidden" style={{ animationFillMode: 'both' }}>
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/hero-students.png"
                    alt="Security"
                    fill
                    className="object-cover opacity-0 group-hover:opacity-5 transition-opacity duration-700"
                    style={{ objectPosition: 'top center' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-blue-50/30"></div>
                </div>

                <div className="flex-1 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Enterprise-Grade Security</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Your data is yours. We employ state-of-the-art encryption and privacy protocols to ensure your institution&apos;s information remains secure and compliant.</p>
                </div>
                <div className="w-full md:w-1/3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 transform rotate-3 group-hover:rotate-0 transition-transform duration-500 border border-slate-100 text-center relative z-10 shadow-sm">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">GDPR Compliant</p>
                  <p className="text-xs text-slate-400 mt-1">Certified Safe</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pre-Footer CTA */}
        <section className="py-24 relative overflow-hidden bg-slate-50">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] p-12 md:p-16 text-center shadow-2xl shadow-purple-200 relative overflow-hidden group">
              {/* Animated Background Shapes */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight relative z-10">
                Access Your <br />
                <span className="text-purple-100">Campus Portal</span>
              </h2>
              <p className="text-lg text-purple-100 mb-10 max-w-2xl mx-auto relative z-10 font-medium">
                Secure login for faculty and administration. Manage your academic activities efficiently.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-full bg-white text-purple-900 font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-xl shadow-black/5"
                >
                  Login to Dashboard
                </Link>
                <Link href="/contact" className="px-8 py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-all hover:border-white flex items-center justify-center">
                  Help & Support
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white pt-10 pb-10 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

              {/* Brand Column */}
              <div className="space-y-6 max-w-sm">
                <div className="flex items-center gap-2">
                  <div className="relative w-96 h-16">
                    <Image
                      src="/Logo.png"
                      alt="CampusAxis"
                      fill
                      className="object-contain object-left-top"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                </div>
                <p className="text-slate-500 leading-relaxed max-w-sm">
                  Empowering the next generation of learners with an offline-first, beautiful, and robust management system.
                </p>
                <div className="flex gap-4">
                  {/* Twitter / X */}
                  <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-all cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161-.334-3.876-5.87h-.732l4.238 6.419z" /></svg>
                  </a>
                  {/* GitHub */}
                  <a href="#" aria-label="GitHub" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-all cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.69-3.795-1.455-3.795-1.455-.54-1.38-1.335-1.755-1.335-1.755-1.08-.75.075-.735.075-.735 1.185.09 1.815 1.245 1.815 1.245 1.065 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  </a>
                  {/* Discord */}
                  <a href="#" aria-label="Discord" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-all cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.772-.608 1.158a18.753 18.753 0 00-5.493 0 12.645 12.645 0 00-.623-1.158.074.074 0 00-.078-.037A19.736 19.736 0 003.67 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057c2.053 1.508 4.041 2.423 5.993 3.03a.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.041-.106c-.653-.248-1.274-.55-1.872-.892a.077.077 0 01-.008-.128 10.2 10.2 0 01.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127c-.599.343-1.22.644-1.873.892a.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028c1.961-.607 3.95-1.522 6.002-3.03a.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" /></svg>
                  </a>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-6 lg:items-end mt-0">
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-slate-900">Support</h4>
                  <ul className="space-y-4 text-sm text-slate-500">
                    <li><Link href="/contact" className="hover:text-purple-600 transition-colors">Contact Support</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} CampusAxis Inc. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-slate-400">
                <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
