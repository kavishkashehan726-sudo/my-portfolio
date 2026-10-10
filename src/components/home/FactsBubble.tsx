"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { IconType } from "react-icons";
import { LuBuilding2, LuGraduationCap, LuMapPin, LuUsers } from "react-icons/lu";
import {
  SiDocker, SiElectron, SiGit, SiLinux, SiMysql, SiNestjs, SiNextdotjs, SiNginx,
  SiNodedotjs, SiPhp, SiPostgresql, SiReact, SiTailwindcss, SiTypescript,
} from "react-icons/si";
import { profile } from "@/data/profile";

const facts = [
  { icon: LuMapPin, label: "Based in", value: profile.location },
  { icon: LuBuilding2, label: "Working at", value: profile.company.name, href: profile.company.url },
  { icon: LuGraduationCap, label: "Studying", value: profile.education },
  { icon: LuUsers, label: "Clients include", value: "Maliban distribution, hospitals, restaurants, law firms and schools" },
];

/** The stack, in brand colours, ordered so neighbours around the panel differ. */
const tech: [IconType, string][] = [
  [SiReact, "#61dafb"], [SiDocker, "#2496ed"], [SiTypescript, "#3178c6"], [SiNginx, "#009639"],
  [SiNextdotjs, "var(--ink)"], [SiPostgresql, "#6b8cff"], [SiNodedotjs, "#5fa04e"], [SiGit, "#f05032"],
  [SiTailwindcss, "#38bdf8"], [SiNestjs, "#e0234e"], [SiPhp, "#8f93d6"], [SiLinux, "var(--ink)"],
  [SiMysql, "#4479a1"], [SiElectron, "#47848f"],
];

/** Where icon i rests: around the panel's edge, at an even angle with a nudge. */
function restingSpot(i: number, w: number, h: number, gap: number) {
  // Phones have no room beside the card: split the icons into a row above it and a row below.
  if (w < 520) {
    const half = Math.ceil(tech.length / 2);
    const below = i >= half;
    const k = below ? i - half : i;
    const n = below ? tech.length - half : half;
    return {
      x: -w / 2 + 24 + ((w - 48) * k) / Math.max(1, n - 1),
      y: (below ? 1 : -1) * (h / 2 + gap) + Math.sin(i * 2.1) * 6,
      spin: Math.sin(i * 1.7) * 28,
    };
  }
  const a = -Math.PI / 2 + (i / tech.length) * Math.PI * 2 + Math.sin(i * 2.3) * 0.12;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  // Sit on the left and right rims (the side nav floats nearby), with room above and below.
  const hx = w / 2 + gap * 0.2;
  const hy = h / 2 + gap;
  const t = Math.min(hx / Math.max(Math.abs(cos), 1e-3), hy / Math.max(Math.abs(sin), 1e-3));
  return { x: cos * t, y: sin * t, spin: Math.sin(i * 1.7) * 28 };
}

function ScatterIcon({ i, progress, w, h, gap }: { i: number; progress: MotionValue<number>; w: number; h: number; gap: number }) {
  const [Icon, color] = tech[i];
  const spot = restingSpot(i, w, h, gap);
  const from = 0.08 + (i % 5) * 0.05;
  const range = [from, from + 0.55];
  const x = useTransform(progress, range, [0, spot.x]);
  const y = useTransform(progress, range, [0, spot.y]);
  const rotate = useTransform(progress, range, [0, spot.spin]);
  const scale = useTransform(progress, range, [0.4, 1]);
  // Stays hidden while it's still behind the card, then fades in as it clears the edge.
  const opacity = useTransform(progress, [from + 0.15, from + 0.4], [0, 1]);
  return (
    <motion.span className="absolute left-1/2 top-1/2 -ml-[22px] -mt-[22px]" style={{ x, y, rotate, scale, opacity }}>
      <span className="bubble-chip grid h-11 w-11 place-items-center rounded-full" style={{ animationDelay: `${-i * 0.7}s` }}>
        <Icon size={19} style={{ color }} />
      </span>
    </motion.span>
  );
}

/**
 * The facts card as a soap bubble. As it scrolls into view, the stack's icons float out from
 * behind it and settle around its edge.
 */
export function FactsBubble() {
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start end", "center center"] });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gap = size.w < 520 ? 26 : 36;

  return (
    <div ref={wrap} className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {size.w > 0 && tech.map((_, i) => <ScatterIcon key={i} i={i} progress={progress} w={size.w} h={size.h} gap={gap} />)}
      </div>
      <dl data-bug-land className="bubble relative divide-y divide-line">
        {facts.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="flex gap-4 p-5 sm:p-6">
            <Icon className="mt-0.5 shrink-0 text-accent" size={18} aria-hidden />
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2">{label}</dt>
              <dd className="mt-1 text-ink">
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="underline decoration-accent/50 underline-offset-4 hover:text-accent">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
