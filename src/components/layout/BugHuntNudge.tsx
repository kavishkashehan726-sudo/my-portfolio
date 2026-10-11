"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LuX } from "react-icons/lu";
import { useIntro } from "@/components/providers/IntroProvider";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { BUG_BODY, BUG_LEGS_A, BUG_LEGS_B, pixelRuns } from "@/lib/bugSprite";

const KEY = "bug-nudge-closed";
const MESSAGE = "Help me kill the bugs!";
const WIDTH = 276;

const COLORS: Record<string, string> = {
  S: "var(--accent)",
  H: "color-mix(in srgb, var(--accent) 62%, #1a0a10)",
  K: "#1a0a10",
  E: "#ffffff",
  A: "#8a8799",
  L: "#8a8799",
};

function Pixels({ rows, top }: { rows: string[]; top: number }) {
  return pixelRuns(rows, top).map((p) => <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={p.w} height={1} fill={COLORS[p.c]} />);
}

type Spot = { left: number; top: number; tail: number; ring: DOMRect };

/** Where the bubble goes: under whichever bug hunt link is showing, tail pointing at its middle. */
function measure(): Spot | null {
  const link = [...document.querySelectorAll<HTMLElement>("[data-bug-hunt-link]")].find((el) => el.offsetParent !== null);
  if (!link) return null;
  const r = link.getBoundingClientRect();
  const mid = r.left + r.width / 2;
  const left = Math.min(Math.max(12, mid - WIDTH / 2), innerWidth - WIDTH - 12);
  return { left, top: r.bottom + 16, tail: mid - left, ring: r };
}

/**
 * A speech bubble under the "Squash the bug" button, popping up once the intro is done and
 * inviting visitors to play. Closing it keeps it away for the rest of the visit; it also steps
 * aside while the page is scrolled down.
 */
export function BugHuntNudge() {
  const { done } = useIntro();
  const pathname = usePathname() ?? "/";
  const hunting = pathname.startsWith("/bug-hunt");
  const [closed, setClosed] = useState(true);
  const [ready, setReady] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    try {
      setClosed(sessionStorage.getItem(KEY) === "1");
    } catch {
      setClosed(false);
    }
  }, []);

  // Visiting the game counts as having seen the invitation.
  useEffect(() => {
    if (!hunting) return;
    setClosed(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  }, [hunting]);

  // Pop up a moment after the intro hands over to the page.
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(t);
  }, [done]);

  const show = ready && !closed && !hunting && atTop && !!spot;

  useEffect(() => {
    if (closed || hunting) return;
    const place = () => setSpot(measure());
    const scroll = () => setAtTop(scrollY < 320);
    place();
    scroll();
    addEventListener("resize", place);
    addEventListener("scroll", scroll, { passive: true });
    return () => {
      removeEventListener("resize", place);
      removeEventListener("scroll", scroll);
    };
  }, [closed, hunting, ready]);

  // Type the message out once the bubble has popped.
  useEffect(() => {
    if (!show) return;
    setTyped(0);
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setTyped(i);
      if (i >= MESSAGE.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [show]);

  const close = () => {
    setClosed(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {show && spot && (
        <>
          {/* A soft pulse around the button it points at */}
          <motion.span
            key="ring"
            aria-hidden
            className="nudge-ring pointer-events-none fixed z-[56] rounded-full"
            style={{ left: spot.ring.left, top: spot.ring.top, width: spot.ring.width, height: spot.ring.height }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            key="bubble"
            role="status"
            className="fixed z-[56]"
            style={{ left: spot.left, top: spot.top, width: WIDTH, transformOrigin: `${spot.tail}px -12px` }}
            initial={{ opacity: 0, scale: 0.3, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -8, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
          >
            <div className="nudge-float relative">
              {/* Tail pointing up at the button */}
              <svg aria-hidden width="24" height="15" viewBox="0 0 24 15" className="absolute -top-[13px]" style={{ left: spot.tail - 12 }}>
                <path d="M1 15 L12 1.5 L23 15" fill="var(--bg-2)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <TransitionLink
                href="/bug-hunt"
                className="group flex items-center gap-3 rounded-2xl border-2 border-ink bg-bg-2 py-3 pl-3.5 pr-9 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.45),0_0_0_4px_rgb(227_38_58/0.08)] transition-colors hover:border-accent"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/12">
                  <svg data-look="walk" viewBox="0 -1 16 12" className="nudge-bug h-auto w-7" shapeRendering="crispEdges" aria-hidden>
                    <Pixels rows={BUG_BODY} top={0} />
                    <g className="bug-legs-a">
                      <Pixels rows={BUG_LEGS_A} top={9} />
                    </g>
                    <g className="bug-legs-b">
                      <Pixels rows={BUG_LEGS_B} top={9} />
                    </g>
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[0.95rem] font-semibold leading-tight text-ink">
                    <span aria-hidden>{MESSAGE.slice(0, typed)}</span>
                    <span aria-hidden className={`ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-accent ${typed >= MESSAGE.length ? "opacity-0" : ""}`} />
                    <span className="sr-only">{MESSAGE}</span>
                  </span>
                  <span className="mt-1 block font-mono text-[11px] text-ink-2 transition-colors group-hover:text-accent">Play the bug hunt →</span>
                </span>
              </TransitionLink>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-ink-2 transition-colors hover:bg-accent hover:text-white"
              >
                <LuX size={13} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
