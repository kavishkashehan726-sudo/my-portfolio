"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { profile } from "@/data/profile";
import { asset } from "@/lib/asset";
import { useIntro } from "@/components/providers/IntroProvider";
import { Constellation } from "./Constellation";
import { LuArrowRight, LuHand } from "react-icons/lu";
import { TransitionLink } from "@/components/ui/TransitionLink";
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

/** A line-drawn hand in a soft red ring that waves now and then, with motion lines beside it. */
function WavingHand() {
  return (
    <span aria-hidden className="relative inline-grid h-10 w-10 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent">
      <LuHand size={19} strokeWidth={2.1} className="hand-wave" />
      <svg viewBox="0 0 16 16" className="hand-lines absolute -right-2 -top-2 h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M8.5 4 A6 6 0 0 1 12 8" />
        <path d="M9.5 1 A9.5 9.5 0 0 1 15 7" />
      </svg>
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
          <motion.p
            className="flex items-center gap-2.5 font-mono text-sm text-ink-2 sm:text-base"
            initial={{ opacity: 0, x: -12 }}
            animate={done ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.8, ease }}
          >
            <WavingHand />
            Hi, I&rsquo;m
          </motion.p>
          <h1 className="mt-3 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[3.6rem] lg:text-[3.3rem] xl:text-[4.1rem] 2xl:text-[4.6rem]">
            <Line i={0} show={done}>
              {profile.name}
              <span className="text-accent">.</span>
            </Line>
          </h1>
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, x: -12 }}
            animate={done ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.8, delay: 0.35, ease }}
          >
            <TypingLine lines={profile.taglines} start={done} />
          </motion.div>
          <motion.div
            className="mt-7 max-w-[36rem] space-y-4 text-base leading-relaxed text-ink-2 sm:text-[1.05rem]"
            initial={{ opacity: 0, y: 16 }}
            animate={done ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, delay: 0.5, ease }}
          >
            <p>
              I&rsquo;m a software engineer at {profile.company.name} and a BSE (Hons) undergraduate at The Open University of Sri
              Lanka. I like owning a product end to end: designing the screens, writing the backend, and setting up the server it
              runs on.
            </p>
            <p>
              For the past year and a half I&rsquo;ve been building{" "}
              <span className="font-medium text-ink">
                the systems businesses <span className="whitespace-nowrap text-accent">run on</span>
              </span>{" "}
              (POS and ERP tills, distribution and credit control, learning platforms and multi-tenant SaaS), and more than 15 of
              them are live today.
            </p>
          </motion.div>
          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={done ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, delay: 0.7, ease }}
          >
            <TransitionLink
              href="/projects"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white shadow-[0_10px_30px_-10px_var(--glow)] transition-transform hover:scale-[1.03]"
            >
              View my work
              <LuArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden />
            </TransitionLink>
            <TransitionLink
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Get in touch
            </TransitionLink>
            <motion.div
              className="ml-1 sm:ml-3"
              initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
              animate={done ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
              transition={{ duration: 1, delay: 0.85, ease }}
            >
              <ProjectsBadge className="h-24 w-24 sm:h-32 sm:w-32" />
            </motion.div>
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
