"use client";

import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "@/components/LandingNavbar";
import { ArrowRight, CheckCircle2, BarChart3, ShieldCheck, Users, Globe2, Sparkles, School, GraduationCap, LayoutDashboard, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50 overflow-x-hidden selection:bg-cyan-100 selection:text-cyan-900">
      <LandingNavbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
          {/* Abstract Background Blobs - Cyan/Teal/Blue Theme */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob [animation-delay:2000ms]"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob [animation-delay:4000ms]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left Content */}
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-sm font-semibold mb-8 animate-fade-in-up shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-600"></span>
                  </span>
                  The Future of Education Management
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1] animate-fade-in-up [animation-delay:100ms]">
                  Streamline Your <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-600 to-teal-600">Entire Institute</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
                  Oxford Grammar School is the all-in-one educational hub tailored for modern academic excellence. Manage admissions, attendance, fees, and exams effortlessly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up [animation-delay:300ms]">
                  <Link
                    href="/login"
                    className="px-8 py-4 rounded-full bg-cyan-600 text-white font-bold text-lg shadow-lg shadow-cyan-200 hover:bg-cyan-700 hover:shadow-xl hover:shadow-cyan-200/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="#features"
                    className="px-8 py-4 rounded-full bg-white border-2 border-slate-100 text-slate-700 font-bold text-lg hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center"
                  >
                    Learn More
                  </Link>
                </div>

                <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 animate-fade-in-up [animation-delay:400ms]">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative shadow-sm">
                        <Image
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                          fill
                          sizes="40px"
                          className="object-cover"
                          alt="User"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="border-l border-slate-300 pl-6">
                    <p className="font-bold text-slate-900">Active Users</p>
                    <p className="text-slate-500">Across Institutions</p>
                  </div>
                </div>
              </div>

              {/* Right Visual */}
              <div className="lg:w-1/2 relative animate-fade-in-up [animation-delay:500ms] w-full">
                <div className="relative z-10 bg-white/50 backdrop-blur-sm rounded-[2rem] p-4 shadow-2xl shadow-cyan-100/50 border border-white/60 w-full">
                  <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative w-full h-0 pb-[62.5%] shadow-inner group">
                    <div className="absolute inset-0 w-full h-full">
                      <Image
                        src="/images/hero-dashboard.png"
                        alt="Dashboard Preview"
                        fill
                        sizes="(max-width: 1023px) 100vw, 640px"
                        className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                        priority
                      />
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -inset-10 bg-gradient-to-tr from-cyan-400/20 to-teal-400/20 rounded-full blur-[100px] -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGO SCROLL / TRUSTED BY */}
        <section className="py-12 border-y border-slate-100 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center mb-10">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Designed for Complete School Operations</p>
          </div>
          <div className="relative flex overflow-x-hidden group">
            <div className="py-2 animate-infinite-scroll whitespace-nowrap flex gap-12 sm:gap-24 items-center opacity-70 transition-all duration-500">
              {[
                { icon: Users, label: 'Admissions & Student Records' },
                { icon: School, label: 'Class & Section Management' },
                { icon: GraduationCap, label: 'Teacher Assignment & Attendance' },
                { icon: ShieldCheck, label: 'Manual Fee Verification' },
                { icon: BookOpen, label: 'Challan & Voucher Generation' },
                { icon: BarChart3, label: 'Reports & Audit Logs' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 px-4 py-2 rounded-lg bg-white/0 hover:bg-white/5">
                  <item.icon className="w-8 h-8 text-cyan-600" />
                  <span className="text-lg font-semibold text-slate-700">{item.label}</span>
                </div>
              ))}

              {/* Duplicate sequence to ensure smooth infinite loop */}
              {[
                { icon: Users, label: 'Admissions & Student Records' },
                { icon: School, label: 'Class & Section Management' },
                { icon: GraduationCap, label: 'Teacher Assignment & Attendance' },
                { icon: ShieldCheck, label: 'Manual Fee Verification' },
                { icon: BookOpen, label: 'Challan & Voucher Generation' },
                { icon: BarChart3, label: 'Reports & Audit Logs' },
              ].map((item, idx) => (
                <div key={`dup-${idx}`} className="flex items-center gap-4 px-4 py-2 rounded-lg bg-white/0 hover:bg-white/5">
                  <item.icon className="w-8 h-8 text-cyan-600" />
                  <span className="text-lg font-semibold text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-32 bg-slate-50 relative overflow-hidden">
          {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-200 h-200 bg-cyan-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 z-0"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-base font-bold text-cyan-600 tracking-wider uppercase mb-3">Powerful Features</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Everything you need to <br />run your school efficiently.</h3>
              <p className="text-lg text-slate-500 leading-relaxed">
                Stop juggling multiple platforms. Oxford Grammar unifies your entire school experience into one beautiful, intuitive interface designed for students and staff.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-cyan-100/50 hover:-translate-y-2 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-linear-to-br from-cyan-50 to-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 mb-8 group-hover:scale-110 transition-transform shadow-inner">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Smart Dashboard</h4>
                <p className="text-slate-500 leading-relaxed">
                  View all critical metrics at a glance. Attendance, fees, and academic performance in one unified, customizable view.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-teal-100/50 hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-linear-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-8 group-hover:scale-110 transition-transform shadow-inner">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Student & Staff</h4>
                <p className="text-slate-500 leading-relaxed">
                  Effortlessly manage student records, teacher profiles, and staff documentation with secure, role-based access controls.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform shadow-inner">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Advanced Analytics</h4>
                <p className="text-slate-500 leading-relaxed">
                  Make data-driven decisions with detailed reports on student performance, financial health, and institutional growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ALTERNATING FEATURES */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 space-y-32">

            {/* Section 1 */}
            <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
              <div className="md:w-1/2 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 rotate-1 hover:rotate-0 transition-transform duration-700">
                  <Image
                    src="/images/hero-students.png"
                    alt="Students Management"
                    width={800}
                    height={600}
                    className="object-cover w-full h-auto"
                  />
                </div>
                {/* Blob Backdrops */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-100/50 rounded-full blur-3xl -z-10 opacity-60"></div>
              </div>
              <div className="md:w-1/2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                  <Sparkles className="w-4 h-4" />
                  Smart Attendance
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Track Attendance with <br /><span className="text-cyan-600">Zero Hassle.</span></h2>
                <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                  Say goodbye to paper registers. Our digital attendance system allows teachers to mark attendance in seconds, triggering automated notifications to parents for absentees.
                </p>
                <ul className="space-y-5">
                  {[
                    'Real-time syncing across all devices',
                    'Monthly attendance reports generation' 
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-slate-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-16 lg:gap-24">
              <div className="md:w-1/2 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 -rotate-1 hover:rotate-0 transition-transform duration-700">
                  <Image
                    src="/images/student-male.png"
                    alt="Fee Management"
                    width={800}
                    height={600}
                    className="object-cover w-full h-auto"
                  />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-100/50 rounded-full blur-3xl -z-10 opacity-60"></div>
              </div>
              <div className="md:w-1/2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-xs font-bold uppercase tracking-wider mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  Secure Finance
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Fee Management <br /><span className="text-teal-600">Made Simple.</span></h2>
                <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                  Complete financial control for your institution. Generate invoices, track pending payments, and accept online fee payments securely without the headache.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* BENTO GRID (Refined) */}
        <section className="py-32 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Why Choose Oxford Grammar?</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Built for scalability, reliability, and ease of use.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-150">

              {/* Large Item */}
              <div className="md:col-span-2 md:row-span-2 w-full h-full bg-white rounded-4xl p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-cyan-100/50 transition-all duration-500 relative overflow-hidden group text-left flex flex-col justify-between">
                <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                  <Globe2 className="w-64 h-64 text-cyan-600" />
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6 shadow-sm">
                    <School className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">Complete Ecosystem</h3>
                  <p className="text-slate-500 text-lg leading-relaxed max-w-md">From admission inquiries to final exam results, we cover every single aspect of school life in one seamless journey.</p>
                </div>
                <div className="w-full h-48 bg-slate-50 rounded-2xl mt-10 border border-slate-100 relative overflow-hidden ring-1 ring-slate-100">
                  {/* Mock UI */}
                  <div className="absolute top-6 left-6 right-6 h-3 bg-slate-200 rounded-full opacity-50"></div>
                  <div className="absolute top-14 left-6 w-2/3 h-3 bg-slate-200 rounded-full opacity-40"></div>
                  <div className="absolute bottom-0 w-full h-32 bg-linear-to-t from-cyan-50 to-transparent"></div>
                </div>
              </div>

              {/* Medium Item */}
              <div className="md:col-span-2 md:row-span-1 bg-linear-to-r from-cyan-600 to-teal-600 rounded-4xl p-10 shadow-xl text-white text-left flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-extrabold mb-3">99.99% Uptime</h3>
                  <p className="text-cyan-50 text-lg font-medium opacity-90">Reliable cloud infrastructure you can trust 24/7. Never experience downtime during critical exam periods.</p>
                </div>
              </div>

              {/* Small Item 1 */}
              <div className="md:col-span-1 md:row-span-1 bg-white rounded-4xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-center group">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 px-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xl text-slate-900 mb-2">Easy Setup</h4>
                <p className="text-slate-500 text-sm">Get started in under 5 minutes.</p>
              </div>

              {/* Small Item 2 */}
              <div className="md:col-span-1 md:row-span-1 bg-white rounded-4xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-center group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 px-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xl text-slate-900 mb-2">For Everyone</h4>
                <p className="text-slate-500 text-sm">K-12, Colleges & Universities.</p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-cyan-900/20">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-cyan-600/20 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 right-0 w-100 h-100 bg-teal-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                Ready to transform <br /> your institution?
              </h2>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light">
                Join the legacy of excellence with us for a brighter, more successful future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="px-10 py-4 rounded-full bg-cyan-500 text-white font-bold text-lg hover:bg-cyan-400 hover:shadow-cyan-400/50 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  Get Started Now
                </Link>
                <Link
                  href="/contact"
                  className="px-10 py-4 rounded-full bg-transparent border border-white/20 text-white font-bold text-lg hover:bg-white/10 hover:border-white/40 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="col-span-1 md:col-span-2 pr-10">
                <div className="relative w-48 h-12 mb-8">
                  <Image
                    src="/Logo2.png"
                    alt="Oxford Grammar School Logo"
                    fill
                    sizes="192px"
                    className="object-contain object-left"
                  />
                </div>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  Empowering education with technology. We build tools that help schools focus on what matters most - teaching and learning.
                </p>
                <div className="flex gap-4">
                  {/* Social Icons Placeholder */}
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-6 text-lg">Product</h4>
                <ul className="space-y-4 text-slate-500">
                  <li><a href="#features" className="hover:text-cyan-600 transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-cyan-600 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-cyan-600 transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-cyan-600 transition-colors">Changelog</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-6 text-lg">Company</h4>
                <ul className="space-y-4 text-slate-500">
                  <li><a href="/about" className="hover:text-cyan-600 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-cyan-600 transition-colors">Careers</a></li>
                  <li><a href="/contact" className="hover:text-cyan-600 transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-cyan-600 transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 font-medium">
              <p>&copy; {new Date().getFullYear()} Oxford Grammar School. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
