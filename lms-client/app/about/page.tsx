"use client";

import LandingNavbar from "@/components/LandingNavbar";
import { motion } from "framer-motion";
import { Rocket, Shield, Target, Zap, Heart } from "lucide-react";

export default function AboutPage() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const features = [
        {
            icon: Rocket,
            title: "Innovation First",
            description: "We constantly push technical boundaries to provide state-of-the-art tools for modern education.",
            color: "bg-cyan-100",
            textColor: "text-cyan-600"
        },
        {
            icon: Shield,
            title: "Uncompromising Integrity",
            description: "Building trust with secure, reliable, and transparent systems that protect institutional data.",
            color: "bg-teal-100",
            textColor: "text-teal-600"
        },
        {
            icon: Heart,
            title: "Community Growth",
            description: "Creating an inclusive environment that brings students, teachers, and parents closer together.",
            color: "bg-blue-100",
            textColor: "text-blue-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-cyan-100 selection:text-cyan-900">
            <LandingNavbar />

            <main className="pt-32 pb-20 relative overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-150 h-150 bg-cyan-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-125 h-125 bg-teal-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10"></div>

                <div className="max-w-4xl mx-auto px-6 text-center mb-24">
                    <motion.span
                        {...fadeIn}
                        className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
                    >
                        <Target className="w-4 h-4" />
                        Our Vision for 2026
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]"
                    >
                        Empowering the Future of <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-600 to-teal-600 underline decoration-cyan-500/20 underline-offset-8">Education.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="text-xl text-slate-500 leading-relaxed font-light max-w-2xl mx-auto"
                    >
                        Oxford Grammar School is dedicated to academic excellence, fostering character development, and enabling students to focus on what truly matters: <span className="text-slate-900 font-semibold underline decoration-teal-400 decoration-2">their future potential.</span>
                    </motion.p>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                            whileHover={{ y: -8 }}
                            className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-cyan-200/30 transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>

                            <div className={`w-14 h-14 ${feature.color} ${feature.textColor} rounded-2xl flex items-center justify-center mb-8 shadow-inner relative z-10 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight relative z-10">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed text-lg relative z-10 font-light">{feature.description}</p>

                            <div className="mt-8 flex items-center gap-2 text-cyan-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Learn More <Zap className="w-4 h-4 fill-cyan-600" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Mission Statement */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto px-6 mt-32 text-center"
                >
                    <div className="p-12 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-cyan-900/20">
                        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-tr from-cyan-600/10 to-transparent"></div>
                        <h2 className="text-3xl font-bold mb-6 relative z-10">Our Core Mission</h2>
                        <p className="text-lg text-slate-300 leading-relaxed font-light relative z-10">
                            We believe that every educational institution deserves tools that work as hard as they do. Our mission is to democratize institutional technology, making powerful management tools accessible, intuitive, and delightful to use.
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
