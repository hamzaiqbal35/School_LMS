"use client";

import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "@/components/LandingNavbar";
import DotGrid from "@/components/reactbits/DotGrid";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  Building2,
  CreditCard,
  Bus,
  ShieldCheck,
  ChevronDown,
  Send
} from "lucide-react";

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    stream: "Cambridge O-Level",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const toastId = toast.loading("Transmitting academic inquiry to admissions queue...");

    try {
      // Pack stream & phone into message/subject payload for the backend
      const combinedSubject = formData.subject || `Admission Inquiry: ${formData.stream}`;
      const combinedMessage = `[Target Stream/Grade: ${formData.stream}] [Contact Phone: ${formData.phone || "Not provided"}]\n\n${formData.message}`;

      await api.post("/contact", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        subject: combinedSubject,
        message: combinedMessage,
      });

      toast.success(
        "Inquiry received successfully! Our admissions office will contact you via email or phone within 24 operational hours.",
        { id: toastId }
      );

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        stream: "Cambridge O-Level",
        subject: "",
        message: "",
      });
    } catch (error: unknown) {
      console.error("Contact form error:", error);
      const err = error as AxiosErrorLike;
      const message =
        err.response?.data?.message || "Failed to submit inquiry. Please try again or call the admissions desk.";
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const departments = [
    {
      title: "Admissions & Student Registration",
      contact: "Mrs. Nighat Sultana",
      phone: "+92 (21) 3456-7890 (Ext. 101)",
      email: "admissions@oxfordgrammarschool.edu.pk",
      scope: "New admissions, campus tours, transfer certificates, and grade placements.",
    },
    {
      title: "Accounts, Fees & Bank Reconciliation",
      contact: "Mr. Farhan Aziz (Bursar)",
      phone: "+92 (21) 3456-7891 (Ext. 104)",
      email: "fees@oxfordgrammarschool.edu.pk",
      scope: "Bank fee challans, late fee waivers, sibling concessions, and deposit confirmation.",
    },
    {
      title: "Cambridge International Directorate (PK-482)",
      contact: "Mr. S. M. Rizvi (Academic Coordinator)",
      phone: "+92 (21) 3456-7890 (Ext. 108)",
      email: "cambridge@oxfordgrammarschool.edu.pk",
      scope: "CAIE syllabi, British Council candidate registrations, and O-Level mock exams.",
    },
    {
      title: "Matriculation Board Wing (BIEK-SEC-8912)",
      contact: "Ms. Rashida Begum (Matric Dean)",
      phone: "+92 (21) 3456-7891 (Ext. 112)",
      email: "matric@oxfordgrammarschool.edu.pk",
      scope: "BIEK board registration, internal assessments, and science practical schedules.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Submit Inquiry or Campus Form",
      description: "Fill the digital inquiry form or collect the official registration prospectus from the campus reception.",
    },
    {
      step: "02",
      title: "Academic Readiness Evaluation",
      description: "Prospective scholars complete a foundational assessment in English, Mathematics, and General Science.",
    },
    {
      step: "03",
      title: "Guardian Interview & Verification",
      description: "Discussion with the Principal or Head of Department to review previous transcripts and Nadra B-Form records.",
    },
    {
      step: "04",
      title: "Challan Issuance & Portal Access",
      description: "Issuance of triple-copy bank challan. Upon deposit verification, the student's institutional ID is provisioned.",
    },
  ];

  const faqs = [
    {
      q: "What are the age criteria for primary and secondary admissions?",
      a: "For Class 1 admission, the child must be between 5.5 and 6.5 years old by August 1st of the academic year. Secondary cohorts (Class 9 / O-Levels) require successful completion and certified marksheets of Class 8 or equivalent foundational years.",
    },
    {
      q: "How does the school distribute bank fee challans?",
      a: "Fee vouchers are generated with scannable QR verification codes. They can be downloaded through the administrative portal or collected from the bursar's office, payable at any designated Allied Bank, Meezan Bank, or Habib Bank branch across Karachi.",
    },
    {
      q: "What documentation is required at the time of admission?",
      a: "Parents must submit: 1) Certified Nadra B-Form copy, 2) Father's/Guardian's CNIC copy, 3) 4 passport-size photographs in formal attire, 4) Original School Leaving Certificate (SLC) from the previous institution, and 5) Official previous grade marksheets.",
    },
    {
      q: "Does the school provide dedicated transport services?",
      a: "Yes. Oxford Grammar School operates a monitored contract fleet of school vans and coaster buses covering Gulshan-e-Iqbal, Gulistan-e-Jauhar, North Nazimabad, Federal B Area, PECHS, and Malir Cantt zones with dedicated security attendants.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden">
      <LandingNavbar />

      <main className="relative pt-32 pb-24">
        <DotGrid gap={28} dotSize={1.1} color="rgba(15, 23, 42, 0.07)" fadeEdges={true} />

        {/* ========================================================
            HERO HEADER
        ======================================================== */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-950 mb-6 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Admissions &amp; Administrative Headquarters</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            Connect with Our Academic Administration
          </h1>

          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Whether inquiring about Cambridge O-Level enrollment, BIEK Matriculation science streams, bank fee challan
            reconciliation, or scheduling a guided campus visit, our administrative team is here to assist you.
          </p>
        </section>

        {/* ========================================================
            PRIMARY SPLIT SECTION: CAMPUS INFO & CONTACT FORM
        ======================================================== */}
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start mb-24">
          {/* Left Column: Campus Matrix & Address (5 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-800" />
                <span>Main Academic Campus</span>
              </h2>

              <div className="space-y-5 text-xs text-slate-600">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Physical Address</div>
                  <div className="text-slate-600 mt-1 leading-relaxed">
                    Oxford Grammar Campus, Education Zone,<br />
                    University Road / Gulshan Academic Block,<br />
                    Karachi, Sindh, Pakistan.
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">Administrative Office Lines</div>
                  <div className="font-mono text-emerald-800 font-semibold mt-1">
                    +92 (21) 3456-7890 &bull; +92 (21) 3456-7891
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Direct PABX Lines with multi-channel routing
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">Visiting &amp; Counter Hours</div>
                  <div className="text-slate-600 mt-1 leading-relaxed">
                    <strong>Monday – Friday:</strong> 08:00 AM – 02:00 PM<br />
                    <strong>Saturday:</strong> 08:30 AM – 12:30 PM (Admissions &amp; Accounts Only)<br />
                    <strong>Sunday &amp; Gazetted Holidays:</strong> Closed
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">Primary Email Channels</div>
                  <div className="space-y-1 mt-1 text-slate-600">
                    <div>Admissions: <span className="font-mono text-slate-900 font-semibold">admissions@oxfordgrammarschool.edu.pk</span></div>
                    <div>General Desk: <span className="font-mono text-slate-900 font-semibold">info@oxfordgrammarschool.edu.pk</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Department Contacts Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-7 shadow-md border border-slate-800">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Departmental Direct Extensions</span>
              </h3>
              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                Connect directly with departmental heads during official morning visiting hours:
              </p>

              <div className="space-y-3.5 text-xs">
                {departments.map((dept, index) => (
                  <div key={index} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="font-bold text-emerald-300 text-xs">{dept.title}</div>
                    <div className="text-[11px] text-slate-200 mt-0.5 font-medium">{dept.contact}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{dept.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: High-Integrity Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-lg shadow-slate-900/5">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Official Registry Queue
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Submit an Academic or Admission Inquiry
              </h2>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                Complete the parameters below. All submissions are automatically assigned an administrative tracking
                number and routed to the corresponding department.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs" autoComplete="off">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block font-semibold text-slate-700 mb-1.5">
                      First Name <span className="text-emerald-700">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Tariq"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block font-semibold text-slate-700 mb-1.5">
                      Last Name <span className="text-emerald-700">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Siddiqui"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block font-semibold text-slate-700 mb-1.5">
                      Parent / Guardian Email <span className="text-emerald-700">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="guardian@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block font-semibold text-slate-700 mb-1.5">
                      Primary Contact Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stream" className="block font-semibold text-slate-700 mb-1.5">
                      Intended Academic Stream
                    </label>
                    <select
                      id="stream"
                      name="stream"
                      value={formData.stream}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors bg-white font-medium"
                    >
                      <option value="Primary Wing (Classes 1-5)">Primary Wing (Classes 1–5)</option>
                      <option value="Middle School (Classes 6-8)">Middle School (Classes 6–8)</option>
                      <option value="Matriculation Science (Classes 9-10)">Matriculation Science (Classes 9–10)</option>
                      <option value="Matriculation Computer Science (Classes 9-10)">Matriculation Computer Science (Classes 9–10)</option>
                      <option value="Cambridge O-Level (O-1 / O-2)">Cambridge O-Level (O-1 / O-2)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block font-semibold text-slate-700 mb-1.5">
                      Inquiry Category <span className="text-emerald-700">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors bg-white font-medium"
                    >
                      <option value="">Select Category...</option>
                      <option value="New Admission Application">New Admission Application</option>
                      <option value="Fee Challan & Bank Verification">Fee Challan &amp; Bank Verification</option>
                      <option value="Campus Walkthrough Appointment">Campus Walkthrough Appointment</option>
                      <option value="School Leaving & Transcript Request">School Leaving &amp; Transcript Request</option>
                      <option value="General Administration & Governance">General Administration &amp; Governance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block font-semibold text-slate-700 mb-1.5">
                    Detailed Message &amp; Student Background <span className="text-emerald-700">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Provide candidate details: current class, previous school name, specific academic questions, or fee challan reference number..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-900 text-xs transition-colors resize-none bg-slate-50/50"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-all shadow-md shadow-emerald-950/10 disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                        <span>Transmitting to Admissions Queue...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Submit Inquiry to Academic Office</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-3">
                  Inquiries are logged securely under Oxford Grammar School data governance standards.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* ========================================================
            ENROLLMENT ROADMAP & TIMELINE
        ======================================================== */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-xs">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Enrollment Procedure
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mt-2 mb-3">
                The Four-Stage Admission Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A streamlined, transparent enrollment pathway designed to ensure candidates are placed in optimal
                academic streams.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((st, index) => (
                <div key={index} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-2xl font-bold text-emerald-800 mb-3 block">
                      {st.step}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mb-2">{st.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            CAMPUS VISITORS, SECURITY & TRANSPORT NETWORK
        ======================================================== */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Campus Security &amp; Visitor ID</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All campus visitors must present an original Computerized National Identity Card (CNIC) at Main Gate 1
                to receive an official visitor identification badge prior to entering administrative chambers.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Partner Banking Branches</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Official triple-copy fee challans can be deposited at any branch of Allied Bank, Meezan Bank, or Habib Bank
                in Karachi. Immediate digital clearance receipts are issued upon transaction verification.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Bus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Monitored Transit Routes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our supervised transport network services Gulshan, Gulistan-e-Jauhar, North Nazimabad, F.B. Area,
                and PECHS with vetted drivers and dedicated female attendant supervision on all routes.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            FREQUENTLY ASKED ADMISSION QUESTIONS (FAQ)
        ======================================================== */}
        <section className="max-w-4xl mx-auto px-6 mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              Guidance &amp; Clarifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2 mb-3">
              Frequently Asked Admissions Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Common questions answered regarding admissions, documentation, bank vouchers, and institutional policies.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 text-sm hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? "rotate-180 text-emerald-800" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
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
