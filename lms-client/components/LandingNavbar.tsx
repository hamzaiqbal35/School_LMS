"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function LandingNavbar({ hideLoginBtn = false }: { hideLoginBtn?: boolean }) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [prevPath, setPrevPath] = useState(pathname);

    if (pathname !== prevPath) {
        setPrevPath(pathname);
        setMobileMenuOpen(false);
    }

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Prevent background scrolling when mobile menu is open
    useEffect(() => {
        const prev = document.body.style.overflow;
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = prev || "";
        };
    }, [mobileMenuOpen]);

    // Close mobile menu on route change (e.g., browser back/forward)
    // Only closes if pathname actually changed to avoid unnecessary renders
    // Logic moved to render phase above to avoid set-state-in-effect error

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-xl shadow-sm py-4" : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 md:h-24 flex justify-between items-center transition-all duration-300">
                {/* Left Side: Logo & School Name */}
                <div className="flex items-center gap-4 z-50">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-12 h-12 md:w-16 md:h-16 transition-transform group-hover:scale-105">
                            <Image
                                src="/Logo2.png"
                                alt="Oxford Grammar School Logo"
                                fill
                                sizes="(max-width: 768px) 48px, 64px"
                                className="object-contain"
                                priority
                            />
                        </div>
                        {/* Compact name for small screens, full name for large */}
                        <span className="block md:hidden text-sm font-bold text-slate-800 leading-tight">
                            Oxford Grammar
                        </span>
                        <span className="hidden md:block lg:text-xl text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600 group-hover:from-cyan-700 group-hover:to-cyan-500 transition-all duration-300 leading-tight max-w-50 md:max-w-none">
                            Oxford Grammar & <br className="hidden" /> Cambridge EdTech School
                        </span>
                    </Link>
                </div>

                {/* Right Side: Navigation & Login */}
                <div className="hidden md:flex items-center gap-8">
                    {/* Nav Links */}
                    <div className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-semibold tracking-wide transition-all duration-300 hover:text-cyan-600 ${isActive(link.href) ? "text-cyan-600" : "text-slate-600"
                                    } relative group`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-600 transition-all duration-300 group-hover:w-full ${isActive(link.href) ? "w-full" : ""}`}></span>
                            </Link>
                        ))}
                    </div>

                    {/* Login Button */}
                    {!hideLoginBtn && (
                        <Link
                            href="/login"
                            className="px-6 py-2.5 rounded-full text-sm font-bold bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-cyan-200 hover:shadow-lg transition-all active:scale-95 duration-300 border border-transparent"
                        >
                            Log In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden relative z-50 p-2 text-slate-800 hover:text-cyan-600 transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>

                {/* Mobile Fullscreen Menu */}
                <div
                    className={`fixed inset-0 w-full h-screen bg-white z-50 flex flex-col justify-center items-center gap-8 transition-all duration-500 ease-in-out ${mobileMenuOpen
                            ? "opacity-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 -translate-y-full pointer-events-none"
                        }`}
                >
                    {/* Close button inside the menu for better UX */}
                    <button
                        className="absolute top-6 right-6 p-2 text-slate-800"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X className="w-10 h-10" />
                    </button>

                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-4xl font-extrabold text-slate-800 hover:text-cyan-600 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    {!hideLoginBtn && (
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-8 px-12 py-4 rounded-full text-2xl font-bold bg-cyan-600 text-white hover:bg-cyan-700 shadow-xl transition-all active:scale-95"
                        >
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
