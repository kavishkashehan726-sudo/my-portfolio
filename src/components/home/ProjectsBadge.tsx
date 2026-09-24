"use client";

import { LuArrowRight } from "react-icons/lu";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Magnetic } from "@/components/ui/Magnetic";

// Scalloped seal outline, like a wax stamp.
const scallop = (() => {
  const n = 28, r = 74, amp = 3.2, cx = 80, cy = 80;
  const pts: string[] = [];
  for (let i = 0; i <= 360; i += 2) {
    const a = (i * Math.PI) / 180;
    const rr = r + Math.sin(a * n) * amp;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

/** Circular "My projects" seal with text that slowly turns. */
export function ProjectsBadge() {
  return (
    <Magnetic strength={0.25}>
      <TransitionLink href="/projects" aria-label="See my projects" className="group relative block h-28 w-28 sm:h-40 sm:w-40">
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full text-ink/70 transition-colors group-hover:text-accent" aria-hidden>
          <path d={scallop} fill="none" stroke="currentColor" strokeWidth="1" />
          <g className="spin-slow" style={{ transformOrigin: "80px 80px" }}>
            <defs>
              <path id="badge-circle" d="M80,80 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
            </defs>
            <text className="fill-ink font-mono text-[11.5px] uppercase tracking-[0.32em]">
              <textPath href="#badge-circle">My projects • My projects •</textPath>
            </text>
          </g>
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-11 w-11 place-items-center rounded-full text-ink transition-all duration-300 group-hover:bg-accent group-hover:text-white">
            <LuArrowRight size={22} className="transition-transform duration-300 group-hover:-rotate-45" />
          </span>
        </span>
      </TransitionLink>
    </Magnetic>
  );
}
