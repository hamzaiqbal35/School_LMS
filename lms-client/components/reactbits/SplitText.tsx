"use client";

import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

interface SplitTextProps extends Omit<HTMLMotionProps<"span">, "children"> {
  text: string;
  className?: string;
  delay?: number;
  splitBy?: "words" | "characters";
}

export default function SplitText({
  text,
  className = "",
  delay = 0,
  splitBy = "words",
  ...props
}: SplitTextProps) {
  const items = splitBy === "words" ? text.split(" ") : text.split("");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: splitBy === "words" ? 0.08 : 0.02,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: {
      opacity: 0,
      y: 18,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 140,
      },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      {...props}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block will-change-transform"
        >
          {item}
          {splitBy === "words" && index < items.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
