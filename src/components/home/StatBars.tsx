"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { profile } from "@/data/profile";

const DURATION = 1600;

/** "15+" → 15 and "+", "1.5 yrs" → 1.5 and " yrs". */
function parse(value: string) {
  const m = value.match(/^([\d.]+)(.*)$/);
  const n = m ? Number(m[1]) : 0;
  return { n, suffix: m ? m[2] : value, decimals: m?.[1].includes(".") ? 1 : 0 };
}

/** One bar per unit (sites, systems, months), stepping up as the count accumulates. */
function barsFor(value: string) {
  const { n, suffix } = parse(value);
  return Math.max(1, Math.round(/yr/.test(suffix) ? n * 12 : n));
}

function Stat({ value, label, run }: { value: string; label: string; run: boolean }) {
  const { n, suffix, decimals } = parse(value);
  const bars = barsFor(value);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(n);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / DURATION);
      setShown(n * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, n]);

  const lit = n ? Math.round((shown / n) * bars) : 0;

  return (
    <li>
      <div aria-hidden className="flex h-12 items-end gap-[2px] border-b border-line pb-px">
        {Array.from({ length: bars }, (_, i) => (
          <span
            key={i}
            className="min-w-0 flex-1 origin-bottom rounded-t-[2px] bg-accent transition-[transform,opacity] duration-500 ease-out"
            style={{
              height: `${22 + (78 * (i + 1)) / bars}%`,
              transform: `scaleY(${i < lit ? 1 : 0})`,
              opacity: i < lit ? 0.25 + (0.75 * (i + 1)) / bars : 0,
            }}
          />
        ))}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-ink tabular-nums sm:text-4xl">
        <span aria-hidden>
          {shown.toFixed(decimals)}
          {suffix}
        </span>
        <span className="sr-only">{value}</span>
      </p>
      <p className="mt-2 text-xs leading-snug text-ink-2 sm:text-sm">{label}</p>
    </li>
  );
}

/** The headline numbers: each counts up while a bar chart of its units rises beside it. */
export function StatBars() {
  const ref = useRef<HTMLUListElement>(null);
  const run = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return (
    <ul ref={ref} className="grid grid-cols-3 gap-4 sm:gap-6">
      {profile.stats.map((s) => (
        <Stat key={s.label} value={s.value} label={s.label} run={run} />
      ))}
    </ul>
  );
}
