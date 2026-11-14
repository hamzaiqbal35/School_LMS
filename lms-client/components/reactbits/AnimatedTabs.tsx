"use client";

import React from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  tabClassName?: string;
  activePillClassName?: string;
}

export default function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  tabClassName = "",
  activePillClassName = "bg-white text-emerald-900 shadow-xs",
}: AnimatedTabsProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-slate-100/90 p-1.5 border border-slate-200/60 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 focus:outline-hidden ${
              isActive ? "text-emerald-950" : "text-slate-600 hover:text-slate-900"
            } ${tabClassName}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className={`absolute inset-0 rounded-full ${activePillClassName}`}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
