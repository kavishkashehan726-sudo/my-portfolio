import { BUG_BODY, BUG_LEGS_A, BUG_LEGS_B, BUG_WINGS, pixelRuns } from "@/lib/bugSprite";
import type { Palette } from "./palette";
import type { Ctx } from "./util";

/** World units per sprite pixel. */
export const U = 3;
/** From the feet to the middle of the body, in sprite pixels. */
const MID = 5.5;
export const BUG_R = 18;

export type BugState = "emerge" | "fly" | "land" | "walk" | "climb" | "hop" | "eat" | "party" | "dead";
export type Look = "walk" | "fly" | "still";

export type Bug = {
  state: BugState;
  /** Feet position while alive; body centre once dead. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  face: 1 | -1;
  scale: number;
  alpha: number;
  look: Look;
  /** Time in the current state. */
  t: number;
  steps: number;
  seed: number;
  landX: number;
  descending: boolean;
  pauseIn: number;
  pausing: number;
  path: { x: number; y: number; rot: number }[];
  leg: number;
  legT: number;
  hop: { ax: number; ay: number; bx: number; by: number } | null;
  still: number;
  dodged: Set<number>;
};

export function makeBug(x: number, y: number): Bug {
  return {
    state: "emerge",
    x,
    y,
    vx: 0,
    vy: 0,
    rot: 0,
    spin: 0,
    face: 1,
    scale: 0.35,
    alpha: 0,
    look: "walk",
    t: 0,
    steps: 0,
    seed: Math.random() * 100,
    landX: 0,
    descending: false,
    pauseIn: 2,
    pausing: 0,
    path: [],
    leg: 0,
    legT: 0,
    hop: null,
    still: 0,
    dodged: new Set(),
  };
}

/** Middle of the body, which is what balls hit. */
export function bugCenter(b: Bug) {
  if (b.state === "dead") return { x: b.x, y: b.y };
  const oy = -MID * U * b.scale;
  return { x: b.x - Math.sin(b.rot) * oy, y: b.y + Math.cos(b.rot) * oy };
}

const RUNS = {
  body: pixelRuns(BUG_BODY, 0),
  legsA: pixelRuns(BUG_LEGS_A, 9),
  legsB: pixelRuns(BUG_LEGS_B, 9),
  wings: pixelRuns(BUG_WINGS, -4),
};

export function drawBug(c: Ctx, b: Bug, P: Palette, time: number) {
  const colors: Record<string, string> = {
    S: P.accent,
    H: P.accentDark,
    K: "#1a0a10",
    E: "#ffffff",
    A: "#8a8799",
    L: "#8a8799",
    W: "#bcd5fa",
  };
  const fill = (runs: typeof RUNS.body) => {
    for (const r of runs) {
      c.fillStyle = colors[r.c];
      c.fillRect(r.x, r.y, r.w + 0.05, 1.05);
    }
  };
  const dead = b.state === "dead";
  c.save();
  c.globalAlpha = b.alpha;
  c.translate(b.x, b.y);
  c.rotate(b.rot);
  c.scale(b.face * U * b.scale, U * b.scale);
  c.translate(-8, dead ? -MID : -11);
  if (b.look === "fly") {
    c.save();
    c.globalAlpha = b.alpha * 0.8;
    c.scale(1, 0.35 + Math.abs(Math.sin(time * 70)) * 0.65);
    fill(RUNS.wings);
    c.restore();
  }
  fill(RUNS.body);
  fill(b.look === "walk" && b.leg % 2 ? RUNS.legsB : RUNS.legsA);
  if (dead) {
    // X for an eye.
    c.fillStyle = "#1a0a10";
    for (const [x, y] of [
      [11, 3],
      [13, 3],
      [12, 4],
      [11, 5],
      [13, 5],
    ])
      c.fillRect(x, y, 1, 1);
  }
  c.restore();
}
