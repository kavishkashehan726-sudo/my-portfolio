"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, [data-cursor]";

/** Hollow ring that trails the pointer and expands over anything clickable. Desktop only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm || !ring.current || !dot.current) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");
    const r = ring.current;
    const d = dot.current;
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, scale = 1, targetScale = 1;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      d.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE);
      targetScale = hit ? 2.2 : 1;
      r.dataset.active = hit ? "true" : "false";
    };
    const leave = () => { r.style.opacity = "0"; d.style.opacity = "0"; };
    const enter = () => { r.style.opacity = "1"; d.style.opacity = "1"; };

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      scale += (targetScale - scale) * 0.2;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-8 w-8 rounded-full border border-ink/60 transition-[background-color,border-color] duration-200 data-[active=true]:border-accent data-[active=true]:bg-accent/10 [@media(pointer:fine)]:block"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 rounded-full bg-accent [@media(pointer:fine)]:block"
      />
    </>
  );
}
