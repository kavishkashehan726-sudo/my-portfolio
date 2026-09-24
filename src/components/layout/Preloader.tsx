"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { IconType } from "react-icons";
import {
  SiDocker, SiGithub, SiNestjs, SiNextdotjs, SiNodedotjs, SiPhp, SiPostgresql,
  SiReact, SiTailwindcss, SiThreedotjs, SiTypescript, SiVuedotjs,
} from "react-icons/si";
import { useIntro } from "@/components/providers/IntroProvider";
import { useLenis } from "lenis/react";
import { asset } from "@/lib/asset";

type Planet = [IconType, string, string];

const inner: Planet[] = [
  [SiReact, "React", "#61dafb"], [SiNextdotjs, "Next.js", "#ffffff"], [SiTypescript, "TypeScript", "#3178c6"], [SiTailwindcss, "Tailwind CSS", "#38bdf8"],
];
const outer: Planet[] = [
  [SiNestjs, "NestJS", "#e0234e"], [SiNodedotjs, "Node.js", "#5fa04e"], [SiPostgresql, "PostgreSQL", "#6b8cff"], [SiDocker, "Docker", "#2496ed"],
  [SiGithub, "GitHub", "#ffffff"], [SiPhp, "PHP", "#8f93d6"], [SiVuedotjs, "Vue", "#4fc08d"], [SiThreedotjs, "Three.js", "#ffffff"],
];

const MIN_MS = 2400;

function Ring({ icons, radius, duration, reverse }: { icons: Planet[]; radius: number; duration: number; reverse?: boolean }) {
  return (
    <div
      className="orbit-ring absolute left-1/2 top-1/2 rounded-full border border-white/10"
      style={{
        width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius,
        animation: `spin-slow ${duration}s linear infinite${reverse ? " reverse" : ""}`,
      }}
    >
      {icons.map(([Icon, name, color], i) => {
        const angle = (i / icons.length) * Math.PI * 2;
        return (
          <div
            key={name}
            className="orbit-slot absolute left-1/2 top-1/2"
            style={{ transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)` }}
          >
            <div
              className="orbit-icon -ml-5 -mt-5 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#171430] shadow-[0_0_20px_rgba(255,59,63,.15)]"
              style={{ color, animation: `spin-slow ${duration}s linear infinite${reverse ? "" : " reverse"}` }}
              title={name}
            >
              <Icon size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Opening sequence: waving avatar with the tech stack in orbit, then the icons scatter and the page is revealed. */
export function Preloader() {
  const { finish } = useIntro();
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = { v: 0 };

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((res) => {
        const img = new Image();
        img.onload = img.onerror = () => res();
        img.src = asset("/images/hero-portrait.webp");
      }),
      new Promise((res) => setTimeout(res, calm ? 300 : MIN_MS)),
    ]);

    const count = gsap.to(counter, {
      v: 92, duration: calm ? 0.3 : MIN_MS / 1000, ease: "power2.out",
      onUpdate: () => setPct(Math.round(counter.v)),
    });

    let tl: gsap.core.Timeline | undefined;
    ready.then(() => {
      count.kill();
      tl = gsap.timeline({ onComplete: () => setGone(true) });
      tl.to(counter, { v: 100, duration: 0.3, onUpdate: () => setPct(Math.round(counter.v)) });
      if (!calm) {
        const q = gsap.utils.selector(el);
        q(".orbit-slot").forEach((slot) => {
          const a = Math.random() * Math.PI * 2;
          tl!.to(slot, { x: `+=${Math.cos(a) * 600}`, y: `+=${Math.sin(a) * 600}`, opacity: 0, duration: 0.9, ease: "power3.in" }, 0.3);
        });
        tl.to(q(".orbit-ring"), { borderColor: "rgba(255,255,255,0)", duration: 0.5 }, 0.4);
        tl.to(q(".pre-avatar"), { scale: 2.4, opacity: 0, filter: "blur(10px)", duration: 1, ease: "power3.inOut" }, 0.9);
        tl.to(q(".pre-status"), { opacity: 0, y: 12, duration: 0.4 }, 0.6);
      }
      tl.add(() => finish(), calm ? 0.2 : 1.35);
      tl.to(el, { opacity: 0, duration: calm ? 0.2 : 0.7, ease: "power2.out" }, calm ? 0.2 : 1.35);
    });

    return () => {
      count.kill();
      tl?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-[#07060f] text-white" role="status" aria-live="polite">
      <div className="relative h-[440px] w-[440px] max-w-[100vw] scale-[.72] sm:scale-100">
        <Ring icons={outer} radius={200} duration={36} reverse />
        <Ring icons={inner} radius={128} duration={24} />
        <div className="pre-avatar absolute left-1/2 top-1/2 -ml-[76px] -mt-[76px] h-[152px] w-[152px] overflow-hidden rounded-full shadow-[0_0_60px_rgba(160,150,255,.25)] ring-1 ring-white/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/images/avatar.webp")}
            alt=""
            className="h-full w-full object-cover"
            style={{ animation: "wave 2.4s ease-in-out infinite", transformOrigin: "50% 90%" }}
          />
        </div>
      </div>
      <div className="pre-status absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-white/60">
        <span>INITIALIZING EXPERIENCE…</span>
        <span className="text-[#ff3b3f]">{String(pct).padStart(3, "0")}%</span>
        <span className="sr-only">Loading, {pct} percent</span>
      </div>
    </div>
  );
}
