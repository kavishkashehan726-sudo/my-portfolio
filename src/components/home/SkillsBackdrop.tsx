"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Full-width art behind the skills section: a deep navy field with a dot texture, red ribbons
 * sweeping in from two corners and fine light lines tracing them. The ribbons drift with scroll.
 */
export function SkillsBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const low = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);
  const high = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-50, 50]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#0f0c25_0%,#181339_55%,#0c0a1f_100%)]" />
      <div className="skills-dots absolute inset-0" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ribbon-a" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#b5162b" />
            <stop offset="0.6" stopColor="#e3263a" />
            <stop offset="1" stopColor="#ff5a3d" />
          </linearGradient>
          <linearGradient id="ribbon-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff5a3d" />
            <stop offset="1" stopColor="#9e1426" />
          </linearGradient>
          <radialGradient id="ribbon-glow">
            <stop offset="0" stopColor="#ff3b3f" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ff3b3f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Bottom-left sweep */}
        <motion.g style={{ y: low }}>
          <g className="ribbon-drift">
            <circle cx="160" cy="820" r="320" fill="url(#ribbon-glow)" />
            <path d="M-60 560 C170 500 300 650 420 770 C500 850 570 890 660 920 L-60 920Z" fill="url(#ribbon-a)" />
            <path d="M-60 650 C140 610 240 730 340 830 C390 880 440 905 500 920 L-60 920Z" fill="#ff6b4f" opacity="0.55" />
            <path d="M-60 500 C200 430 340 600 470 730 C560 820 650 870 760 920" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="2" />
            <path d="M-60 470 C220 395 370 575 505 710 C600 805 700 860 830 920" fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="1.5" />
          </g>
        </motion.g>

        {/* Top-right sweep */}
        <motion.g style={{ y: high }}>
          <g className="ribbon-drift" style={{ animationDelay: "-6s" }}>
            <circle cx="1300" cy="80" r="300" fill="url(#ribbon-glow)" />
            <path d="M1500 -20 L880 -20 C1030 50 1070 190 1190 250 C1300 305 1400 300 1500 350Z" fill="url(#ribbon-b)" />
            <path d="M1500 -20 L1070 -20 C1170 40 1200 140 1290 185 C1370 222 1430 220 1500 245Z" fill="#ff6b4f" opacity="0.45" />
            <path d="M820 -20 C980 60 1020 220 1160 290 C1280 350 1390 345 1500 400" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="2" />
            <path d="M770 -20 C940 70 990 250 1140 325 C1270 390 1390 385 1500 445" fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="1.5" />
          </g>
        </motion.g>
      </svg>

      {/* Fade into the page above and below */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
    </div>
  );
}
