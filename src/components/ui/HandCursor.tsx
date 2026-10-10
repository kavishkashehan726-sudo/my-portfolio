"use client";

import { useEffect, useRef } from "react";
import { pixelRuns } from "@/lib/bugSprite";

/* Pixel-art hands to match the bug: K outline, W skin-white, S shade, R red cuff. */
const HANDS = {
  // Pointing; the fingertip (column 5, row 0) is the hotspot.
  point: [
    ".....KK.........",
    "....KWWK........",
    "....KWWK........",
    "....KWWK........",
    "....KWWKKK......",
    "....KWWKWWKKK...",
    "....KWWKWWKWWKK.",
    "KKK.KWWKWWKWWKWK",
    "KWWKKWWWWWWWWKWK",
    "KWWWKWWWWWWWWWWK",
    ".KWWWWWWWWWWWWWK",
    "..KWWWWWWWWWWWSK",
    "..KSWWWWWWWWWWSK",
    "...KSWWWWWWWWSK.",
    "....KSWWWWWWSK..",
    "....KRRRRRRRRK..",
    "....KRRRRRRRRK..",
    "....KKKKKKKKKK..",
  ],
  // Open, ready to grab.
  open: [
    "......KK........",
    "...KK.KWK.KK....",
    "..KWWKKWWKKWK...",
    "..KWWKKWWKKWK.KK",
    "..KWWKKWWKKWKKWK",
    "..KWWKKWWKKWKWWK",
    "..KWWKKWWKKWKWK.",
    "KK.KWWWWWWWWWWK.",
    "KWKKWWWWWWWWWWK.",
    "KWWKWWWWWWWWWSK.",
    ".KWWWWWWWWWWWSK.",
    "..KSWWWWWWWWWSK.",
    "...KSWWWWWWWSK..",
    "....KSWWWWWSK...",
    "....KRRRRRRRK...",
    "....KRRRRRRRK...",
    "....KKKKKKKKK...",
  ],
  // Closed fist while holding something.
  fist: [
    "................",
    "................",
    "................",
    "....KK.KK.KK....",
    "...KWWKWWKWWKK..",
    "..KKWWKWWKWWKWK.",
    ".KWKWWKWWKWWKWK.",
    ".KWWKKKKKKKKKWK.",
    ".KWWWWWWWWWWWWK.",
    "..KWWWWWWWWWWSK.",
    "..KSWWWWWWWWWSK.",
    "...KSWWWWWWWSK..",
    "....KSWWWWWSK...",
    "....KRRRRRRRK...",
    "....KRRRRRRRK...",
    "....KKKKKKKKK...",
  ],
};
type Pose = keyof typeof HANDS;

const COLORS: Record<string, string> = { K: "#17132e", W: "#ffffff", S: "#d6d0e6", R: "var(--accent)" };
const PX = 2;
/** Where each pose points from, in sprite pixels. */
const HOTSPOT: Record<Pose, [number, number]> = { point: [5.5, 0.5], open: [8, 8], fist: [8, 8] };

function Hand({ pose }: { pose: Pose }) {
  return (
    <svg data-pose={pose} viewBox="0 0 16 18" width={16 * PX} height={18 * PX} shapeRendering="crispEdges" className="absolute left-0 top-0 hidden">
      {pixelRuns(HANDS[pose], 0).map((p) => (
        <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={p.w} height={1} fill={COLORS[p.c]} />
      ))}
    </svg>
  );
}

/**
 * A pixel hand in place of the cursor ring on the bug hunt page. It points by default, opens over
 * anything the game lets you grab (the canvas marks those with data-cursor) and closes into a fist
 * while you hold one.
 */
export function HandCursor() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    let x = -100, y = -100, pose: Pose = "point", pressed = false, over = false;

    const show = () => {
      el.querySelectorAll<SVGSVGElement>("svg").forEach((s) => s.classList.toggle("hidden", s.dataset.pose !== pose));
    };
    const place = () => {
      const [hx, hy] = HOTSPOT[pose];
      el.style.transform = `translate3d(${x - hx * PX}px, ${y - hy * PX}px, 0)`;
    };
    const update = (target: EventTarget | null) => {
      over = !!(target as Element | null)?.closest?.("canvas[data-cursor]");
      const next: Pose = over ? (pressed ? "fist" : "open") : "point";
      if (next !== pose) {
        pose = next;
        show();
      }
      place();
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      update(e.target);
    };
    const down = (e: PointerEvent) => {
      pressed = true;
      update(e.target);
    };
    const up = (e: PointerEvent) => {
      pressed = false;
      update(e.target);
    };
    const leave = () => (el.style.opacity = "0");
    const enter = () => (el.style.opacity = "1");

    show();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] [@media(pointer:fine)]:block"
      style={{ transform: "translate3d(-100px,-100px,0)" }}
    >
      <Hand pose="point" />
      <Hand pose="open" />
      <Hand pose="fist" />
    </div>
  );
}
