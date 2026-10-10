import { clamp } from "./util";

type Pt = { x: number; y: number; px: number; py: number };

const LINKS = 14;
const GLASS_OFFSET = 42;
export const GLASS_R = 21;

/**
 * A bulb on a cord. The cord is a Verlet chain hanging from the ceiling, so it sags, swings and
 * settles on its own. The bulb is the heavy last link; dragging it pins that link to the pointer.
 */
export class Lamp {
  pts: Pt[] = [];
  seg = 0;
  len = 0;
  ax = 0;
  held = false;
  tx = 0;
  ty = 0;

  constructor(ax: number, len: number) {
    this.reset(ax, len);
  }

  reset(ax: number, len: number) {
    this.ax = ax;
    this.len = len;
    this.seg = len / LINKS;
    this.pts = Array.from({ length: LINKS + 1 }, (_, i) => ({ x: ax, y: i * this.seg, px: ax, py: i * this.seg }));
  }

  get end() {
    return this.pts[LINKS];
  }

  /** Unit vector the bulb hangs along. */
  dir() {
    const a = this.pts[LINKS - 1];
    const b = this.end;
    const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
  }

  glass() {
    const e = this.end;
    const d = this.dir();
    return { x: e.x + d.x * GLASS_OFFSET, y: e.y + d.y * GLASS_OFFSET, r: GLASS_R };
  }

  hits(x: number, y: number, slop = 14) {
    const g = this.glass();
    return Math.hypot(x - g.x, y - g.y) < g.r + slop;
  }

  /** Point the bulb at (x, y), kept within reach of the cord and inside the room. */
  aim(x: number, y: number, w: number, floor: number) {
    const glassToEnd = GLASS_OFFSET;
    let tx = clamp(30, w - 30, x);
    let ty = clamp(20, floor - 60, y - glassToEnd);
    const dx = tx - this.ax;
    const dy = ty;
    const d = Math.hypot(dx, dy);
    const max = this.len * 0.985;
    if (d > max) {
      tx = this.ax + (dx / d) * max;
      ty = (dy / d) * max;
    }
    this.tx = tx;
    this.ty = Math.max(12, ty);
  }

  /** Nudges the bulb with a velocity change, e.g. when a ball smacks it. */
  push(dvx: number, dvy: number, dt: number) {
    const e = this.end;
    e.px -= dvx * dt;
    e.py -= dvy * dt;
  }

  velocity(dt: number) {
    const e = this.end;
    return { x: (e.x - e.px) / dt, y: (e.y - e.py) / dt };
  }

  step(dt: number, g: number) {
    const fall = g * dt * dt;
    for (let i = 1; i <= LINKS; i++) {
      const p = this.pts[i];
      if (i === LINKS && this.held) {
        p.px = p.x;
        p.py = p.y;
        p.x += (this.tx - p.x) * 0.3;
        p.y += (this.ty - p.y) * 0.3;
        continue;
      }
      // Air drag: the bulb keeps swinging for a while, the light cord settles faster.
      const keep = i === LINKS ? 0.9975 : 0.99;
      const vx = (p.x - p.px) * keep;
      const vy = (p.y - p.py) * keep;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + fall;
    }
    const top = this.pts[0];
    top.x = top.px = this.ax;
    top.y = top.py = 0;
    for (let k = 0; k < 24; k++) {
      for (let i = 0; i < LINKS; i++) {
        const a = this.pts[i];
        const b = this.pts[i + 1];
        const wa = i === 0 ? 0 : 1;
        const wb = i + 1 === LINKS ? (this.held ? 0 : 0.2) : 1;
        const sum = wa + wb;
        if (!sum) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const diff = (d - this.seg) / d / sum;
        a.x += dx * diff * wa;
        a.y += dy * diff * wa;
        b.x -= dx * diff * wb;
        b.y -= dy * diff * wb;
      }
    }
  }
}
