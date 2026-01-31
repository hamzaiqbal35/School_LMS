// Link import removed
import LandingNavbar from "@/components/LandingNavbar";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-purple-100">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">

                    {/* Contact Info */}
                    <div>
                        <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in-up">
                            Get in Touch
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight animate-fade-in-up [animation-delay:200ms]" style={{ animationFillMode: 'both' }}>
                            We&apos;re here to <span className="text-cyan-600">help.</span>
                        </h1>
                        <p className="text-lg text-slate-500 mb-12 animate-fade-in-up [animation-delay:300ms]" style={{ animationFillMode: 'both' }}>
                            Have questions or need support? Fill out the form or reach out to us directly. We&apos;re always happy to assist our community.
                        </p>

                        <div className="space-y-6 animate-fade-in-up [animation-delay:400ms]" style={{ animationFillMode: 'both' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-cyan-600 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Email Us</p>
                                    <a href="mailto:oxfordsgrammerschool@gmail.com" className="text-slate-500 hover:text-cyan-600 transition-colors">oxfordsgrammerschool@gmail.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-cyan-600 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Call Us</p>
                                    <a href="tel:+923030017905" className="text-slate-500 hover:text-cyan-600 transition-colors">+92 303 0017905</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-cyan-600 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Visit Us</p>
                                    <p className="text-slate-500">Arzanipur, Tehsil chunnian, District Kasur</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-cyan-50 animate-fade-in-up [animation-delay:500ms]" style={{ animationFillMode: 'both' }}>
                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="text-sm font-bold text-slate-700">First Name</label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-purple-50 transition-all font-medium"
                                        placeholder="Jane"
                                        autoComplete="given-name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-bold text-slate-700">Last Name</label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all font-medium"
                                        placeholder="Doe"
                                        autoComplete="family-name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all font-medium"
                                    placeholder="jane@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-bold text-slate-700">Subject</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all font-medium appearance-none"
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="admissions">Admissions</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-bold text-slate-700">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 transition-all font-medium h-32 resize-none"
                                    placeholder="How can we help you?"
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full py-4 rounded-xl bg-cyan-600 text-white font-bold text-lg hover:bg-cyan-700 shadow-lg shadow-purple-200 hover:shadow-cyan-300 transform hover:-translate-y-1 transition-all">
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
