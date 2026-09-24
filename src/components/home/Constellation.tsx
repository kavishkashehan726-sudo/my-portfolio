"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number; red: boolean };

const LINK_DIST = 150;

/** Drifting network of gold nodes and hairlines, with red embers gathered on the portrait side. */
export function Constellation({ className = "" }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true;
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };
    let colors = { node: "#c79a55", line: "rgba(199,154,85,.3)", red: "#ff3b3f" };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = {
        node: s.getPropertyValue("--node").trim() || colors.node,
        line: s.getPropertyValue("--node-line").trim() || colors.line,
        red: s.getPropertyValue("--accent").trim() || colors.red,
      };
    };

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = el.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      el.width = w * dpr;
      el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.round((w * h) / 16000));
      nodes = Array.from({ length: count }, () => {
        const red = Math.random() < 0.22;
        // Embers cluster toward the right half, where the portrait sits.
        const x = red ? w * (0.5 + Math.random() * 0.5) : Math.random() * w;
        return {
          x,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: red ? 1.4 + Math.random() * 2.6 : 1 + Math.random() * 1.8,
          red,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!calm) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20;
          if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          if (n.y > h + 20) n.y = -20;
        }
      }
      ctx.lineWidth = 0.7;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (a.red) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          if (b.red) continue;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d > LINK_DIST) continue;
          ctx.globalAlpha = 1 - d / LINK_DIST;
          ctx.strokeStyle = colors.line;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        // Reach toward the pointer.
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < LINK_DIST * 1.3) {
          ctx.globalAlpha = (1 - md / (LINK_DIST * 1.3)) * 0.9;
          ctx.strokeStyle = colors.red;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      for (const n of nodes) {
        ctx.globalAlpha = n.red ? 0.75 : 0.95;
        ctx.fillStyle = n.red ? colors.red : colors.node;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (visible) draw();
      raf = requestAnimationFrame(loop);
    };

    readColors();
    seed();
    if (calm) draw();
    else raf = requestAnimationFrame(loop);

    const onResize = () => { seed(); if (calm) draw(); };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = mouse.y = -9999; };
    const themeWatch = new MutationObserver(() => { readColors(); if (calm) draw(); });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(el);

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
