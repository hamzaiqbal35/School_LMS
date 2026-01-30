"use client"
import Link from 'next/link';

export default function AdminFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500 text-center md:text-left">
                        <p>&copy; {currentYear} School Management System. All rights reserved.</p>
                        <p className="text-xs mt-1">Designed for Excellence.</p>
                    </div>



                    <div className="text-xs text-gray-400">
                        Version 1.3.0
                    </div>
                </div>
            </div>
        </footer>
    );
}
