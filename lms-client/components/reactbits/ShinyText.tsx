"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  className?: string;
  textColor?: string;
  shimmerColor?: string;
  speed?: number;
}

export default function ShinyText({
  text,
  className = "",
  textColor = "#064e3b",
  shimmerColor = "#10b981",
  speed = 3.5,
}: ShinyTextProps) {
  return (
    <span
      className={`relative inline-block font-bold bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(110deg, ${textColor} 25%, ${shimmerColor} 50%, ${textColor} 75%)`,
        backgroundSize: "200% 100%",
        animation: `shiny-shimmer ${speed}s ease-in-out infinite`,
      }}
    >
      {text}
    </span>
  );
}
