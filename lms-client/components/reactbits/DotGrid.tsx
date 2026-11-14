"use client";

import React from "react";

interface DotGridProps {
  dotSize?: number;
  gap?: number;
  color?: string;
  className?: string;
  fadeEdges?: boolean;
}

export default function DotGrid({
  dotSize = 1.2,
  gap = 24,
  color = "rgba(15, 23, 42, 0.08)",
  className = "",
  fadeEdges = true,
}: DotGridProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      style={{
        maskImage: fadeEdges
          ? "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)"
          : undefined,
        WebkitMaskImage: fadeEdges
          ? "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)"
          : undefined,
      }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="dot-pattern"
            x="0"
            y="0"
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={gap / 2} cy={gap / 2} r={dotSize} fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>
    </div>
  );
}
