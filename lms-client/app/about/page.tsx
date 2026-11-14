"use client";

import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "@/components/LandingNavbar";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import DotGrid from "@/components/reactbits/DotGrid";
import { Award, BookOpen, ShieldCheck, Users, GraduationCap, Building2, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  const pillars = [
    {
      icon: Award,
      title: "Academic Rigor & Dual Accreditation",
      description:
        "Providing parallel excellence through the Cambridge Assessment International Education (CAIE) syllabus alongside the Board of Secondary Education Karachi (BIEK) Matriculation curriculum.",
      badge: "Curriculum Standards",
    },
    {
      icon: ShieldCheck,
      title: "Fiscal Transparency & Digital Auditing",
      description:
        "Standardized bank-partner fee challans, verifiable QR transaction receipts, and digital ledger reconciliations to ensure complete institutional integrity.",
      badge: "Governance & Operations",
    },
    {
      icon: Users,
      title: "Instructional Continuity",
      description:
        "Intelligent faculty scheduling and automated substitution workflows ensure zero unattended periods and continuous learning momentum for every student.",
      badge: "Faculty Management",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden">
      <LandingNavbar />

      <main className="relative pt-32 pb-24">
        <DotGrid gap={28} dotSize={1.1} color="rgba(15, 23, 42, 0.07)" fadeEdges={true} />

        {/* Hero Banner */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-20">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6 shadow-2xs">
            <Building2 className="w-3.5 h-3.5" />
            Institutional Heritage &bull; Est. 1988
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Educating Leaders Through Discipline, Discovery &amp; Character
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Oxford Grammar &amp; Cambridge EdTech School has championed academic excellence
            for over three decades, equipping generations of students with intellectual depth,
            ethical governance, and global readiness.
          </p>
        </section>

        {/* Pillars Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, index) => (
              <SpotlightCard
                key={index}
                className="flex flex-col justify-between"
                spotlightColor="rgba(15, 81, 50, 0.08)"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800">
                      <pillar.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/70 border border-emerald-200/50 px-2.5 py-1 rounded-full">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* Academic History & Heritage Block */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-xs">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Institutional Timeline
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-2 mb-4">
                  A Legacy of Academic Standards in Sindh
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Founded in 1988, Oxford Grammar School began with a clear mandate: to provide
                  rigorous, ethical English-medium education to ambitious scholars. In 2026, the
                  school formalized its Cambridge EdTech transformation, integrating continuous
                  digital attendance audits, automated challan reconciliations, and science lab modernizations.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">1988</div>
                    <div className="text-slate-500">Foundation of Primary Wing</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">2004</div>
                    <div className="text-slate-500">BIEK Matric Science Expansion</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">2016</div>
                    <div className="text-slate-500">Cambridge O-Levels Affiliation</div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-center border-l border-slate-100 pl-0 md:pl-8 text-center">
                <div className="w-24 h-24 rounded-full bg-white p-2.5 mb-3 shadow-md border-2 border-emerald-600/30 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image src="/Logo2.png" alt="School Seal" fill sizes="96px" className="object-contain" />
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-sm">Oxford Grammar School</div>
                <div className="text-xs text-slate-500 mt-1">Official Institutional Seal</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white pt-10 pb-12 px-6 text-slate-600 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} Oxford Grammar &amp; Cambridge EdTech School. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-emerald-800 transition-colors">Home</Link>
              <Link href="/contact" className="hover:text-emerald-800 transition-colors">Admissions</Link>
              <Link href="/login" className="hover:text-emerald-800 transition-colors">Portal Login</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
