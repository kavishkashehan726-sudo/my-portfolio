import { clamp } from "./util";

/* Rigid circles against static boxes and capsules: enough for balls, a falling bug and the lamp's bulb. */

export type Box = { kind: "box"; x0: number; y0: number; x1: number; y1: number; e: number; f: number; tag?: string };
export type Cap = { kind: "cap"; ax: number; ay: number; bx: number; by: number; r: number; e: number; f: number; tag?: string };
export type Collider = Box | Cap;
export type Body = { x: number; y: number; vx: number; vy: number; r: number };

export const box = (x0: number, y0: number, x1: number, y1: number, e = 0.45, f = 0.25, tag?: string): Box => ({ kind: "box", x0, y0, x1, y1, e, f, tag });
export const cap = (ax: number, ay: number, bx: number, by: number, r: number, e = 0.45, f = 0.25, tag?: string): Cap => ({
  kind: "cap",
  ax,
  ay,
  bx,
  by,
  r,
  e,
  f,
  tag,
});

/** Contact normal (pointing out of the collider) and depth, or null when apart. */
function contact(b: Body, c: Collider) {
  if (c.kind === "box") {
    const cx = clamp(c.x0, c.x1, b.x);
    const cy = clamp(c.y0, c.y1, b.y);
    const dx = b.x - cx;
    const dy = b.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 > b.r * b.r) return null;
    if (d2 > 1e-6) {
      const d = Math.sqrt(d2);
      return { nx: dx / d, ny: dy / d, pen: b.r - d };
    }
    // Centre inside the box: leave through the nearest side.
    const l = b.x - c.x0, r = c.x1 - b.x, t = b.y - c.y0, u = c.y1 - b.y;
    const m = Math.min(l, r, t, u);
    if (m === t) return { nx: 0, ny: -1, pen: t + b.r };
    if (m === u) return { nx: 0, ny: 1, pen: u + b.r };
    if (m === l) return { nx: -1, ny: 0, pen: l + b.r };
    return { nx: 1, ny: 0, pen: r + b.r };
  }
  const abx = c.bx - c.ax;
  const aby = c.by - c.ay;
  const t = clamp(0, 1, ((b.x - c.ax) * abx + (b.y - c.ay) * aby) / (abx * abx + aby * aby || 1));
  const dx = b.x - (c.ax + abx * t);
  const dy = b.y - (c.ay + aby * t);
  const d = Math.hypot(dx, dy);
  const reach = b.r + c.r;
  if (d >= reach) return null;
  return d < 1e-6 ? { nx: 0, ny: -1, pen: reach } : { nx: dx / d, ny: dy / d, pen: reach - d };
}

/**
 * Pushes a body out of every collider it touches and bounces it: restitution along the normal,
 * Coulomb friction on impacts and a light rolling resistance while it rests. Returns true when standing on something.
 */
export function collide(
  b: Body,
  colliders: Collider[],
  dt: number,
  skip?: (c: Collider) => boolean,
  onImpact?: (speed: number, c: Collider) => void,
) {
  let ground = false;
  for (const c of colliders) {
    if (skip?.(c)) continue;
    const k = contact(b, c);
    if (!k) continue;
    const { nx, ny, pen } = k;
    b.x += nx * pen;
    b.y += ny * pen;
    const vn = b.vx * nx + b.vy * ny;
    if (vn < 0) {
      const hit = -vn;
      const e = hit < 60 ? 0 : c.e;
      b.vx -= (1 + e) * vn * nx;
      b.vy -= (1 + e) * vn * ny;
      const tx = -ny;
      const ty = nx;
      const vt = b.vx * tx + b.vy * ty;
      const drop = hit < 60 ? vt * Math.min(1, 0.8 * dt) : Math.sign(vt) * Math.min(Math.abs(vt), c.f * (1 + e) * hit);
      b.vx -= tx * drop;
      b.vy -= ty * drop;
      if (hit > 80) onImpact?.(hit, c);
    }
    if (ny < -0.6) ground = true;
  }
  return ground;
}

/** Elastic collision between two circles with masses. Returns the closing speed, 0 when they don't touch. */
export function bounce(a: Body, b: Body, e = 0.7, ma = 1, mb = 1) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const reach = a.r + b.r;
  if (d >= reach || d === 0) return 0;
  const nx = dx / d;
  const ny = dy / d;
  const pen = reach - d;
  const wa = mb / (ma + mb);
  const wb = ma / (ma + mb);
  a.x -= nx * pen * wa;
  a.y -= ny * pen * wa;
  b.x += nx * pen * wb;
  b.y += ny * pen * wb;
  const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (rv >= 0) return 0;
  const j = (-(1 + e) * rv) / (1 / ma + 1 / mb);
  a.vx -= (j * nx) / ma;
  a.vy -= (j * ny) / ma;
  b.vx += (j * nx) / mb;
  b.vy += (j * ny) / mb;
  return -rv;
}
