"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { useIntro } from "@/components/providers/IntroProvider";
import { useBugHidden } from "@/lib/bugStore";

/* ---------- Sprite: pixel bug facing right, feet on row 10, wings above row 0 ---------- */

const COLORS: Record<string, string> = {
  S: "var(--accent)",
  H: "color-mix(in srgb, var(--accent) 62%, #1a0a10)",
  K: "#1a0a10",
  E: "#ffffff",
  A: "#8a8799",
  L: "#8a8799",
  W: "#a9c8f5",
};

const BODY = [
  ".............A..",
  "....SSSS....A...",
  "..SSSSSSSS.HH...",
  ".SSKSSSKSSHHHH..",
  ".SSSKSKSSSHHEH..",
  ".SSSSKSSSSHHHHH.",
  ".SSSKSKSSSHHHH..",
  ".SSKSSSKSSHHH...",
  "...SSSSSSSS.....",
];
const LEGS_A = ["...L..L..L......", "..L..L..L......."];
const LEGS_B = ["....L..L..L.....", ".....L..L..L...."];
const WINGS = [".......WW.......", "...WW.WWWW......", "..WWWWWWWW......", "...WWWWWW......."];

/** Turns rows of letters into runs of same-coloured pixels. */
function pixels(rows: string[], top: number) {
  return rows.flatMap((row, y) => {
    const runs: { x: number; y: number; w: number; c: string }[] = [];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === ".") continue;
      const last = runs[runs.length - 1];
      if (last && last.c === c && last.x + last.w === x) last.w++;
      else runs.push({ x, y: y + top, w: 1, c });
    }
    return runs;
  });
}

function Pixels({ rows, top }: { rows: string[]; top: number }) {
  return pixels(rows, top).map((p) => <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={p.w} height={1} fill={COLORS[p.c]} />);
}

/* ---------- Behaviour ---------- */

const BOX = 'main article, main form, main [class*="rounded-2xl"], main [class*="rounded-3xl"], [data-bug-land]';
const TEXT = "main h1, main h2, main h3, main p, footer p";
const SCARE_PX = 50;

type Spot = { el: Element; along: number; x: number; y: number; area: number; box: boolean };

/**
 * A pixel bug that crawls out of the header tunnel, lands on the biggest card in view (or text),
 * walks along its top edge, flies off when the page scrolls and escapes the cursor like a housefly.
 */
