export type Ctx = CanvasRenderingContext2D;

export const clamp = (lo: number, hi: number, v: number) => Math.min(hi, Math.max(lo, v));
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => 1 - Math.pow(1 - clamp(0, 1, t), 3);

/** Small seeded generator so the room's random details (stars, bricks, books) stay put between redraws. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Strokes a chain of round-capped segments, one width per segment: arms and legs. */
export function limb(c: Ctx, pts: [number, number][], widths: number[], color: string) {
  c.strokeStyle = color;
  c.lineCap = "round";
  c.lineJoin = "round";
  for (let i = 0; i < pts.length - 1; i++) {
    c.lineWidth = widths[Math.min(i, widths.length - 1)];
    c.beginPath();
    c.moveTo(pts[i][0], pts[i][1]);
    c.lineTo(pts[i + 1][0], pts[i + 1][1]);
    c.stroke();
  }
}

export function roundRect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}
