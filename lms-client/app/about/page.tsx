"use client";

import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "@/components/LandingNavbar";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import DotGrid from "@/components/reactbits/DotGrid";
import CountUp from "@/components/reactbits/CountUp";
import {
  Award,
  BookOpen,
  ShieldCheck,
  Users,
  GraduationCap,
  ArrowRight,
  FlaskConical,
  Compass,
  FileCheck2,
  Shield,
  Layers,
  Scale
} from "lucide-react";

export default function AboutPage() {
  const pillars = [
    {
      icon: Award,
      title: "Dual Academic Accreditation",
      badge: "Curriculum Standards",
      description:
        "Parallel educational pathways offering the Cambridge Assessment International Education (CAIE Center PK-482) stream alongside the Board of Secondary Education Karachi (BIEK) Matriculation curriculum with zero compromise on foundational STEM depth.",
    },
    {
      icon: FlaskConical,
      title: "Empirical Laboratory Immersion",
      badge: "Hands-on Science",
      description:
        "Dedicated, university-grade Physics, Chemistry, and Biology laboratories equipped with modern optical apparatus, chemical hoods, and digital data-logging stations for O-Level and Matric practical examinations.",
    },
    {
      icon: ShieldCheck,
      title: "Audited Operational Integrity",
      badge: "Governance & Security",
      description:
        "Every student record, fee challan voucher, and daily attendance roll-call is secured in an audit-locked administrative database, ensuring strict fiscal compliance and immutable permanent transcripts.",
    },
    {
      icon: Users,
      title: "Instructional Continuity Engine",
      badge: "Faculty Management",
      description:
        "An automated timetable conflict-resolution system ensures immediate, subject-qualified faculty substitutions for absent educators, completely eliminating unattended classroom periods.",
    },
    {
      icon: Scale,
      title: "Ethical Character & Leadership",
      badge: "Holistic Development",
      description:
        "A structured behavioral mentorship model cultivating integrity, intellectual curiosity, civic responsibility, and debate proficiency across all primary and secondary grade cohorts.",
    },
    {
      icon: GraduationCap,
      title: "Collegiate Matriculation Guidance",
      badge: "Alumni Readiness",
      description:
        "Specialized advisory counseling preparing high school scholars for national college admissions, foreign standardized testing, university scholarship applications, and competitive career tracks.",
    },
  ];

  const facilities = [
    {
      title: "Specialized STEM Laboratories",
      category: "Practical Sciences",
      description:
        "Three distinct laboratory complexes for Physics, Chemistry, and Biological Sciences outfitted with individual student experiment stations and certified safety protocols.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Central Research Library",
      category: "Academic Archives",
      description:
        "Over 15,000 academic titles, reference encyclopedias, Cambridge past paper compendiums, quiet research carrels, and digital catalog terminals.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Computer Science & Robotics Suite",
      category: "Digital Innovation",
      description:
        "Gigabit-networked computing lab featuring Python, C++, and web development toolchains, microcontroller workstations, and algorithmic problem-solving labs.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Regulated Athletic Grounds",
      category: "Physical Education",
      description:
        "Secure outdoor facilities supporting cricket, football, basketball, and track events, promoting physical stamina, team discipline, and sportsmanship.",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const milestones = [
    {
      year: "1988",
      title: "Foundation of Oxford Grammar School",
      detail: "Established in Karachi with a founding cohort of 80 scholars and 6 dedicated educators, pioneering disciplined English-medium education.",
    },
    {
      year: "1996",
      title: "Campus Expansion & Middle Wing Construction",
      detail: "Inaugurated the dedicated academic block featuring modern lecture rooms, an administrative wing, and our first science experiment hall.",
    },
    {
      year: "2004",
      title: "BIEK Matriculation Board Accreditation",
      detail: "Granted official recognition by the Board of Secondary Education Karachi (BIEK-SEC-8912) for secondary Matriculation science and computer streams.",
    },
    {
      year: "2016",
      title: "Cambridge Assessment International Affiliation",
      detail: "Accredited as CAIE Examination Center PK-482, launching British curriculum Cambridge O-Level programs with specialized subject faculty.",
    },
    {
      year: "2022",
      title: "Modernization of Science & Robotics Labs",
      detail: "Reconstructed institutional STEM facilities with modern safety hoods, digital microscopes, and high-speed computational resources.",
    },
    {
      year: "2026",
      title: "Enterprise LMS & EdTech Integration",
      detail: "Full institutional deployment of digital governance: audit-locked student attendance, triple-copy bank challans, and real-time scheduling.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden">
      <LandingNavbar />

      <main className="relative pt-32 pb-24">
        <DotGrid gap={28} dotSize={1.1} color="rgba(15, 23, 42, 0.07)" fadeEdges={true} />

        {/* ========================================================
            HERO BANNER
        ======================================================== */}
        <section className="max-w-5xl mx-auto px-6 text-center mb-20">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-950 mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Institutional Heritage &bull; Established 1988</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Educating Leaders Through Discipline, Discovery &amp; Character
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto mb-10">
            For nearly four decades, Oxford Grammar &amp; Cambridge EdTech School has provided a rigorous,
            values-grounded educational foundation in Karachi. We combine the precision of international
            curricula with an unwavering commitment to personal accountability, scientific inquiry, and academic integrity.
          </p>

          {/* Institutional KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto">
            <div className="border-r border-slate-100 last:border-0 p-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800">
                <CountUp from={0} to={1480} duration={1.8} separator="," />+
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Enrolled Scholars</div>
            </div>
            <div className="border-r border-slate-100 last:border-0 p-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800">
                <CountUp from={0} to={85} duration={1.8} />+
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Certified Faculty</div>
            </div>
            <div className="border-r border-slate-100 last:border-0 p-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800">
                <CountUp from={0} to={100} duration={1.8} />%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Examination Pass Rate</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800">
                <CountUp from={0} to={38} duration={1.8} />
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Years of Excellence</div>
            </div>
          </div>
        </section>

        {/* ========================================================
            FOUNDATIONAL DUAL CURRICULUM FRAMEWORK
        ======================================================== */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-xs">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 mb-3">
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Dual Academic Framework</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                  Parallel Pathways Designed for Global &amp; National Excellence
                </h2>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6">
                  At Oxford Grammar School, we recognize that every student possesses unique intellectual aspirations.
                  From Class 9 onward, scholars may pursue either the internationally standardized Cambridge Assessment
                  International Education (CAIE) curriculum or the national Board of Secondary Education Karachi (BIEK)
                  Matriculation stream, each supported by specialized certified departments.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-800" />
                      <span>Cambridge O-Level (CAIE)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Rigorous British curriculum focusing on critical analysis, experimental sciences, English literature,
                      and mathematics, registered under CAIE Center PK-482.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-800" />
                      <span>BIEK Matriculation Stream</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Comprehensive national Science and Computer Science curricula accredited by the Board of Secondary
                      Education Karachi, preparing students for premier national pre-medical and pre-engineering faculties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Institutional Certification Badge Card */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-slate-950 text-white rounded-2xl relative overflow-hidden">
                <div className="w-24 h-24 rounded-2xl bg-white p-2.5 mb-4 shadow-md flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image src="/Logo2.png" alt="School Crest" fill sizes="96px" className="object-contain" />
                  </div>
                </div>
                <h3 className="font-bold text-base text-white text-center">Oxford Grammar School</h3>
                <p className="text-xs text-emerald-400 font-mono mt-0.5 text-center">Main Academic Campus &bull; Karachi</p>

                <div className="w-full mt-6 pt-5 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">CAIE Center Code</span>
                    <span className="font-mono font-bold text-emerald-400">PK-482</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">BIEK Reg. Code</span>
                    <span className="font-mono font-bold text-emerald-400">BIEK-SEC-8912</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Affiliation Status</span>
                    <span className="font-semibold text-white">Active &amp; Verified</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Academic Cohorts</span>
                    <span className="font-semibold text-white">Class 1 through O-Levels</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            CORE EDUCATIONAL PILLARS (6-CARD GRID)
        ======================================================== */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Institutional Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-2 mb-4">
              The Six Pillars of Academic Excellence
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every policy, classroom period, and administrative workflow at Oxford Grammar School is anchored
              in these core institutional pillars.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar, index) => (
              <SpotlightCard
                key={index}
                className="flex flex-col justify-between p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow"
                spotlightColor="rgba(15, 81, 50, 0.08)"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800">
                      <pillar.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* ========================================================
            CAMPUS INFRASTRUCTURE & FACILITIES
        ======================================================== */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Purpose-Built Campus
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-2 mb-4">
              Modern Facilities Engineered for Scholarly Discovery
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore our specialized academic campus in Karachi, purposefully designed to foster focus,
              intellectual vitality, and collaborative research.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={facility.image}
                    alt={facility.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {facility.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-emerald-800 transition-colors">
                      {facility.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {facility.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            HISTORICAL TIMELINE & HERITAGE
        ======================================================== */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-xs">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Institutional Milestones
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mt-2 mb-3">
                A 38-Year Legacy of Academic Standards
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tracing our evolution from a modest foundational school in 1988 into one of Karachi&apos;s
                foremost dual-track educational institutions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones.map((m, index) => (
                <div key={index} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative">
                  <div className="inline-block px-3 py-1 rounded-md bg-emerald-800 text-white font-mono text-xs font-bold mb-3">
                    {m.year}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">{m.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            ACADEMIC GOVERNANCE & SAFEGUARDING
        ======================================================== */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Audit-Locked Records</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Roll-call records, examination scores, and disciplinary logs are immutably archived. Retroactive modifications
                require executive superuser clearance, ensuring absolute integrity of student transcripts.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Child Safeguarding Code</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero tolerance for bullying, harassment, or unsafe conduct. Our campus maintains continuous CCTV oversight
                in common areas, professional entry security, and trained student counselor support.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Transparent Fee Vouchers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct integration with authorized banking branches. Automated fee schedules with scannable QR verification
                ensure parents have complete transparency without hidden administrative fees.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            EXECUTIVE CALL TO ACTION
        ======================================================== */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="relative rounded-3xl bg-slate-950 p-10 md:p-14 text-white text-center overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 mb-4">
                Admissions for Academic Year 2026–2027 Open
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Experience Oxford Grammar School in Person
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
                Schedule a guided campus walkthrough with our admissions counselors or submit an official inquiry
                to enroll your scholar in our Cambridge or Matriculation streams.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-950/20"
                >
                  <span>Submit Admission Inquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-full text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
                >
                  <span>Portal Login</span>
                </Link>
              </div>
            </div>
            {/* Ambient subtle glow */}
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
                <li><Link href="/about" className="hover:text-emerald-800 transition-colors">Early Childhood &amp; Primary Wing</Link></li>
                <li><Link href="/about" className="hover:text-emerald-800 transition-colors">Middle School Curriculum</Link></li>
                <li><Link href="/about" className="hover:text-emerald-800 transition-colors">Matriculation Board (Sciences &amp; CS)</Link></li>
                <li><Link href="/about" className="hover:text-emerald-800 transition-colors">Cambridge O-Level Program</Link></li>
                <li><Link href="/about" className="hover:text-emerald-800 transition-colors">Robotics &amp; Science Labs</Link></li>
              </ul>
            </div>

            {/* Column 3: Institutional Links */}
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
              <Link href="/" className="hover:text-emerald-800 transition-colors">Audit System v2.0</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