export function Bug() {
  const { done } = useIntro();
  const reduce = useReducedMotion();
  const hidden = useBugHidden();
  const active = done && reduce === false && !hidden;
  const root = useRef<HTMLDivElement>(null);
  const flip = useRef<HTMLDivElement>(null);
  const sprite = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!active) return;
    const el = root.current!;
    const face = flip.current!;
    const header = document.querySelector("[data-site-header]");
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const clamp = (lo: number, hi: number, v: number) => Math.min(hi, Math.max(lo, v));

    type Mode = "emerging" | "flying" | "hovering" | "landed" | "fleeing";
    let mode: Mode = "emerging";
    const pos = { x: -200, y: -200 };
    let landing: { el: Element; along: number } | null = null;
    let pointer: { x: number; y: number } | null = null;
    let move: gsap.core.Animation | null = null;
    let timer: gsap.core.Animation | null = null;
    let bob: gsap.core.Animation | null = null;
    let restless: gsap.core.Animation | null = null;
    let lastScroll = 0;
    let calm = 0;

    const unit = () => (sprite.current?.getBoundingClientRect().width ?? 48) / 16;
    const bounds = () => ({
      l: 20,
      r: innerWidth - (innerWidth >= 1024 ? 110 : 20),
      t: (header?.getBoundingClientRect().bottom ?? 80) + 40,
      b: innerHeight - 16,
    });
    const place = () => gsap.set(el, { x: pos.x, y: pos.y });
    const look = (l: "walk" | "fly" | "still") => (el.dataset.look = l);
    const turn = (dx: number) => Math.abs(dx) > 0.3 && gsap.set(face, { scaleX: dx < 0 ? -1 : 1 });
    const near = (px: number) => !!pointer && Math.hypot(pointer.x - pos.x, pointer.y - (pos.y - 6 * unit())) < px;
    const stop = () => {
      move?.kill();
      timer?.kill();
      bob?.kill();
      restless?.kill();
      move = timer = bob = restless = null;
    };

    /* Candidates in view, kept fresh by an IntersectionObserver */
    const inView = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target);
        else inView.delete(e.target);
      }
    });
    const scan = () => {
      io.disconnect();
      inView.clear();
      document.querySelectorAll(`${BOX}, ${TEXT}`).forEach((n) => {
        if (!n.closest("[data-bug-skip], [aria-hidden='true'], .sr-only")) io.observe(n);
      });
    };
    let rescan: number | undefined;
    const mo = new MutationObserver(() => {
      clearTimeout(rescan);
      rescan = window.setTimeout(scan, 300);
    });
    const main = document.getElementById("main");
    if (main) mo.observe(main, { childList: true, subtree: true });
    scan();

    /** Where the bug would stand on an element's top edge, or null if it can't land there. */
    const spotOn = (n: Element, towardX: number): Spot | null => {
      const r = n.getBoundingClientRect();
      const b = bounds();
      const box = n.matches(BOX);
      if (r.width < (box ? 140 : 60) || (box && r.height < 60)) return null;
      if (r.top < b.t || r.top > b.b - 10) return null;
      const lo = Math.max(r.left + 16, b.l);
      const hi = Math.min(r.right - 16, b.r);
      if (hi - lo < 24) return null;
      const x = clamp(lo, hi, towardX);
      return { el: n, along: x - r.left, x, y: r.top, area: (hi - lo) * (Math.min(r.bottom, innerHeight) - r.top), box };
    };
    const spots = () => [...inView].map((n) => spotOn(n, pos.x)).filter((s): s is Spot => !!s);

    /** Biggest card in view, falling back to the biggest text. */
    const pickBest = (skip?: Element) => {
      const all = spots();
      const boxes = all.filter((s) => s.box);
      let pool = (boxes.length ? boxes : all).sort((a, b) => b.area - a.area);
      if (skip && pool.length > 1) pool = pool.filter((s) => s.el !== skip);
      return pool[Math.floor(Math.random() * Math.min(2, pool.length))] ?? null;
    };

    /** Closest landing spot that keeps its distance from the cursor. */
    const pickNearest = () =>
      spots()
        .filter((s) => !pointer || Math.hypot(s.x - pointer.x, s.y - pointer.y) > 140)
        .sort((a, b) => Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y))[0] ?? null;

    /** Curved, buzzing flight. `dest` is read every frame so moving targets are followed. */
    const flyTo = (dest: () => { x: number; y: number }, then: () => void, speed = 520) => {
      stop();
      look("fly");
      const from = { ...pos };
      const end = () => {
        const d = dest();
        const b = bounds();
        return { x: clamp(b.l, b.r, d.x), y: clamp(b.t, b.b, d.y) };
      };
      const first = end();
      const dist = Math.hypot(first.x - from.x, first.y - from.y) || 1;
      const bend = rand(-0.35, 0.35) * dist;
      const p = { t: 0 };
      let prev = pos.x;
      move = gsap.to(p, {
        t: 1,
        duration: clamp(0.35, 1.8, dist / speed),
        ease: "power1.inOut",
        onUpdate: () => {
          const d = end();
          const t = p.t;
          const u = 1 - t;
          const cx = (from.x + d.x) / 2 - ((d.y - from.y) / dist) * bend;
          const cy = (from.y + d.y) / 2 + ((d.x - from.x) / dist) * bend - dist * 0.15;
          pos.x = u * u * from.x + 2 * u * t * cx + t * t * d.x;
          pos.y = u * u * from.y + 2 * u * t * cy + t * t * d.y + Math.sin(t * 38) * 3 * u;
          turn(pos.x - prev);
          gsap.set(el, { rotation: clamp(-16, 16, (pos.x - prev) * 1.6) });
          prev = pos.x;
          place();
        },
        onComplete: () => {
          gsap.set(el, { rotation: 0 });
          then();
        },
      });
    };

    const hover = () => {
      look("fly");
      bob = gsap.to(pos, { y: "-=6", duration: 0.45, yoyo: true, repeat: -1, ease: "sine.inOut", onUpdate: place });
    };

    /** Hover in place, then pick somewhere to land once the page has stopped scrolling. */
    const settleLater = (delay: number) => {
      timer = gsap.delayedCall(delay, () => {
        if (performance.now() - lastScroll < 250) settleLater(0.3);
        else go();
      });
    };

    const go = (skip?: Element) => {
      const spot = pickBest(skip);
      if (spot) land(spot);
      else wander();
    };

    /** Nothing worth landing on: buzz to a random point and look again. */
    const wander = () => {
      mode = "flying";
      landing = null;
      const b = bounds();
      const d = { x: rand(b.l, b.r), y: rand(b.t, b.t + (b.b - b.t) * 0.7) };
      flyTo(() => d, () => {
        mode = "hovering";
        hover();
        settleLater(rand(0.8, 2));
      });
    };

    const takeOff = () => {
      mode = "flying";
      landing = null;
      const b = bounds();
      const d = { x: clamp(b.l, b.r, pos.x + rand(-90, 90)), y: clamp(b.t, b.b, pos.y - rand(40, 100)) };
      flyTo(() => d, () => {
        mode = "hovering";
        hover();
        settleLater(rand(0.5, 1.2));
      });
    };

    const land = (spot: Spot) => {
      mode = "flying";
      const target = { el: spot.el, along: spot.along };
      landing = target;
      flyTo(
        () => {
          if (!target.el.isConnected) return { ...pos };
          const r = target.el.getBoundingClientRect();
          return { x: r.left + target.along, y: r.top };
        },
        () => {
          mode = "landed";
          look("still");
          timer = gsap.delayedCall(rand(0.4, 1.2), walk);
          // Gets restless after a while and moves to another spot.
          restless = gsap.delayedCall(rand(10, 18), () => go(target.el));
        },
      );
    };

    /** Stroll along the top edge in short legs with pauses in between. */
    const walk = () => {
      if (mode !== "landed" || !landing) return;
      const target = landing;
      const r = target.el.getBoundingClientRect();
      const b = bounds();
      const lo = Math.max(16, b.l - r.left);
      const hi = Math.min(r.width - 16, b.r - r.left);
      const to = clamp(lo, hi, target.along + rand(-160, 160));
      const dx = to - target.along;
      if (Math.abs(dx) < 8) {
        timer = gsap.delayedCall(rand(0.6, 1.5), walk);
        return;
      }
      turn(dx);
      look("walk");
      move = gsap.to(target, {
        along: to,
        duration: Math.abs(dx) / 38,
        ease: "none",
        onComplete: () => {
          look("still");
          timer = gsap.delayedCall(rand(0.5, 2.2), walk);
        },
      });
    };

    /** Housefly escape: dart away from the cursor, then wait for it to leave. */
    const scare = () => {
      if (mode === "fleeing" && move?.isActive()) return;
      mode = "fleeing";
      landing = null;
      const b = bounds();
      const cy = pos.y - 6 * unit();
      const ax = pos.x - (pointer?.x ?? pos.x - 1);
      const ay = cy - (pointer?.y ?? cy);
      const len = Math.hypot(ax, ay) || 1;
      const far = rand(170, 260);
      const d = {
        x: clamp(b.l, b.r, pos.x + (ax / len) * far + rand(-40, 40)),
        y: clamp(b.t, b.b, pos.y + (ay / len) * far),
      };
      flyTo(() => d, () => {
        hover();
        calm = 0;
        waitForCalm();
      }, 950);
    };

    const waitForCalm = () => {
      timer = gsap.delayedCall(0.2, () => {
        if (near(SCARE_PX)) return scare();
        calm = near(160) ? 0 : calm + 0.2;
        if (calm < 0.8) return waitForCalm();
        const spot = pickNearest();
        if (spot) land(spot);
        else wander();
      });
    };

    /* Every frame: ride along with the element it stands on, and watch for the cursor. */
    const tick = () => {
      if (mode === "landed" && landing) {
        const r = landing.el.getBoundingClientRect();
        const b = bounds();
        if (!landing.el.isConnected || r.top < b.t - 12 || r.top > b.b) return takeOff();
        pos.x = r.left + landing.along;
        pos.y = r.top;
        place();
      }
      if ((mode === "landed" || mode === "hovering") && near(SCARE_PX)) scare();
    };
    gsap.ticker.add(tick);

    const onScroll = () => {
      lastScroll = performance.now();
      if (mode === "landed") takeOff();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") pointer = { x: e.clientX, y: e.clientY };
    };
    let tapClear: number | undefined;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      if (near(SCARE_PX + 20)) scare();
      clearTimeout(tapClear);
      tapClear = window.setTimeout(() => (pointer = null), 600);
    };
    const onLeave = () => (pointer = null);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    /* Crawl out of the tunnel toward the viewer, then take off. */
    gsap.set(el, { xPercent: -50, yPercent: -100, autoAlpha: 0, scale: 0.2, rotation: 0, transformOrigin: "50% 100%" });
    timer = gsap.delayedCall(1.2, () => {
      const tunnel = [...document.querySelectorAll("[data-bug-tunnel]")].find((n) => n.getBoundingClientRect().width > 0);
      const r = tunnel?.getBoundingClientRect();
      pos.x = r ? r.left + r.width / 2 : innerWidth / 2;
      pos.y = r ? r.bottom - 1 : 60;
      place();
      look("walk");
      move = gsap
        .timeline()
        .to(el, { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power2.out" })
        .to(pos, { y: "+=28", duration: 1.1, ease: "power1.out", onUpdate: place }, 0)
        .add(() => go(), "+=0.25");
    });

    return () => {
      stop();
      gsap.ticker.remove(tick);
      io.disconnect();
      mo.disconnect();
      clearTimeout(rescan);
      clearTimeout(tapClear);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[55] will-change-transform">
      <div ref={flip}>
        <svg ref={sprite} viewBox="0 -4 16 15" className="block h-auto w-8 sm:w-12" shapeRendering="crispEdges">
          <g className="bug-wings">
            <Pixels rows={WINGS} top={-4} />
          </g>
          <Pixels rows={BODY} top={0} />
          <g className="bug-legs-a">
            <Pixels rows={LEGS_A} top={9} />
          </g>
          <g className="bug-legs-b">
            <Pixels rows={LEGS_B} top={9} />
          </g>
        </svg>
      </div>
    </div>
  );
}
