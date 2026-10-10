import { BUG_R, U, bugCenter, drawBug, makeBug, type Bug } from "./bug";
import { Screen, devBounds, drawDev, drawHands, type Pose } from "./dev";
import { Lamp } from "./lamp";
import { MIN_H, MIN_W, makeLayout, type Layout } from "./layout";
import { DARK, LIGHT, type Palette } from "./palette";
import { bounce, collide, type Body, type Collider } from "./physics";
import {
  drawBall,
  drawContactShadows,
  drawCrateBack,
  drawCrateFront,
  drawDesk,
  drawKeyboard,
  drawLamp,
  drawMonitorFrame,
  drawRoom,
  drawSlingBack,
  drawSlingFront,
  drawTower,
  drawTunnelEyes,
} from "./scene";
import { Sfx } from "./sfx";
import { MAX_PULL, Sling, type Ball } from "./sling";
import { clamp, ease, lerp, rand, type Ctx } from "./util";

export type Phase = "ready" | "playing" | "paused" | "dying" | "over";
export type Hud = { phase: Phase; score: number; best: number };
type Options = { onHud: (hud: Hud) => void; onLightSwitch: () => void; reduced: boolean };

type Particle = { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string };
type Floater = { x: number; y: number; text: string; life: number };
type Drag = {
  kind: "lamp" | "ball" | "pull";
  id: number;
  ball?: Ball;
  sx: number;
  sy: number;
  t0: number;
  moved: boolean;
  lx: number;
  ly: number;
  lt: number;
  vx: number;
  vy: number;
};

const G = 1700;
const STEP = 1 / 120;
const SUB = 2;
const BALL_R = 13;
const STOCK = 3;
/** How far from the slingshot a ball can be carried. */
const REACH = 330;
const BEST_KEY = "bug-hunt-best";
const NEON = ["#00ff9c", "#ff00e1", "#ff2b4a", "#29e7ff"];

const canvas2d = (w = 1, h = 1) => {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  return el;
};

/**
 * The bug hunt. Everything lives in world units (at least MIN_W × MIN_H) scaled to the canvas.
 * Physics runs at a fixed 120 Hz; drawing happens once per animation frame.
 */
export class Game {
  readonly sfx = new Sfx();
  private c: Ctx;
  private L!: Layout;
  private P: Palette = LIGHT;
  private s = 1;
  private dpr = 1;
  private lamp = new Lamp(0, 100);
  private sling = new Sling();
  private screen = new Screen();
  private balls: Ball[] = [];
  private nextId = 1;
  private bug: Bug | null = null;
  private parts: Particle[] = [];
  private floaters: Floater[] = [];
  private phase: Phase = "ready";
  private score = 0;
  private best = 0;
  private lastHud = "";

  private dark = false;
  private themed = false;
  private light = 1;
  private lightT = 1;

  private time = 0;
  private typeT = 0;
  private acc = 0;
  private last = 0;
  private raf = 0;
  private running = false;
  private spawnIn = 0.2;
  private bugIn = 0;
  private dyingT = 0;
  private devGone = false;
  private glitch = 0;
  private flash = 0;
  private shake = 0;
  private drag: Drag | null = null;

