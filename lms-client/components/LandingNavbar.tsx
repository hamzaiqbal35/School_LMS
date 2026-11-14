"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import Magnet from "./reactbits/Magnet";

export default function LandingNavbar({ hideLoginBtn = false }: { hideLoginBtn?: boolean }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Overview", href: "/" },
    { name: "Academic Mission", href: "/about" },
    { name: "Admissions", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Left Side: School Crest & Title */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white shadow-2xs border border-slate-200/80 p-1 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
            <div className="relative w-full h-full">
              <Image
                src="/Logo2.png"
                alt="Oxford Grammar School Crest"
                fill
                sizes="(max-width: 768px) 44px, 48px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-900 transition-colors">
              Oxford Grammar School
            </span>
            <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
              <span>Cambridge EdTech Campus</span>
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-600"></span>
              <span className="text-emerald-700 font-semibold lowercase">est. 1988</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs font-semibold tracking-wide transition-colors py-1 relative ${
                  isActive(link.href)
                    ? "text-emerald-800"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {!hideLoginBtn && (
            <Magnet strength={12}>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-all shadow-xs border border-emerald-900/30 group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Portal Login</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-200 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Magnet>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-18 bg-white/98 backdrop-blur-xl z-50 flex flex-col p-6 border-t border-slate-200/80 md:hidden animate-fade-in-up">
            <div className="flex flex-col gap-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-semibold py-2 transition-colors ${
                    isActive(link.href) ? "text-emerald-800" : "text-slate-800"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {!hideLoginBtn && (
              <div className="mt-auto pt-6 border-t border-slate-200">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Access Academic Portal</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
