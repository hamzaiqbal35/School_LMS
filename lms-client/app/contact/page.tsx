"use client";

import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "@/components/LandingNavbar";
import DotGrid from "@/components/reactbits/DotGrid";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Mail, Phone, MapPin, Clock, Building2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/contact", formData);
      toast.success("Inquiry submitted successfully! The admissions office will respond shortly.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Contact form error:", error);
      const message = error.response?.data?.message || "Failed to submit inquiry. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden">
      <LandingNavbar />

      <main className="relative pt-32 pb-24">
        <DotGrid gap={28} dotSize={1.1} color="rgba(15, 23, 42, 0.07)" fadeEdges={true} />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Campus Information */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6 shadow-2xs">
              <Building2 className="w-3.5 h-3.5" />
              Admissions &amp; Campus Office
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
              Connect with Our Academic Administration
            </h1>
            <p className="text-sm md:text-base text-slate-600 mb-10 leading-relaxed">
              For student admission queries, fee challan inquiries, or Cambridge syllabus enrollment,
              contact our registrar&apos;s office or visit the main administrative block.
            </p>

            <div className="space-y-6 text-xs text-slate-600">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Main Campus Address</div>
                  <div className="text-slate-500 mt-0.5 leading-relaxed">
                    Oxford Grammar Campus, Education Zone,<br />
                    Karachi, Sindh, Pakistan.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Direct Office Lines</div>
                  <div className="text-slate-500 mt-0.5">
                    +92 (21) 3456-7890 / +92 (21) 3456-7891
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Official Inquiries</div>
                  <div className="text-slate-500 mt-0.5">
                    admissions@oxfordgrammarschool.edu.pk
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Visiting Hours</div>
                  <div className="text-slate-500 mt-0.5">
                    Monday to Friday: 08:00 AM – 02:00 PM<br />
                    Saturday: 08:30 AM – 12:30 PM (Admissions Only)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10 shadow-lg shadow-slate-900/5">
              <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                Submit an Academic or Admission Inquiry
              </h2>
              <p className="text-xs text-slate-500 mb-8">
                All inquiries are logged directly in our administrative communications queue.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      First Name <span className="text-emerald-700">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Muhammad"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Last Name <span className="text-emerald-700">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Khan"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Parent or Guardian Email Address <span className="text-emerald-700">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Inquiry Subject <span className="text-emerald-700">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors bg-white"
                  >
                    <option value="">Select Category...</option>
                    <option value="Admission Inquiry - Primary Wing">Admission Inquiry - Primary Wing (Classes 1–5)</option>
                    <option value="Admission Inquiry - Matric Board">Admission Inquiry - Matric Board (Classes 9–10)</option>
                    <option value="Admission Inquiry - Cambridge O-Levels">Admission Inquiry - Cambridge O-Levels (O-1 / O-2)</option>
                    <option value="Fee Challan & Banking Verification">Fee Challan &amp; Banking Verification</option>
                    <option value="General Institutional Inquiry">General Institutional Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Message Details <span className="text-emerald-700">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Provide details regarding the student's current grade, previous school, or specific questions..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-all shadow-xs disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                        <span>Transmitting Inquiry...</span>
                      </>
                    ) : (
                      <span>Submit Inquiry to Admissions Office</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-200 bg-white pt-10 pb-12 px-6 text-slate-600 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} Oxford Grammar &amp; Cambridge EdTech School. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-emerald-800 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-emerald-800 transition-colors">Academic Mission</Link>
              <Link href="/login" className="hover:text-emerald-800 transition-colors">Portal Login</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
