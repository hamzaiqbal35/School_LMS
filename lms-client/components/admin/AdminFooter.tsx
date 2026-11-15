"use client";

import React from "react";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500 text-center md:text-left">
            <p className="font-medium text-slate-700">
              &copy; {currentYear} Oxford Grammar &amp; Cambridge EdTech School. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Administrative Control Board &bull; Academic Year 2026–27
            </p>
          </div>

          <div className="text-[11px] text-slate-400">
            Oxford Grammar School
          </div>
        </div>
      </div>
    </footer>
  );
}