  private bg = canvas2d();
  private lm = canvas2d();
  private sh = canvas2d();
  private shBlur = canvas2d();
  private devCv = canvas2d();
  private tint = canvas2d();
  private scan: CanvasPattern | null = null;
  private bgDirty = true;
  private fonts = { display: "sans-serif", mono: "monospace" };
  private canFilter: boolean;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: Options,
  ) {
    this.c = canvas.getContext("2d")!;
    this.canFilter = "filter" in this.c;
    const css = getComputedStyle(document.documentElement);
    this.fonts = {
      display: css.getPropertyValue("--font-sora").trim() || "sans-serif",
      mono: css.getPropertyValue("--font-jetbrains").trim() || "monospace",
    };
    try {
      this.best = Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      this.best = 0;
    }
    const line = canvas2d(1, 3);
    const lc = line.getContext("2d")!;
    lc.fillStyle = "rgba(0,0,0,0.5)";
    lc.fillRect(0, 0, 1, 1);
    this.scan = this.c.createPattern(line, "repeat");

    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerup", this.onUp);
    canvas.addEventListener("pointercancel", this.onCancel);
    canvas.addEventListener("touchstart", this.onTouch, { passive: false });
    this.emit();
  }

  destroy() {
    this.setRunning(false);
    this.sfx.dispose();
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointercancel", this.onCancel);
    this.canvas.removeEventListener("touchstart", this.onTouch);
  }

  /* ---------- Outside controls ---------- */

  resize(cssW: number, cssH: number) {
    if (cssW < 10 || cssH < 10) return;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const budget = 4_200_000;
    if (cssW * cssH * dpr * dpr > budget) dpr = Math.sqrt(budget / (cssW * cssH));
    this.dpr = dpr;
    this.s = Math.min(cssW / MIN_W, cssH / MIN_H);
    const header = document.querySelector("[data-site-header]")?.getBoundingClientRect().height ?? 80;
    const L = makeLayout(cssW / this.s, cssH / this.s, header / this.s);
    this.L = L;
    const W = Math.round(cssW * dpr);
    const H = Math.round(cssH * dpr);
    this.canvas.width = this.bg.width = W;
    this.canvas.height = this.bg.height = H;
    this.lm.width = Math.ceil(W / 4);
    this.lm.height = Math.ceil(H / 4);
    this.sh.width = this.shBlur.width = Math.ceil(W / 2);
    this.sh.height = this.shBlur.height = Math.ceil(H / 2);
    this.lamp.reset(L.lamp.x, L.lamp.len);
    this.sling.place(L);
    for (const b of this.balls) {
      b.x = clamp(b.r, L.w - b.r, b.x);
      b.y = Math.min(L.floor - b.r, b.y);
    }
    // Put a bug that was mid-way back on its route.
    const b = this.bug;
    if (b && (b.state === "walk" || b.state === "land" || b.state === "climb")) {
      b.state = "walk";
      b.rot = 0;
      b.y = L.table.top;
      b.x = Math.min(b.x, L.chair.x0 - 60);
    }
    this.bgDirty = true;
    this.render();
  }

  setDark(dark: boolean) {
    if (this.themed && dark === this.dark) return;
    this.dark = dark;
    this.P = dark ? DARK : LIGHT;
    this.bgDirty = true;
    if (!this.themed) {
      this.light = dark ? 0 : 1;
      this.lightT = 1;
    } else if (!dark) this.lightT = 0;
    this.themed = true;
    if (!this.running) this.render();
  }

  setSound(on: boolean) {
    this.sfx.on = on;
  }

  setRunning(on: boolean) {
    if (on === this.running) return;
    this.running = on;
    if (on) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    } else cancelAnimationFrame(this.raf);
  }

  start() {
    if (this.phase === "ready" || this.phase === "over") this.restart();
  }

  restart() {
    this.score = 0;
    this.bug = null;
    this.parts = [];
    this.floaters = [];
    this.devGone = false;
    this.glitch = this.flash = this.dyingT = 0;
    this.bugIn = 1.4;
    for (const b of this.balls) if (b.launched) b.dead = true;
    this.balls = this.balls.filter((b) => !b.dead);
    this.phase = "playing";
    this.sfx.unlock();
    this.emit();
  }

  pause() {
    if (this.phase !== "playing") return;
    this.phase = "paused";
    this.emit();
  }

  resume() {
    if (this.phase !== "paused") return;
    this.phase = "playing";
    this.emit();
  }

  private emit() {
    const hud: Hud = { phase: this.phase, score: this.score, best: this.best };
    const key = `${hud.phase}|${hud.score}|${hud.best}`;
    if (key === this.lastHud) return;
    this.lastHud = key;
    this.opts.onHud(hud);
  }

  private saveBest() {
    if (this.score <= this.best) return;
    this.best = this.score;
    try {
      localStorage.setItem(BEST_KEY, String(this.best));
    } catch {
      // Storage blocked: the best score lasts until reload.
    }
  }

  /* ---------- Loop ---------- */

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.acc += dt;
    let n = 0;
    while (this.acc >= STEP && n < 8) {
      this.fixed(STEP);
      this.acc -= STEP;
      n++;
    }
    if (n === 8) this.acc = 0;
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  private fixed(dt: number) {
    // The lamp swings even while the game is paused.
    this.lamp.step(dt, G);
    this.stepLight(dt);
    if (this.phase === "paused") return;
    this.time += dt;
    if (this.phase !== "dying" && this.phase !== "over") {
      this.typeT += dt;
      this.screen.step(dt);
    }
    const sub = dt / SUB;
    for (let i = 0; i < SUB; i++) {
      this.sling.step(sub, G);
      this.stepBalls(sub);
    }
    this.balls = this.balls.filter((b) => !b.dead);
    if (this.phase === "ready" || this.phase === "playing") this.spawnBalls(dt);
    this.stepBug(dt);
    this.stepParts(dt);
    for (const f of this.floaters) {
      f.life -= dt;
      f.y -= 40 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    this.shake = Math.max(0, this.shake - dt * 30);
    this.flash = Math.max(0, this.flash - dt * 2.5);
    if (this.phase === "dying") this.stepDying(dt);
  }

  /** Lamp on with a short flicker in daylight theme, off at night. */
  private stepLight(dt: number) {
    if (this.dark) {
      this.light = Math.max(0, this.light - dt * 9);
      return;
    }
    this.lightT += dt;
    const k = Math.floor(this.lightT / 0.06);
    this.light = [0.2, 1, 0.1, 0.1, 0.9, 0.3, 1][k] ?? 1;
  }

  /* ---------- Balls ---------- */

  private spawnBalls(dt: number) {
    const loose = this.balls.filter((b) => !b.launched).length;
    if (loose >= STOCK) return;
    this.spawnIn -= dt;
    if (this.spawnIn > 0) return;
    this.spawnIn = 0.45;
    const { x0, x1, y0 } = this.L.crate;
    this.balls.push({
      id: this.nextId++,
      x: rand(x0 + 16, x1 - 16),
      y: y0 - rand(70, 110),
      vx: rand(-20, 20),
      vy: 0,
      r: BALL_R,
      angle: rand(0, 6),
      alpha: 0,
      launched: false,
      held: false,
      loaded: false,
      still: 0,
      dead: false,
    });
  }

  private skipDev = (c: Collider) => c.tag === "dev";

  private stepBalls(dt: number) {
    const L = this.L;
    const skip = this.devGone ? this.skipDev : undefined;
    for (const b of this.balls) {
      if (b.dead) continue;
      if (!b.launched && b.alpha < 1) b.alpha = Math.min(1, b.alpha + dt * 4);
      if (b.held || b.loaded) continue;
      b.vy += G * dt;
      const drag = 1 - 0.03 * dt;
      b.vx *= drag;
      b.vy *= drag;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      collide(b, L.colliders, dt, skip, (speed) => speed > 140 && this.sfx.bonk(speed));
      b.angle += (b.vx / b.r) * dt;
      this.hitLamp(b);
      this.hitBug(b);
      const speed = Math.hypot(b.vx, b.vy);
      b.still = speed < 14 ? b.still + dt : 0;
      if (b.launched && b.still > 1.6) {
        b.alpha -= dt * 2.5;
        if (b.alpha <= 0) b.dead = true;
      }
      if (b.x < -300 || b.x > L.w + 300 || b.y > L.h + 300) b.dead = true;
    }
    for (let i = 0; i < this.balls.length; i++) {
      const a = this.balls[i];
      if (a.held || a.loaded || a.dead) continue;
      for (let j = i + 1; j < this.balls.length; j++) {
        const b = this.balls[j];
        if (b.held || b.loaded || b.dead) continue;
        const hit = bounce(a, b, 0.7);
        if (hit > 140) this.sfx.bonk(hit);
      }
    }
  }

  /** Balls knock the bulb about; it is heavier than a ball. */
  private hitLamp(b: Ball) {
    if (this.lamp.held) return;
    const g = this.lamp.glass();
    const v = this.lamp.velocity(STEP);
    const bulb: Body = { x: g.x, y: g.y, vx: v.x, vy: v.y, r: g.r };
    const hit = bounce(b, bulb, 0.6, 1, 2.2);
    if (!hit) return;
    const e = this.lamp.end;
    e.x += bulb.x - g.x;
    e.y += bulb.y - g.y;
    this.lamp.push(bulb.vx - v.x, bulb.vy - v.y, STEP);
    if (hit > 200) this.sfx.ting();
  }

  private hitBug(b: Ball) {
    const bug = this.bug;
    if (!bug || !b.launched || this.phase !== "playing") return;
    if (bug.state === "dead" || bug.state === "eat" || bug.state === "party" || bug.alpha < 0.6) return;
    const at = bugCenter(bug);
    if (Math.hypot(b.x - at.x, b.y - at.y) > b.r + BUG_R * bug.scale) return;
    if (Math.hypot(b.vx, b.vy) < 150) return;
    this.squash(b, at);
  }

  private squash(b: Ball, at: { x: number; y: number }) {
    const bug = this.bug!;
    const air = bug.state === "fly" || bug.state === "hop";
    const gain = air ? 2 : 1;
    this.score += gain;
    this.saveBest();
    Object.assign(bug, {
      state: "dead",
      t: 0,
      x: at.x,
      y: at.y,
      vx: b.vx * 0.5 + rand(-40, 40),
      vy: Math.min(b.vy * 0.5, 0) - 240,
      spin: rand(10, 18) * (Math.random() < 0.5 ? -1 : 1),
      look: "still",
      scale: 1,
      alpha: 1,
      still: 0,
    });
    // The ball glances off.
    const nx = b.x - at.x;
    const ny = b.y - at.y;
    const n = Math.hypot(nx, ny) || 1;
    const vn = (b.vx * nx + b.vy * ny) / n;
    if (vn < 0) {
      b.vx -= (1.4 * vn * nx) / n;
      b.vy -= (1.4 * vn * ny) / n;
    }
    b.vx *= 0.6;
    b.vy *= 0.6;
    const colors = [this.P.accent, this.P.accentDark, "#ffffff", "#8a8799"];
    for (let i = 0; i < 24; i++) {
      this.parts.push({
        x: at.x,
        y: at.y,
        vx: rand(-280, 280),
        vy: rand(-420, -40),
        life: rand(0.6, 1.3),
        size: rand(2, 4.5),
        color: colors[i % colors.length],
      });
    }
    this.floaters.push({ x: at.x, y: at.y - 30, text: air ? "+2 mid-air!" : "+1", life: 1.2 });
    this.sfx.squish();
    this.shake = 7;
    this.bugIn = Math.max(0.6, 1.5 - this.score * 0.04);
    this.emit();
  }

  /* ---------- The bug ---------- */

  private stepBug(dt: number) {
    const L = this.L;
    const bug = this.bug;
    if (!bug) {
      if (this.phase === "playing") {
        this.bugIn -= dt;
        if (this.bugIn <= 0) this.bug = makeBug(L.tunnel.x - 4, L.tunnel.y);
      }
      return;
    }
    bug.t += dt;
    const level = this.score;
    const walkSpeed = Math.min(120, 30 + level * 4);
    const flySpeed = Math.min(420, 230 + level * 9);

    switch (bug.state) {
      case "emerge": {
        // Crawls out of the burrow toward the viewer, then takes off.
        const k = ease(bug.t / 1.1);
        bug.x = L.tunnel.x - 4 + 40 * k;
        bug.y = L.tunnel.y;
        bug.scale = 0.35 + 0.65 * k;
        bug.alpha = Math.min(1, bug.t * 2.5);
        bug.look = "walk";
        this.legs(bug, dt, 40);
        if (bug.t >= 1.25) {
          Object.assign(bug, { state: "fly", t: 0, vx: 140, vy: -160, look: "fly", descending: false, scale: 1 });
          bug.landX = rand(L.land.x0, L.land.x1);
        }
        break;
      }
      case "fly":
        this.fly(bug, dt, flySpeed, level);
        break;
      case "land":
        bug.look = "still";
        if (bug.t > 0.35) Object.assign(bug, { state: "walk", t: 0, pauseIn: rand(1.4, 3) });
        break;
      case "walk": {
        bug.face = 1;
        bug.y = L.table.top;
        if (bug.pausing > 0) {
          bug.pausing -= dt;
          bug.look = "still";
          break;
        }
        bug.pauseIn -= dt;
        if (bug.pauseIn <= 0) {
          bug.pausing = rand(0.3, 0.8) * Math.max(0.3, 1 - level * 0.06);
          bug.pauseIn = rand(1.6, 3.2);
        }
        bug.x += walkSpeed * dt;
        bug.look = "walk";
        this.legs(bug, dt, walkSpeed);
        // Nose meets the chair back: climb it.
        const half = 8 * U;
        if (bug.x >= L.chair.x0 - half) {
          const top = L.table.top;
          const ct = L.chair.top;
          bug.path = [
            { x: bug.x, y: top, rot: 0 },
            { x: L.chair.x0, y: top - half, rot: -Math.PI / 2 },
            { x: L.chair.x0, y: ct + half, rot: -Math.PI / 2 },
            { x: L.chair.x0 + half, y: ct, rot: 0 },
            { x: L.chair.x1 - 8, y: ct, rot: 0 },
          ];
          Object.assign(bug, { state: "climb", t: 0 });
        }
        break;
      }
      case "climb": {
        bug.look = "walk";
        this.legs(bug, dt, walkSpeed);
        let move = walkSpeed * 0.9 * dt;
        while (move > 0 && bug.path.length > 1) {
          const [a, b] = bug.path;
          const left = Math.hypot(b.x - bug.x, b.y - bug.y);
          if (left <= move) {
            bug.x = b.x;
            bug.y = b.y;
            bug.rot = b.rot;
            move -= left;
            bug.path.shift();
            continue;
          }
          bug.x += ((b.x - bug.x) / left) * move;
          bug.y += ((b.y - bug.y) / left) * move;
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          bug.rot = lerp(a.rot, b.rot, 1 - (left - move) / len);
          move = 0;
        }
        if (bug.path.length <= 1) {
          Object.assign(bug, { state: "hop", t: 0, rot: 0, hop: { ax: bug.x, ay: bug.y, bx: L.head.x - 2, by: L.head.y - L.head.r - 9 } });
        }
        break;
      }
      case "hop": {
        // A jump from the chair onto my head.
        const h = bug.hop!;
        const k = Math.min(1, bug.t / 0.55);
        bug.x = lerp(h.ax, h.bx, k);
        bug.y = lerp(h.ay, h.by, k) - Math.sin(Math.PI * k) * 55;
        bug.look = "fly";
        if (k >= 1) {
          Object.assign(bug, { state: "eat", t: 0, look: "still" });
          this.phase = "dying";
          this.dyingT = 0;
          this.saveBest();
          this.emit();
        }
        break;
      }
      case "eat":
        bug.rot = Math.sin(bug.t * 26) * 0.18;
        break;
      case "party": {
        // Victory hops on the empty chair and desk.
        const body: Body = { x: bug.x, y: bug.y - 16, vx: bug.vx, vy: bug.vy, r: 15 };
        body.vy += G * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        const ground = collide(body, L.colliders, dt, this.skipDev);
        Object.assign(bug, { x: body.x, y: body.y + 16, vx: body.vx, vy: body.vy, rot: 0 });
        bug.pauseIn -= dt;
        bug.look = ground ? "still" : "fly";
        if (ground) {
          bug.vx *= 0.9;
          if (bug.pauseIn <= 0) {
            bug.vy = -rand(260, 380);
            bug.vx = rand(-70, 70);
            bug.face = bug.vx < 0 ? -1 : 1;
            bug.pauseIn = rand(0.5, 0.9);
          }
        }
        break;
      }
      case "dead": {
        const body: Body = { x: bug.x, y: bug.y, vx: bug.vx, vy: bug.vy, r: 14 };
        body.vy += G * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        const ground = collide(body, L.colliders, dt, this.devGone ? this.skipDev : undefined);
        Object.assign(bug, { x: body.x, y: body.y, vx: body.vx, vy: body.vy });
        bug.rot += bug.spin * dt;
        if (ground) bug.spin *= 0.9;
        bug.still = Math.hypot(body.vx, body.vy) < 20 ? bug.still + dt : 0;
        if (bug.still > 0.5 || bug.t > 3.5) bug.alpha -= dt * 2;
        if (bug.alpha <= 0) this.bug = null;
        break;
      }
    }
  }

  private legs(bug: Bug, dt: number, speed: number) {
    bug.legT += (dt * speed) / 9;
    bug.leg = Math.floor(bug.legT);
  }

  /** Housefly flight: steer toward a point above the landing spot, wobbling, then drop onto the desk. */
  private fly(bug: Bug, dt: number, speed: number, level: number) {
    const L = this.L;
    const top = L.table.top;
    const tx = bug.descending ? bug.landX : bug.landX - 40;
    const ty = bug.descending ? top : top - 90;
    const dx = tx - bug.x;
    const dy = ty - bug.y;
    const d = Math.hypot(dx, dy) || 1;
    const want = bug.descending ? Math.max(40, Math.min(110, d * 2.4)) : Math.min(speed, d * 2.4);
    let ax = ((dx / d) * want - bug.vx) * 4.5;
    let ay = ((dy / d) * want - bug.vy) * 4.5;
    const wobble = bug.descending ? 0.3 : 1;
    ax += Math.sin(this.time * 7.3 + bug.seed) * 260 * wobble;
    ay += Math.cos(this.time * 9.7 + bug.seed * 1.3) * 300 * wobble;
    bug.vx += ax * dt;
    bug.vy += ay * dt;

    // Sees a ball coming and sometimes darts aside.
    for (const b of this.balls) {
      if (!b.launched || bug.dodged.has(b.id)) continue;
      const ox = bug.x - b.x;
      const oy = bug.y - 16 - b.y;
      if (Math.hypot(ox, oy) > 150) continue;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp < 250 || b.vx * ox + b.vy * oy <= 0) continue;
      bug.dodged.add(b.id);
      if (Math.random() > Math.min(0.5, 0.1 + level * 0.04)) continue;
      let px = -b.vy / sp;
      let py = b.vx / sp;
      if (px * ox + py * oy < 0) {
        px = -px;
        py = -py;
      }
      bug.vx += px * 380;
      bug.vy += py * 380;
    }

    bug.x = clamp(20, L.w - 20, bug.x + bug.vx * dt);
    bug.y = clamp(40, L.floor - 20, bug.y + bug.vy * dt);
    if (Math.abs(bug.vx) > 20) bug.face = bug.vx > 0 ? 1 : -1;
    bug.rot = clamp(-0.3, 0.3, bug.vx * 0.0012 * bug.face);
    bug.look = "fly";
    if (!bug.descending && d < 26) bug.descending = true;
    const onDesk = bug.x > L.table.x0 && bug.x < L.chair.x0 - 30;
    if (bug.descending && bug.y >= top - 2 && onDesk) {
      Object.assign(bug, { state: "land", t: 0, y: top, vx: 0, vy: 0, rot: 0, face: 1, look: "still" });
    }
  }

  /* ---------- Getting eaten ---------- */

  private stepDying(dt: number) {
    const t0 = this.dyingT;
    const t = (this.dyingT += dt);
    const L = this.L;
    if (t < 1.1) {
      if (Math.floor(t * 10) !== Math.floor(t0 * 10)) {
        for (let i = 0; i < 3; i++) {
          this.parts.push({
            x: L.head.x + rand(-10, 10),
            y: L.head.y - L.head.r,
            vx: rand(-120, 120),
            vy: rand(-200, -60),
            life: rand(0.5, 1),
            size: rand(2, 3.5),
            color: Math.random() < 0.5 ? this.P.hair : this.P.skin,
          });
        }
        this.shake = 2.5;
      }
    }
    if (t >= 1.1 && t0 < 1.1) {
      this.sfx.hacked();
      this.flash = 0.6;
    }
    this.glitch = t < 1.1 ? 0 : Math.min(1, (t - 1.1) / 1.3);
    if (t >= 2.6 && !this.devGone) this.dissolve();
    if (t >= 4) {
      this.phase = "over";
      this.glitch = 0;
      this.emit();
    }
  }

  private pose(): Pose {
    const b = this.bug;
    const L = this.L;
    const eating = this.phase === "dying" && this.dyingT < 1.1;
    const alert = eating || (!!b && (b.state === "climb" || b.state === "hop" || (b.state === "walk" && b.x > L.chair.x0 - 150)));
    return {
      t: this.typeT,
      alert,
      jitter: eating ? Math.sin(this.time * 60) * 1.5 : this.glitch ? (Math.random() - 0.5) * this.glitch * 6 : 0,
      chomp: eating ? Math.abs(Math.sin(this.dyingT * 18)) : 0,
    };
  }

  /** Renders me off-screen so the glitch can slice and tint the picture. */
  private renderDev() {
    const { x0, y0, x1, y1 } = devBounds(this.L);
    const k = this.s * this.dpr;
    const W = Math.ceil((x1 - x0) * k);
    const H = Math.ceil((y1 - y0) * k);
    for (const cv of [this.devCv, this.tint]) {
      if (cv.width !== W || cv.height !== H) {
        cv.width = W;
        cv.height = H;
      }
    }
    const dc = this.devCv.getContext("2d")!;
    dc.setTransform(1, 0, 0, 1, 0, 0);
    dc.clearRect(0, 0, W, H);
    dc.setTransform(k, 0, 0, k, -x0 * k, -y0 * k);
    drawDev(dc, this.L, this.P, this.pose(), true);
    return { dc, x0, y0, x1, y1, k, W, H };
  }

  /** I break apart into pixels that rain onto the desk and floor. */
  private dissolve() {
    const { dc, x0, y0, k, W, H } = this.renderDev();
    const data = dc.getImageData(0, 0, W, H).data;
    const step = Math.max(1, Math.round(5 * k));
    const L = this.L;
    for (let py = 0; py < H; py += step) {
      for (let px = 0; px < W; px += step) {
        const i = (py * W + px) * 4;
        if (data[i + 3] < 140) continue;
        const wx = x0 + px / k;
        const wy = y0 + py / k;
        const color = Math.random() < 0.35 ? NEON[Math.floor(Math.random() * NEON.length)] : `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
        this.parts.push({
          x: wx,
          y: wy,
          vx: (wx - L.dev.x) * rand(1, 3) + rand(-60, 60),
          vy: rand(-420, -40) * (wy < L.table.top ? 1 : 0.3),
          life: rand(2.6, 4.6),
          size: 5,
          color,
        });
      }
    }
    this.devGone = true;
    this.shake = 10;
    this.flash = 0.8;
    const b = this.bug;
    if (b) Object.assign(b, { state: "party", t: 0, vx: 0, vy: -200, rot: 0, pauseIn: 0.6 });
  }

  private stepParts(dt: number) {
    const L = this.L;
    const { x0, x1, top } = L.table;
    for (const p of this.parts) {
      const prev = p.y;
      p.vy += G * 0.8 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const half = p.size / 2;
      if (p.y > L.floor - half) {
        p.y = L.floor - half;
        p.vy *= -0.3;
        p.vx *= 0.7;
      } else if (p.vy > 0 && p.x > x0 && p.x < x1 && p.y > top - half && prev <= top - half + 1) {
        p.y = top - half;
        p.vy *= -0.3;
        p.vx *= 0.7;
      }
      p.life -= dt;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
  }

  /* ---------- Input ---------- */

  private world(e: { clientX: number; clientY: number }) {
    const r = this.canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / this.s, y: (e.clientY - r.top) / this.s };
  }

  private canPlay() {
    return this.phase === "ready" || this.phase === "playing";
  }

  /** What is under the pointer: the bulb, the loaded pouch or a ball. */
  private pick(x: number, y: number, touch = false): { kind: Drag["kind"]; ball?: Ball } | null {
    // Fingers are blunt and the room can be small on a phone: reach at least ~26 screen pixels.
    const slop = touch ? Math.max(22, 26 / this.s) : 22;
    if (this.lamp.hits(x, y, slop - 8)) return { kind: "lamp" };
    if (!this.canPlay()) return null;
    if (this.sling.ball && this.sling.near(x, y, slop + 28)) return { kind: "pull" };
    let best: Ball | null = null;
    let bd = Infinity;
    for (const b of this.balls) {
      if (b.launched || b.loaded || b.dead) continue;
      const d = Math.hypot(b.x - x, b.y - y);
      if (d < b.r + slop && d < bd) {
        best = b;
        bd = d;
      }
    }
    return best ? { kind: "ball", ball: best } : null;
  }

  private setCursor(state: "none" | "grab" | "grabbing") {
    this.canvas.style.cursor = state === "none" ? "" : state;
    // The site's custom cursor ring grows over anything marked data-cursor.
    if (state === "none") delete this.canvas.dataset.cursor;
    else this.canvas.dataset.cursor = "";
  }

  private onTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    const p = this.world(t);
    // Grabbing something shouldn't scroll the page; dragging empty space still does.
    if (this.pick(p.x, p.y, true) || this.drag) e.preventDefault();
  };

  private onDown = (e: PointerEvent) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || this.drag) return;
    this.sfx.unlock();
    const p = this.world(e);
    const hit = this.pick(p.x, p.y, e.pointerType === "touch");
    if (!hit) return;
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    const now = performance.now();
    this.drag = { kind: hit.kind, id: e.pointerId, ball: hit.ball, sx: p.x, sy: p.y, t0: now, moved: false, lx: p.x, ly: p.y, lt: now, vx: 0, vy: 0 };
    if (hit.kind === "lamp") {
      this.lamp.held = true;
      this.lamp.aim(p.x, p.y, this.L.w, this.L.floor);
    } else if (hit.kind === "ball" && hit.ball) {
      hit.ball.held = true;
      hit.ball.alpha = 1;
      this.moveHeld(this.drag, p);
    } else this.sling.pull(p.x, p.y);
    this.setCursor("grabbing");
  };

  private onMove = (e: PointerEvent) => {
    const p = this.world(e);
    const d = this.drag;
    if (!d || d.id !== e.pointerId) {
      if (e.pointerType !== "touch") this.setCursor(this.pick(p.x, p.y) ? "grab" : "none");
      return;
    }
    if (Math.hypot(p.x - d.sx, p.y - d.sy) > 6) d.moved = true;
    const now = performance.now();
    const secs = Math.max(4, now - d.lt) / 1000;
    d.vx = lerp(d.vx, (p.x - d.lx) / secs, 0.5);
    d.vy = lerp(d.vy, (p.y - d.ly) / secs, 0.5);
    d.lx = p.x;
    d.ly = p.y;
    d.lt = now;
    if (d.kind === "lamp") this.lamp.aim(p.x, p.y, this.L.w, this.L.floor);
    else if (d.kind === "pull") this.sling.pull(p.x, p.y);
    else this.moveHeld(d, p);
  };

  /** Carry a ball (only near the slingshot). Touching the pouch loads it, and the same drag pulls the band. */
  private moveHeld(d: Drag, p: { x: number; y: number }) {
    const b = d.ball;
    if (!b) return;
    const S = this.sling;
    let dx = p.x - S.rx;
    let dy = p.y - S.ry;
    const dist = Math.hypot(dx, dy);
    if (dist > REACH) {
      dx *= REACH / dist;
      dy *= REACH / dist;
    }
    b.x = clamp(b.r, this.L.w - b.r, S.rx + dx);
    b.y = Math.min(this.L.floor - b.r, S.ry + dy);
    if (!S.ball && Math.hypot(b.x - S.rx, b.y - S.ry) < 34) {
      S.load(b);
      d.kind = "pull";
      d.ball = undefined;
      S.pull(p.x, p.y);
      this.sfx.click();
    }
  }

  private finish(e: PointerEvent, cancelled: boolean) {
    const d = this.drag;
    if (!d || d.id !== e.pointerId) return;
    this.drag = null;
    if (d.kind === "lamp") {
      this.lamp.held = false;
      // A tap on the bulb flips the light switch (and the site theme).
      if (!cancelled && !d.moved && performance.now() - d.t0 < 400) {
        this.sfx.click();
        this.opts.onLightSwitch();
      }
    } else if (d.kind === "pull") {
      const power = this.sling.stretch() / MAX_PULL;
      if (!cancelled && this.sling.release()) this.sfx.twang(power);
      else this.sling.pulling = false;
    } else if (d.ball) {
      const b = d.ball;
      b.held = false;
      const sp = Math.hypot(d.vx, d.vy);
      const k = sp > 600 ? 600 / sp : 1;
      b.vx = d.vx * k;
      b.vy = d.vy * k;
      if (!this.sling.ball && Math.hypot(b.x - this.sling.rx, b.y - this.sling.ry) < 50) this.sling.load(b);
    }
    this.setCursor(e.pointerType === "touch" ? "none" : "grab");
  }

  private onUp = (e: PointerEvent) => this.finish(e, false);
  private onCancel = (e: PointerEvent) => this.finish(e, true);

  /* ---------- Drawing ---------- */

  private render() {
    if (!this.L) return;
    const c = this.c;
    const L = this.L;
    const P = this.P;
    const k = this.s * this.dpr;
    const W = this.canvas.width;
    const H = this.canvas.height;
    if (this.bgDirty) {
      const bc = this.bg.getContext("2d")!;
      bc.setTransform(k, 0, 0, k, 0, 0);
      drawRoom(bc, L, P);
      this.bgDirty = false;
    }
    const shaking = this.shake > 0 && !this.opts.reduced;
    const ox = shaking ? (Math.random() - 0.5) * this.shake : 0;
    const oy = shaking ? (Math.random() - 0.5) * this.shake : 0;
    const world = () => c.setTransform(k, 0, 0, k, ox * k, oy * k);

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    c.drawImage(this.bg, 0, 0);
    if (this.light > 0.05) this.paintShadows();
    world();
    drawContactShadows(c, L, P);
    this.drawProps(c, true);

    // Darkness everywhere the light doesn't reach.
    this.paintLight();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(this.lm, 0, 0, W, H);

    world();
    this.paintGlows();
    if (this.phase === "playing" && !this.bug && this.bugIn < 1) drawTunnelEyes(c, L, this.time);
    drawLamp(c, this.lamp, this.light);
    this.paintAim();
    c.textAlign = "center";
    c.font = `700 20px ${this.fonts.display}`;
    for (const f of this.floaters) {
      c.globalAlpha = Math.min(1, f.life * 2);
      c.lineWidth = 4;
      c.strokeStyle = P.dark ? "#120f26" : "#ffffff";
      c.strokeText(f.text, f.x, f.y);
      c.fillStyle = P.accent;
      c.fillText(f.text, f.x, f.y);
    }
    c.globalAlpha = 1;
    this.paintGlitch(W, H);
  }

  /** Everything in front of the wall. Also used, colour-blind, to cast shadows. */
  private drawProps(c: Ctx, main: boolean) {
    const L = this.L;
    const P = this.P;
    const glitching = main && this.glitch > 0 && !this.devGone;
    if (!this.devGone) {
      if (glitching) this.paintGlitchedDev(c);
      else drawDev(c, L, P, this.pose(), false);
    }
    drawDesk(c, L, P);
    drawKeyboard(c, L, P);
    if (!this.devGone && !glitching) drawHands(c, L, P, this.typeT);
    drawMonitorFrame(c, L, P);
    if (main) this.screen.draw(c, L, this.time, this.phase === "dying" && this.dyingT > 0.4 ? 1 : this.phase === "over" ? 0.5 : 0, this.fonts.mono);
    drawTower(c, L, P, this.time);
    drawCrateBack(c, L, P);
    for (const b of this.balls) if (!b.loaded) drawBall(c, b, P);
    drawCrateFront(c, L, P);
    drawSlingBack(c, L, P, this.sling);
    if (this.sling.ball) drawBall(c, this.sling.ball, P);
    drawSlingFront(c, L, P, this.sling);
    if (this.bug) drawBug(c, this.bug, P, this.time);
    if (main) {
      for (const p of this.parts) {
        c.globalAlpha = Math.min(1, p.life * 2);
        c.fillStyle = p.color;
        c.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      c.globalAlpha = 1;
    }
  }

  /** Silhouettes of the props, scaled away from the bulb onto the wall: shadows that move as the lamp swings. */
  private paintShadows() {
    const sc = this.sh.getContext("2d")!;
    const ks = (this.s * this.dpr) / 2;
    const g = this.lamp.glass();
    const f = 1.09;
    sc.setTransform(1, 0, 0, 1, 0, 0);
    sc.globalCompositeOperation = "source-over";
    sc.clearRect(0, 0, this.sh.width, this.sh.height);
    sc.setTransform(ks * f, 0, 0, ks * f, ks * (g.x - f * g.x), ks * (g.y - f * g.y));
    this.drawProps(sc, false);
    sc.setTransform(1, 0, 0, 1, 0, 0);
    sc.globalCompositeOperation = "source-in";
    sc.fillStyle = "rgb(24,12,40)";
    sc.fillRect(0, 0, this.sh.width, this.sh.height);
    sc.globalCompositeOperation = "source-over";

    // Soften at half resolution, where blurring is cheap.
    let soft = this.sh;
    if (this.canFilter) {
      const bc = this.shBlur.getContext("2d")!;
      bc.clearRect(0, 0, this.shBlur.width, this.shBlur.height);
      bc.filter = `blur(${1.5 * this.dpr}px)`;
      bc.drawImage(this.sh, 0, 0);
      bc.filter = "none";
      soft = this.shBlur;
    }
    const c = this.c;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.beginPath();
    c.rect(0, 0, this.canvas.width, this.L.floor * this.s * this.dpr);
    c.clip();
    c.globalAlpha = 0.22 * this.light;
    c.drawImage(soft, 0, 0, this.canvas.width, this.canvas.height);
    c.restore();
  }

  private paintLight() {
    const L = this.L;
    const P = this.P;
    const lc = this.lm.getContext("2d")!;
    const kl = (this.s * this.dpr) / 4;
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.globalCompositeOperation = "source-over";
    lc.clearRect(0, 0, this.lm.width, this.lm.height);
    lc.fillStyle = `rgba(${P.darkness},${P.ambient})`;
    lc.fillRect(0, 0, this.lm.width, this.lm.height);
    lc.setTransform(kl, 0, 0, kl, 0, 0);
    lc.globalCompositeOperation = "destination-out";
    const hole = (x: number, y: number, r: number, a: number) => {
      const g = lc.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.45, `rgba(0,0,0,${a * 0.6})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      lc.fillStyle = g;
      lc.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const g = this.lamp.glass();
    if (this.light > 0.01) hole(g.x, g.y, 860, 0.97 * this.light);
    const m = L.monitor;
    const hacked = this.phase === "dying" && this.dyingT > 0.4;
    hole(m.x, (m.y0 + m.y1) / 2, P.dark ? 320 : 220, (P.dark ? 0.8 : 0.4) * (hacked ? 0.6 + Math.random() * 0.4 : 1));
    const w = L.window;
    hole((w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2, 280, P.dark ? 0.4 : 0.6);
    hole((L.tower.x0 + L.tower.x1) / 2, L.tower.y0 + 40, 110, 0.4);
    lc.globalCompositeOperation = "source-over";
  }

  /** Light that adds rather than reveals: the bulb's warm halo, the screen's glow, glow-in-the-dark balls. */
  private paintGlows() {
    const c = this.c;
    const L = this.L;
    const P = this.P;
    c.globalCompositeOperation = "lighter";
    const glow = (x: number, y: number, r: number, color: string, a: number) => {
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${color},${a})`);
      g.addColorStop(1, `rgba(${color},0)`);
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    };
    if (this.light > 0.02) {
      const g = this.lamp.glass();
      glow(g.x, g.y, 240, "255,200,120", 0.26 * this.light);
      glow(g.x, g.y, 60, "255,236,180", 0.5 * this.light);
      // Pool of light on the floor under the bulb.
      c.save();
      c.translate(g.x, L.floor + 8);
      c.scale(1, 0.12);
      glow(0, 0, 320, "255,200,130", 0.22 * this.light);
      c.restore();
    }
    const m = L.monitor;
    const hacked = this.phase === "dying" && this.dyingT > 0.4;
    glow(m.x, (m.y0 + m.y1) / 2, 150, hacked ? "255,40,70" : "120,140,255", hacked ? 0.2 + Math.random() * 0.15 : P.dark ? 0.16 : 0.08);
    if (P.dark) {
      for (const b of this.balls) glow(b.x, b.y, b.r * 2.6, "220,240,120", 0.28 * b.alpha);
      const bug = this.bug;
      if (bug && bug.state !== "dead") {
        const at = bugCenter(bug);
        glow(at.x, at.y, 40, "255,60,70", 0.18);
      }
    }
    c.globalCompositeOperation = "source-over";
  }

  /** Dotted guide for the first part of the shot while the band is pulled. */
  private paintAim() {
    const S = this.sling;
    if (!S.pulling || !S.ball || S.stretch() < 14) return;
    const c = this.c;
    const v = S.launchVelocity();
    c.fillStyle = this.P.dark ? "#ffffff" : "#17132e";
    for (let i = 1; i <= 10; i++) {
      const t = i * 0.045;
      c.globalAlpha = 0.65 * (1 - i / 11);
      c.beginPath();
      c.arc(S.rx + v.x * t, S.ry + v.y * t + 0.5 * G * t * t, 3.2 - i * 0.15, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }

  /** Me, sliced, shifted and colour-split as the bug hacks in. */
  private paintGlitchedDev(c: Ctx) {
    const { x0, y0, x1, y1, k, W, H } = this.renderDev();
    const g = this.glitch;
    const strips = 18;
    const sh = (y1 - y0) / strips;
    c.save();
    if (this.canFilter) c.filter = `hue-rotate(${Math.round(g * 160)}deg) saturate(${1 + g * 2})`;
    for (let i = 0; i < strips; i++) {
      const jump = Math.random() < 0.2 + g * 0.4 ? (Math.random() - 0.5) * g * 44 : 0;
      c.drawImage(this.devCv, 0, i * sh * k, W, Math.ceil(sh * k), x0 + jump, y0 + i * sh, x1 - x0, sh + 0.5);
    }
    c.filter = "none";
    const tc = this.tint.getContext("2d")!;
    const ghost = (color: string, dx: number) => {
      tc.setTransform(1, 0, 0, 1, 0, 0);
      tc.globalCompositeOperation = "source-over";
      tc.clearRect(0, 0, W, H);
      tc.drawImage(this.devCv, 0, 0);
      tc.globalCompositeOperation = "source-in";
      tc.fillStyle = color;
      tc.fillRect(0, 0, W, H);
      c.drawImage(this.tint, x0 + dx, y0, x1 - x0, y1 - y0);
    };
    c.globalAlpha = 0.12 + g * 0.28;
    ghost("#ff00e1", -(3 + g * 9));
    ghost("#00ff9c", 3 + g * 9);
    c.restore();
  }

  /** Screen-wide interference while the hack lands. */
  private paintGlitch(W: number, H: number) {
    const c = this.c;
    c.setTransform(1, 0, 0, 1, 0, 0);
    const g = this.phase === "dying" ? this.glitch : 0;
    if (g > 0) {
      if (!this.opts.reduced && Math.random() < 0.35 * g) {
        for (let i = 0; i < 3; i++) {
          const y = Math.random() * H;
          const h = (4 + Math.random() * 36) * this.dpr;
          c.drawImage(this.canvas, 0, y, W, h, (Math.random() - 0.5) * 50 * g * this.dpr, y, W, h);
        }
      }
      if (this.scan) {
        c.globalAlpha = 0.18 * g;
        c.fillStyle = this.scan;
        c.fillRect(0, 0, W, H);
      }
      if (Math.random() < 0.1) {
        c.globalAlpha = 0.07;
        c.fillStyle = Math.random() < 0.5 ? "#00ff9c" : "#ff00e1";
        c.fillRect(0, 0, W, H);
      }
      c.globalAlpha = 1;
    }
    if (this.flash > 0 && !this.opts.reduced) {
      c.globalAlpha = this.flash * 0.5;
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }
  }
}
