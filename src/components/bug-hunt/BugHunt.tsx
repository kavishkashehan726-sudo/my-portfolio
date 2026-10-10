"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import { LuPause, LuPlay, LuRotateCcw, LuVolume2, LuVolumeX } from "react-icons/lu";
import { Game, type Hud } from "./engine/game";

const SOUND_KEY = "bug-hunt-sound";

const iconButton =
  "grid h-10 w-10 place-items-center rounded-full border border-line bg-[var(--nav-bg)] text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent";
const primaryButton =
  "rounded-full bg-accent px-6 py-2.5 font-mono text-sm text-white transition-transform hover:scale-[1.03] focus-visible:outline-offset-4";
const secondaryButton =
  "rounded-full border border-line px-6 py-2.5 font-mono text-sm text-ink transition-colors hover:border-accent hover:text-accent";

/** The study room where the bugs come for me. A canvas game with a React HUD on top. */
export function BugHunt() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const [hud, setHud] = useState<Hud>({ phase: "ready", score: 0, best: 0 });
  const [sound, setSound] = useState(true);
  const { resolvedTheme, setTheme } = useTheme();
  const theme = useRef({ resolvedTheme, setTheme });
  theme.current = { resolvedTheme, setTheme };

  useEffect(() => {
    const el = stage.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const g = new Game(canvas.current!, {
      onHud: setHud,
      reduced,
      // Tapping the bulb flips the light switch, which is the site's theme.
      onLightSwitch: () => {
        const { resolvedTheme: now, setTheme: set } = theme.current;
        set(now === "dark" ? "light" : "dark");
      },
    });
    game.current = g;
    g.setDark(document.documentElement.dataset.theme === "dark");
    try {
      const off = localStorage.getItem(SOUND_KEY) === "off";
      g.setSound(!off);
      setSound(!off);
    } catch {
      // Storage blocked: sound stays on.
    }

    const fit = () => {
      const r = el.getBoundingClientRect();
      g.resize(r.width, r.height);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    // Only animate while the room is on screen and the tab is visible; pause the game when it isn't.
    let inView = true;
    const sync = () => {
      const on = inView && document.visibilityState === "visible";
      g.setRunning(on);
      if (!on) g.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      g.destroy();
      game.current = null;
    };
  }, []);

  useEffect(() => {
    if (resolvedTheme) game.current?.setDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  // Keyboard: P / Esc pauses, R restarts, Enter starts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = game.current;
      if (!g || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable]")) return;
      const key = e.key.toLowerCase();
      if (key === "p" || key === "escape") {
        if (hud.phase === "playing") g.pause();
        else if (hud.phase === "paused") g.resume();
        else return;
      } else if (key === "r" && hud.phase !== "ready") g.restart();
      else if (key === "enter" && (hud.phase === "ready" || hud.phase === "over") && e.target === document.body) g.start();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hud.phase]);

  const toggleSound = () => {
    const on = !sound;
    setSound(on);
    game.current?.setSound(on);
    try {
      localStorage.setItem(SOUND_KEY, on ? "on" : "off");
    } catch {
      // Storage blocked: the choice lasts until reload.
    }
  };

  const { phase, score, best } = hud;
  const inGame = phase === "playing" || phase === "paused";

  return (
    <section ref={stage} aria-labelledby="bug-hunt-title" className="relative h-[clamp(380px,100svh,135vw)] overflow-hidden bg-bg">
      <canvas
        ref={canvas}
        className="absolute inset-0 block h-full w-full touch-pan-y select-none"
        role="img"
        aria-label="A study room. A bug crawls out of a hole in the wall, lands on the desk and walks toward me at my computer. A slingshot and a crate of balls stand on the floor to the left, and a bulb hangs from the ceiling."
      />

      {/* Score and controls */}
      <div className="pointer-events-none absolute inset-x-0 top-20 z-10 mx-auto flex max-w-[1400px] items-start justify-between gap-4 px-5 sm:top-24 sm:px-10 lg:pl-16 lg:pr-28 [@media(max-height:500px)]:top-16">
        <div>
          <h1 id="bug-hunt-title" className="eyebrow [@media(max-height:500px)]:sr-only">
            Bug hunt
          </h1>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl [@media(max-height:500px)]:mt-0 [@media(max-height:500px)]:text-2xl" aria-live="polite">
            <span className="sr-only">Bugs squashed: </span>
            <span aria-hidden className="mr-2 text-base font-normal text-ink-2 sm:text-lg">
              Squashed
            </span>
            {String(score).padStart(2, "0")}
          </p>
          <p className="mt-1 font-mono text-xs text-ink-2 [@media(max-height:500px)]:hidden">Best {String(best).padStart(2, "0")}</p>
          <p className="mt-3 hidden max-w-[11rem] text-xs leading-snug text-ink-2 [@media(orientation:portrait)_and_(max-width:640px)]:block">
            Turn your phone sideways for a bigger room.
          </p>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button type="button" onClick={toggleSound} className={iconButton} aria-label={sound ? "Mute sound" : "Turn sound on"} title={sound ? "Mute" : "Sound on"}>
            {sound ? <LuVolume2 size={16} /> : <LuVolumeX size={16} />}
          </button>
          {inGame && (
            <>
              <button
                type="button"
                onClick={() => (phase === "paused" ? game.current?.resume() : game.current?.pause())}
                className={iconButton}
                aria-label={phase === "paused" ? "Resume (P)" : "Pause (P)"}
                title={phase === "paused" ? "Resume (P)" : "Pause (P)"}
              >
                {phase === "paused" ? <LuPlay size={16} /> : <LuPause size={16} />}
              </button>
              <button type="button" onClick={() => game.current?.restart()} className={iconButton} aria-label="Restart (R)" title="Restart (R)">
                <LuRotateCcw size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Start, pause and game over cards */}
      <AnimatePresence>
        {phase !== "playing" && phase !== "dying" && (
          <motion.div
            key={phase}
            className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center px-5 pt-40 sm:pt-[clamp(220px,31vh,320px)] [@media(max-height:560px)]:items-center [@media(max-height:560px)]:pt-14"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-auto w-full max-w-md rounded-[1.75rem] border border-line bg-bg/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,.18)] backdrop-blur-xl sm:p-7 [@media(max-height:560px)]:p-5">
              {phase === "ready" && (
                <>
                  <p className="eyebrow">Squash the bug</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">Bugs are coming for me.</h2>
                  <ol className="mt-4 space-y-1.5 text-sm leading-relaxed text-ink-2">
                    <li>
                      <span className="font-mono text-accent">01</span> Grab a ball from the crate and drop it in the slingshot.
                    </li>
                    <li>
                      <span className="font-mono text-accent">02</span> Pull back, aim, let go. Mid-air hits score double.
                    </li>
                    <li>
                      <span className="font-mono text-accent">03</span> Don&apos;t let one reach my head.
                    </li>
                  </ol>
                  <p className="mt-3 text-xs text-ink-2">Drag the bulb to swing it. Tap it to flip the light.</p>
                  <button type="button" onClick={() => game.current?.start()} className={`${primaryButton} mt-5`}>
                    Start hunting
                  </button>
                </>
              )}
              {phase === "paused" && (
                <>
                  <p className="eyebrow">Paused</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">The bug is waiting too.</h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => game.current?.resume()} className={primaryButton}>
                      Resume
                    </button>
                    <button type="button" onClick={() => game.current?.restart()} className={secondaryButton}>
                      Restart
                    </button>
                  </div>
                </>
              )}
              {phase === "over" && (
                <>
                  <p className="eyebrow">System compromised</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">The bug got me.</h2>
                  <p className="mt-2 text-sm text-ink-2">
                    You squashed <span className="font-semibold text-ink">{score}</span> {score === 1 ? "bug" : "bugs"}
                    {score > 0 && score >= best ? ", a new best." : `. Best so far: ${best}.`}
                  </p>
                  <button type="button" onClick={() => game.current?.restart()} className={`${primaryButton} mt-5`}>
                    Try again
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
