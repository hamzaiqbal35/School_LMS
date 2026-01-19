"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function LandingNavbar({ hideLoginBtn = false }: { hideLoginBtn?: boolean }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative w-52 h-12">
                        <Image
                            src="/Logo.png"
                            alt="CampusAxis Logo"
                            fill
                            className="object-contain object-left"
                            priority
                            sizes="(max-width: 768px) 100vw, 320px"
                        />
                    </div>
                </Link>

                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
                    <Link
                        href="/"
                        className={`transition-colors hover:text-purple-600 ${isActive('/') ? 'text-slate-900 border-b-2 border-purple-600' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/about"
                        className={`transition-colors hover:text-purple-600 ${isActive('/about') ? 'text-slate-900 border-b-2 border-purple-600' : ''}`}
                    >
                        About Us
                    </Link>
                    <Link
                        href="/contact"
                        className={`transition-colors hover:text-purple-600 ${isActive('/contact') ? 'text-slate-900 border-b-2 border-purple-600' : ''}`}
                    >
                        Contact
                    </Link>
                </div>

                {!hideLoginBtn && (
                    <div className="flex gap-4">
                        <Link
                            href="/login"
                            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                        >
                            Log In
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
