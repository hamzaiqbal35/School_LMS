"use client";

import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "@/components/LandingNavbar";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import SplitText from "@/components/reactbits/SplitText";
import CountUp from "@/components/reactbits/CountUp";
import Magnet from "@/components/reactbits/Magnet";
import ShinyText from "@/components/reactbits/ShinyText";
import DotGrid from "@/components/reactbits/DotGrid";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck,
  Building2,
  Layers,
  ChevronRight,
  BookOpen,
  Receipt,
  Users2,
  GraduationCap,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Compass,
  ChevronDown
} from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does Oxford Grammar School structure its dual Cambridge and Matric tracks?",
      a: "Our students follow a unified rigorous foundational curriculum through Class 8. In Class 9, students choose between the Cambridge International O-Level track (CAIE Center PK-482) or the Board of Secondary Education Karachi (BIEK) Matriculation stream (Science or Computer Science), each supported by dedicated certified faculty.",
    },
    {
      q: "How are bank fee challans generated, verified, and paid?",
      a: "The LMS automatically computes class-wise fee schedules, exam charges, and lab funds to generate standardized 3-part bank challans (Bank, School, and Student copies) complete with scannable QR verification codes. Payments can be deposited at authorized partner bank branches or verified online.",
    },
    {
      q: "How does the faculty substitution matrix handle teacher absences?",
      a: "When a teacher applies for leave, our timetable conflict detector scans available faculty who share matching subject qualifications and free periods. The system schedules a verified substitution in seconds, ensuring zero unattended classroom periods.",
    },
    {
      q: "What attendance protections are implemented to prevent retroactive tampering?",
      a: "Daily roll-call is marked by homeroom teachers before 08:30 AM. Once finalized, school administrators apply an audit-lock freeze to the records, creating an immutable permanent attendance log for both students and staff.",
    },
    {
      q: "What co-curricular and laboratory facilities are available on campus?",
      a: "Our campus houses dedicated Chemistry, Physics, and Biology laboratories, high-speed computer science & robotics labs, an extensive academic library, audio-visual seminar halls, and regulated outdoor athletic grounds.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden">
      <LandingNavbar />

      <main className="relative pt-28 md:pt-36">
        {/* Subtle Mathematical Dot Grid Background (React Bits) */}
        <DotGrid gap={28} dotSize={1.1} color="rgba(15, 23, 42, 0.07)" fadeEdges={true} />

        {/* ========================================================
            HERO SECTION: ACADEMIC GOVERNANCE
        ======================================================== */}
        <section className="relative px-6 max-w-7xl mx-auto pb-20 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left 7 Columns: Editorial Headline & Credentials */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* High-Contrast Announcement Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-semibold mb-6 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-700"></span>
                </span>
                <span className="font-semibold text-emerald-950 tracking-wide text-xs">
                  Cambridge International &amp; Matric Board Affiliated 2026–2027
                </span>
              </div>

              {/* Display Headline with SplitText */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tight text-slate-900 leading-[1.08] mb-6">
                <SplitText
                  text="Academic Governance for the Modern Institution"
                  delay={0.05}
                  splitBy="words"
                />
              </h1>

              {/* Grounded Human Copy */}
              <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed">
                Oxford Grammar &amp; Cambridge EdTech School consolidates primary,
                matriculation, and Cambridge O-Level operations into a single high-integrity
                operating system. Verified bank fee challans, audit-locked daily attendance,
                and conflict-free faculty substitution.
              </p>

              {/* CTAs with Magnet Button */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Magnet strength={14}>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-800 text-white font-semibold text-sm hover:bg-emerald-900 shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all group"
                  >
                    <span>Access Academic Portal</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-emerald-200" />
                  </Link>
                </Magnet>
              </div>

              {/* Institutional Quality Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/80 w-full text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>CAIE Center PK-482</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>BIEK Recognized</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Automated Challans</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Audit-Locked Records</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Interactive Institutional Hub */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                {/* Main Interactive System Preview Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-900/5 relative overflow-hidden">
                  {/* Top Bar: Live Status */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Oxford Grammar School</div>
                        <div className="text-[10px] text-slate-500">Live Campus Operations &bull; Academic Year 2026–27</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Active Term
                    </span>
                  </div>

                  {/* Operational Widget 1: Daily Attendance Audit */}
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-semibold text-slate-800">Today&apos;s Student Attendance</span>
                      </div>
                      <span className="text-[11px] font-mono-code font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        <CountUp to={96.4} decimals={1} suffix="%" />
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: "96.4%" }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                      <span>Present: 1,428 Students</span>
                      <span>Enrolled: 1,481</span>
                    </div>
                  </div>

                  {/* Operational Widget 2: Period & Substitution Schedule */}
                  <div className="rounded-xl border border-slate-200/80 p-3.5 mb-4 bg-white">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Current Period (Period 3 &bull; 09:30 - 10:15)
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">Room 204</span>
                    </div>
                    <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">Class 10-A (Science Group)</div>
                        <div className="text-[11px] text-slate-500">Advanced Chemistry &bull; Lab Practical</div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">
                        Sir Tariq Siddiqui
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between bg-indigo-50/60 border border-indigo-100 rounded-lg p-2.5 text-xs">
                      <div>
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <span>Class 9-B Mathematics</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 bg-indigo-200 text-indigo-800 font-bold rounded">Substituted</span>
                        </div>
                        <div className="text-[11px] text-indigo-700/80">Covering for absent faculty</div>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-900 bg-white border border-indigo-200 px-2 py-1 rounded">
                        Ms. Ayesha Khan
                      </span>
                    </div>
                  </div>

                  {/* Operational Widget 3: Official Bank Fee Challan Preview */}
                  <div className="rounded-xl border border-emerald-800/30 bg-radial from-emerald-50/40 to-white p-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-emerald-700" />
                          <span>Bank Fee Challan (Triple Copy)</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          Challan #OGS-2026-0814
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Muhammad Haris Khan &bull; Class 10-Matric
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8 text-slate-800" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200/80 text-xs">
                      <span className="text-[11px] text-slate-500">Payable by Due Date:</span>
                      <span className="font-bold font-mono-code text-slate-900 text-sm">PKR 11,800</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -inset-2 bg-emerald-600/5 rounded-3xl -z-10 blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            KEY OPERATIONAL METRICS (WITH COUNT-UP)
        ======================================================== */}
        <section className="border-y border-slate-200/90 bg-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                  <CountUp to={1480} suffix="+" />
                </span>
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
                  Enrolled Students
                </span>
                <span className="text-xs text-slate-500 mt-0.5">Primary, Matric &amp; O-Levels</span>
              </div>

              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                  <CountUp to={58} />
                </span>
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
                  Accredited Faculty
                </span>
                <span className="text-xs text-slate-500 mt-0.5">Cambridge Certified Teachers</span>
              </div>

              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-800">
                  <CountUp to={98.6} decimals={1} suffix="%" />
                </span>
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
                  Board Pass Rate
                </span>
                <span className="text-xs text-slate-500 mt-0.5">BIEK &amp; CAIE Distinctions</span>
              </div>

              <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                  <CountUp to={100} suffix="%" />
                </span>
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider mt-1">
                  Digital Reconciliation
                </span>
                <span className="text-xs text-slate-500 mt-0.5">Bank Challans with QR Verification</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            CAMPUS LIFE & REAL EDUCATIONAL FACILITIES (UNSPLASH REAL IMAGERY)
        ======================================================== */}
        <section id="campus" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full mb-3">
              Campus Environment &amp; Infrastructure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              State-of-the-Art Academic Infrastructure
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
              Explore our purpose-built campus in Karachi, designed with specialized STEM laboratories,
              a comprehensive academic library, and collaborative seminar rooms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Facility 1: Science Lab */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80"
                  alt="Cambridge Science & Chemistry Laboratory"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/20">
                  STEM Laboratory
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    Cambridge Science Practicals
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dedicated Chemistry, Physics, and Biology stations fully equipped for O-Level and Matric practical examinations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
                  <span>Standard Safety Certified</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Facility 2: Central Library */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
                  alt="Oxford Academic Central Library"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/20">
                  Central Library
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    Resource &amp; Research Center
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Over 15,000 academic titles, past paper archives, quiet study carrels, and digital research terminals.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
                  <span>Silent Study Zone</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Facility 3: Classroom / Mentorship */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80"
                  alt="Interactive Modern Classrooms"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/20">
                  Academic Wing
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    Interactive Multimedia Rooms
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Low student-to-teacher ratio (1:20) ensuring personalized attention, continuous formative assessment, and debate.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
                  <span>Climate Controlled</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Facility 4: Campus Grounds */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
                  alt="Collegiate Campus Grounds"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/20">
                  Campus Grounds
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    Collegiate Atmosphere
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Secure 24/7 guarded premises, dedicated assembly lawns, sports courts, and hygienic cafeteria facilities.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
                  <span>CCTV Monitored</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BENTO GRID FEATURE MATRIX (REACT BITS SPOTLIGHT CARDS)
        ======================================================== */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full mb-3">
              Core Institutional Modules
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Engineered for Institutional Accountability
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
              Every system is purpose-built to eliminate paperwork delays, ensure fiscal clarity,
              and prevent instructional downtime across all campuses.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Bento Card 1: Fee Challans & Banking (7 Columns) */}
            <SpotlightCard className="md:col-span-7 flex flex-col justify-between" spotlightColor="rgba(15, 81, 50, 0.08)">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                  <Receipt className="w-5 h-5 text-emerald-800" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                  Automated Bank Fee Challan Lifecycle
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Generate print-ready, bank-standard three-part fee challans (Bank Copy, School Copy, Student Copy)
                  rendered via Puppeteer. Features automated tuition calculation, mid-term exam fees, laboratory funds,
                  and embedded scannable QR verification codes.
                </p>

                {/* Micro Visual inside Card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 font-mono-code text-xs text-slate-700">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-[11px] font-bold text-slate-900">
                    <span>CHALLAN VERIFICATION</span>
                    <span className="text-emerald-700">STATUS: VERIFIED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px]">
                    <div>Tuition Fee (Monthly): PKR 8,500</div>
                    <div>Exam &amp; Lab Fund: PKR 2,700</div>
                    <div>Due Date: 10th of Month</div>
                    <div className="text-slate-900 font-bold">Total: PKR 11,200</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Direct reconciliation via Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </SpotlightCard>

            {/* Bento Card 2: Faculty Substitution Matrix (5 Columns) */}
            <SpotlightCard className="md:col-span-5 flex flex-col justify-between" spotlightColor="rgba(99, 102, 241, 0.08)">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-5">
                  <Calendar className="w-5 h-5 text-indigo-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                  Intelligent Faculty Substitution
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  When a teacher logs leave, the substitution engine instantly identifies available faculty
                  with matching subject qualifications and free timetable slots, eliminating vacant classroom periods.
                </p>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-xs">
                  <div className="flex items-center justify-between font-semibold text-indigo-950 mb-1">
                    <span>Period Conflict Detector</span>
                    <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-1.5 py-0.5 rounded font-bold">AUTOMATED</span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 leading-snug">
                    Zero schedule overlap guarantee with real-time teacher availability scanning.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
                <span>View Substitution Timetable</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </SpotlightCard>

            {/* Bento Card 3: Attendance Audit & Freezing (5 Columns) */}
            <SpotlightCard className="md:col-span-5 flex flex-col justify-between" spotlightColor="rgba(15, 81, 50, 0.08)">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5 text-emerald-800" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                  Audit-Locked Attendance
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Streamlined daily roll-call interface for class teachers. Administrators enforce cryptographic
                  attendance freezing at cut-off times, completely preventing retroactive tampering with academic records.
                </p>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Attendance Freeze Protocol</div>
                    <div className="text-[11px] text-slate-500">Secured with administrative role-checks</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Role-based access enforced</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </SpotlightCard>

            {/* Bento Card 4: Academic Hierarchy & Master Data (7 Columns) */}
            <SpotlightCard className="md:col-span-7 flex flex-col justify-between" spotlightColor="rgba(15, 81, 50, 0.08)">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5">
                  <Layers className="w-5 h-5 text-slate-800" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                  Dual-Track Academic Master Data
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Configure classes, sections, course structures, and weekday timetable slots. Supports parallel
                  Matriculation streams (Science, Computer Science) and Cambridge Assessment International Education (O-1, O-2).
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <div className="font-bold text-slate-900">Primary Wing</div>
                    <div className="text-[11px] text-slate-500">Classes 1 through 5</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <div className="font-bold text-slate-900">Matric Stream</div>
                    <div className="text-[11px] text-slate-500">Classes 9 &amp; 10 (BIEK)</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <div className="font-bold text-slate-900">Cambridge O-Levels</div>
                    <div className="text-[11px] text-slate-500">O-1 &amp; O-2 (CAIE)</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>Fully configurable by school administrators</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* ========================================================
            ACADEMIC CURRICULA & STREAMS (DETAILED BREAKDOWN)
        ======================================================== */}
        <section id="curriculum" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full mb-3">
              Curriculum Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Two Prestigious Pathways, One High Standard
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
              Explore our structured academic divisions designed to prepare students for top Pakistani universities
              as well as international undergraduate opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stream 1: Primary & Middle */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Foundation Tier</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">Primary &amp; Middle Wing</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Classes 1 through 8. Early foundation in bilingual English-Urdu literacy, conceptual Mathematics,
                  General Science, social values, and digital robotics.
                </p>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Oxford Reading Tree English syllabus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Hands-on STEM activity modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Continuous formative testing</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                <span>Classes 1–8 Enrolling</span>
                <Link href="/contact" className="hover:underline flex items-center gap-1">Inquire <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>
            </div>

            {/* Stream 2: Matriculation Board */}
            <div className="bg-white rounded-2xl border-2 border-emerald-800/40 p-8 shadow-md relative flex flex-col justify-between">
              <span className="absolute -top-3 left-8 bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                National Board Track
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Secondary Board</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">Matriculation (BIEK)</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Classes 9 &amp; 10. Science Group and Computer Science Group under the Board of Secondary Education Karachi,
                  achieving consistently high distinction percentages.
                </p>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Physics, Chemistry, Biology &amp; Computer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Board Exam Model Paper Mastery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>100% Practical Lab Assessment</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                <span>Classes 9 &amp; 10 Science</span>
                <Link href="/contact" className="hover:underline flex items-center gap-1">Inquire <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>
            </div>

            {/* Stream 3: Cambridge O-Levels */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">International CAIE</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">Cambridge O-Levels</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  O-1 &amp; O-2. Aligned with Cambridge Assessment International Education syllabi (Syllabus D Mathematics,
                  Sciences, 2210 Computer Science, and English Language).
                </p>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>CAIE Certified Subject Specialists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Past-Paper Component Workshops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Equivalence Counseling for AKU / HSSC</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                <span>Cambridge O-1 &amp; O-2</span>
                <Link href="/contact" className="hover:underline flex items-center gap-1">Inquire <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ACADEMIC OPERATING ENGINE (WORKFLOW ROADMAP)
        ======================================================== */}
        <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full mb-3">
              Daily Operational Rhythm
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              How the Oxford Academic System Runs Daily
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
              From morning assembly to monthly bank fee reconciliation, automated digital steps ensure complete institutional transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
              <span className="font-mono-code font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded">01</span>
              <h3 className="text-base font-bold text-slate-900 mt-4 mb-2">Student Registry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unique roll identifiers (e.g. OGS-2026-0814), family contact archives, and class assignment.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
              <span className="font-mono-code font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded">02</span>
              <h3 className="text-base font-bold text-slate-900 mt-4 mb-2">08:00 AM Attendance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Homeroom roll-call recorded on faculty devices, followed by an immutable admin freeze.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
              <span className="font-mono-code font-bold text-xs text-indigo-800 bg-indigo-50 px-2 py-1 rounded">03</span>
              <h3 className="text-base font-bold text-slate-900 mt-4 mb-2">Substitution Sync</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatic schedule rerouting for absent teachers, ensuring continuous instruction.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
              <span className="font-mono-code font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded">04</span>
              <h3 className="text-base font-bold text-slate-900 mt-4 mb-2">Fee Reconciliation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standardized 3-part bank challans with QR code verification and direct payment tracking.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            INSTITUTIONAL ACCREDITATION BLOCK
        ======================================================== */}
        <section className="bg-slate-900 text-white py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
                  Educational Excellence
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-6 leading-tight">
                  Oxford Academic Standards with Cambridge International Alignment
                </h2>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                  Oxford Grammar School pairs rigorous STEM curricula with high-touch ethical mentorship.
                  Every student is provisioned with institutional registration records, automated fee tracking,
                  and verified academic transcripts.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Full Registration &amp; Student Information System</div>
                      <div className="text-xs text-slate-400">Unique student registration IDs, family records, and medical contact archives.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Real-Time Faculty Schedule Synchronization</div>
                      <div className="text-xs text-slate-400">Classroom teachers access daily class rosters and substitution alerts directly on mobile.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Cloudinary-Backed Document &amp; Profile Archival</div>
                      <div className="text-xs text-slate-400">Secure media storage for official faculty photographs and student admission verification.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Academic Seal Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white p-2.5 mb-6 shadow-xl shadow-black/40 flex items-center justify-center border-2 border-emerald-500/40 shrink-0">
                  <div className="relative w-full h-full">
                    <Image
                      src="/Logo2.png"
                      alt="Oxford Grammar School Official Crest"
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Oxford Grammar &amp; Cambridge EdTech School
                </h3>
                <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase mt-1 mb-4">
                  Established 1988 &bull; Main Academic Campus
                </p>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
                  Dedicated to intellectual discovery, character development, and academic mastery.
                  Accredited by the Board of Secondary Education Karachi and aligned with Cambridge Assessment International Education.
                </p>

                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Enter Portal as Staff or Faculty
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            FREQUENTLY ASKED QUESTIONS (ACCORDION)
        ======================================================== */}
        <section id="faq" className="py-24 px-6 max-w-4xl mx-auto border-t border-slate-200/80">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full mb-3">
              Institutional Queries
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Common questions regarding admissions, bank fee challans, and academic governance.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? "rotate-180 text-emerald-800" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            FINAL CALL TO ACTION BANNER
        ======================================================== */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-900 text-white p-10 md:p-16 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/90 border border-emerald-800 px-4 py-1 rounded-full mb-4">
                Session 2026–2027 Admissions
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 leading-tight">
                Experience Academic Excellence &amp; Character Building
              </h2>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                Join our community of over 1,480 scholars. Limited seats available for Cambridge O-Levels,
                Matriculation Sciences, and Primary Wing enrollment.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="px-8 py-3.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all"
                >
                  Submit Admission Inquiry
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                >
                  Faculty &amp; Staff Login
                </Link>
              </div>
            </div>
            {/* Ambient Radial Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
          </div>
        </section>

        {/* ========================================================
            PROFESSIONAL FOOTER
        ======================================================== */}
        <footer className="border-t border-slate-200 bg-white py-14 px-6 text-slate-600 text-xs">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Column 1: School Identity */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-white shadow-2xs border border-slate-200/80 p-1 flex items-center justify-center shrink-0">
                  <div className="relative w-full h-full">
                    <Image src="/Logo2.png" alt="School Crest" fill sizes="44px" className="object-contain" />
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-sm leading-tight">
                  Oxford Grammar &amp;<br />Cambridge EdTech School
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                A prestigious educational institution offering dual-track national Matriculation and Cambridge International curricula.
              </p>
              <div className="text-[11px] text-slate-400">
                School Registration Code: BIEK-SEC-8912
              </div>
            </div>

            {/* Column 2: Academic Programs */}
            <div>
              <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Academic Programs</div>
              <ul className="space-y-2 text-xs">
                <li><Link href="#curriculum" className="hover:text-emerald-800 transition-colors">Early Childhood &amp; Primary Wing</Link></li>
                <li><Link href="#curriculum" className="hover:text-emerald-800 transition-colors">Middle School Curriculum</Link></li>
                <li><Link href="#curriculum" className="hover:text-emerald-800 transition-colors">Matriculation Board (Sciences &amp; CS)</Link></li>
                <li><Link href="#curriculum" className="hover:text-emerald-800 transition-colors">Cambridge O-Level Program</Link></li>
                <li><Link href="#campus" className="hover:text-emerald-800 transition-colors">Robotics &amp; Science Labs</Link></li>
              </ul>
            </div>

            {/* Column 3: Portals & Navigation */}
            <div>
              <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Institutional Links</div>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-emerald-800 transition-colors">Faculty &amp; Staff Login</Link></li>
                <li><Link href="/login" className="hover:text-emerald-800 transition-colors">Administrative Console</Link></li>
                <li><Link href="/about" className="hover:text-emerald-800 transition-colors">Academic Vision &amp; History</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-800 transition-colors">Admissions &amp; Campus Inquiries</Link></li>
                <li><Link href="/forgot-password" className="hover:text-emerald-800 transition-colors">Account Password Recovery</Link></li>
              </ul>
            </div>

            {/* Column 4: Campus Address & Official Contact */}
            <div>
              <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Main Campus</div>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                Oxford Grammar Campus, Education Zone,<br />
                Karachi, Sindh, Pakistan.
              </p>
              <p className="text-xs text-slate-600 mb-1">
                <strong>Inquiries:</strong> info@oxfordgrammarschool.edu.pk
              </p>
              <p className="text-xs text-slate-600">
                <strong>Administration:</strong> +92 (21) 3456-7890
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Oxford Grammar &amp; Cambridge EdTech School. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-emerald-800 transition-colors">Academic Integrity Policy</Link>
              <Link href="/about" className="hover:text-emerald-800 transition-colors">Data Security Protocol</Link>
              <Link href="#features" className="hover:text-emerald-800 transition-colors">Audit System v2.0</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
