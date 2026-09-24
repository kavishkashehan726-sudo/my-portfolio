"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { profile } from "@/data/profile";
import { asset } from "@/lib/asset";
import { useIntro } from "@/components/providers/IntroProvider";
import { Constellation } from "./Constellation";
import { ProjectsBadge } from "./ProjectsBadge";
import { TypingLine } from "./TypingLine";

const ease = [0.22, 1, 0.36, 1] as const;

function Line({ children, i, show }: { children: React.ReactNode; i: number; show: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.08em] [perspective:900px]">
      <motion.span
        className="block origin-[50%_100%] will-change-transform sm:whitespace-nowrap"
        initial={{ y: "105%", rotateX: -75, opacity: 0 }}
        animate={show ? { y: "0%", rotateX: 0, opacity: 1 } : undefined}
        transition={{ duration: 1.1, delay: 0.15 + i * 0.14, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** HUD rings drawn behind the portrait's shoulder. */
function Rings() {
  return (
    <svg viewBox="0 0 400 400" className="absolute h-full w-full text-ink/25" aria-hidden>
      <g className="spin-slower" style={{ transformOrigin: "200px 200px" }}>
        <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 10" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="var(--accent)" strokeOpacity=".55" strokeWidth="2" strokeDasharray="120 40 30 60 200 80" />
      </g>
      <g className="spin-reverse" style={{ transformOrigin: "200px 200px" }}>
        <circle cx="200" cy="200" r="132" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="1 5" />
        <circle cx="200" cy="200" r="112" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="60 20 10 20" />
      </g>
      <circle cx="200" cy="200" r="90" fill="none" stroke="currentColor" strokeOpacity=".6" strokeWidth="1" />
    </svg>
  );
}

export function Hero() {
  const { done } = useIntro();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section ref={ref} id="home" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <Constellation className="-z-10" />
      <div aria-hidden className="splash absolute -left-10 -top-10 -z-10 h-72 w-72 opacity-70 dark:opacity-90" />

      <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 px-5 pt-24 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:px-16 lg:pt-0">
        {/* Copy */}
        <motion.div style={{ y: textY }} className="relative z-10 flex flex-col justify-center lg:py-32">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -12 }}
            animate={done ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.8, ease }}
          >
            <TypingLine lines={profile.taglines} start={done} />
          </motion.div>
          <h1 className="font-display text-[2.3rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[3.2rem] lg:text-[2.75rem] xl:text-[3.5rem] 2xl:text-[4rem]">
            <Line i={0} show={done}>Building the Systems</Line>
            <Line i={1} show={done}>
              Businesses <span className="whitespace-nowrap text-accent">Run On</span>
            </Line>
          </h1>
          <motion.p
            className="mt-7 max-w-[34rem] text-base leading-relaxed text-ink-2 sm:text-[1.05rem]"
            initial={{ opacity: 0, y: 16 }}
            animate={done ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, delay: 0.55, ease }}
          >
            {profile.intro}
          </motion.p>
          <motion.div
            className="mt-8 sm:mt-10 lg:mt-16"
            initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
            animate={done ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
            transition={{ duration: 1, delay: 0.75, ease }}
          >
            <ProjectsBadge />
          </motion.div>
        </motion.div>

        {/* Portrait */}
        <div className="relative mt-6 flex min-h-[420px] items-end justify-center sm:min-h-[520px] lg:mt-0 lg:min-h-0">
          <motion.div
            aria-hidden
            className="absolute bottom-[8%] left-1/2 aspect-square w-[118%] max-w-[760px] -translate-x-[42%]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={done ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 1.6, delay: 0.2, ease }}
          >
            <div className="nebula absolute inset-0" />
            <div className="absolute right-[-6%] top-[18%] h-[62%] w-[62%]">
              <Rings />
            </div>
          </motion.div>
          <motion.img
            src={asset("/images/hero-portrait.webp")}
            alt={`Illustrated portrait of ${profile.name}`}
            width={1024}
            height={982}
            style={{ y: portraitY }}
            className="portrait-mask relative z-[1] h-auto max-h-[62svh] w-auto max-w-full object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,.35)] sm:max-h-[70svh] lg:max-h-[86svh]"
            initial={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
            animate={done ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
            transition={{ duration: 1.3, ease }}
          />
        </div>
      </div>
    </section>
  );
}
