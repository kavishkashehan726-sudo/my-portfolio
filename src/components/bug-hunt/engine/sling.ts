import type { Layout } from "./layout";

export type Ball = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  alpha: number;
  /** Shot from the slingshot: only these can squash the bug, and they fade once they settle. */
  launched: boolean;
  held: boolean;
  loaded: boolean;
  still: number;
  dead: boolean;
};

export const MAX_PULL = 135;
/** Angular frequency of the loaded band (rad/s). Release speed ≈ pull × this. */
export const W_LOADED = 10.5;
const W_EMPTY = 26;

/**
 * The slingshot's pouch is a mass on a spring anchored between the prongs (Hooke's law).
 * Pulling stores energy in the bands; letting go releases it and the ball leaves the pouch
 * as it passes the rest point. The empty pouch then wobbles back to rest.
 */
export class Sling {
  rx = 0;
  ry = 0;
  floor = 0;
  pouch = { x: 0, y: 0, vx: 0, vy: 0 };
  ball: Ball | null = null;
  pulling = false;
  private firing = false;
  private fdx = 0;
  private fdy = 0;

  place(L: Layout) {
    this.rx = L.sling.x;
    this.ry = L.sling.restY;
    this.floor = L.floor;
    this.pouch = { x: this.rx, y: this.ry, vx: 0, vy: 0 };
    this.pulling = this.firing = false;
  }

  stretch() {
    return Math.hypot(this.pouch.x - this.rx, this.pouch.y - this.ry);
  }

  near(x: number, y: number, slop: number) {
    return Math.hypot(x - this.pouch.x, y - this.pouch.y) < slop;
  }

  load(b: Ball) {
    this.ball = b;
    b.loaded = true;
    b.held = false;
    b.vx = b.vy = 0;
    this.firing = false;
  }

  pull(x: number, y: number) {
    this.pulling = true;
    let dx = x - this.rx;
    let dy = y - this.ry;
    const d = Math.hypot(dx, dy);
    if (d > MAX_PULL) {
      dx = (dx / d) * MAX_PULL;
      dy = (dy / d) * MAX_PULL;
    }
    this.pouch.x = Math.max(16, this.rx + dx);
    this.pouch.y = Math.min(this.floor - 14, this.ry + dy);
    this.pouch.vx = this.pouch.vy = 0;
  }

  /** Lets go of the pouch. Returns true when that fires the ball. */
  release() {
    this.pulling = false;
    if (!this.ball || this.stretch() < 14) return false;
    const d = this.stretch();
    this.fdx = (this.rx - this.pouch.x) / d;
    this.fdy = (this.ry - this.pouch.y) / d;
    this.firing = true;
    return true;
  }

  /** Expected launch velocity for the current pull, for the aiming guide. */
  launchVelocity() {
    return { x: (this.rx - this.pouch.x) * W_LOADED, y: (this.ry - this.pouch.y) * W_LOADED };
  }

  /** Advances the bands. Returns the ball when it leaves the pouch. */
  step(dt: number, g: number): Ball | null {
    const p = this.pouch;
    if (this.pulling) {
      if (this.ball) {
        this.ball.x = p.x;
        this.ball.y = p.y;
      }
      return null;
    }
    const w = this.ball ? W_LOADED : W_EMPTY;
    const damping = this.ball ? (this.firing ? 0 : 9) : 7;
    const ax = -w * w * (p.x - this.rx) - damping * p.vx;
    const ay = -w * w * (p.y - this.ry) - damping * p.vy + (this.ball ? g * 0.15 : 0);
    p.vx += ax * dt;
    p.vy += ay * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.y = Math.min(this.floor - 6, p.y);
    const b = this.ball;
    if (!b) return null;
    b.x = p.x;
    b.y = p.y;
    if (this.firing && (p.x - this.rx) * this.fdx + (p.y - this.ry) * this.fdy >= 0) {
      this.firing = false;
      this.ball = null;
      b.loaded = false;
      b.launched = true;
      b.vx = p.vx;
      b.vy = p.vy;
      // The pouch is suddenly much lighter: it overshoots and twangs.
      p.vx *= 0.45;
      p.vy *= 0.45;
      return b;
    }
    return null;
  }
}
