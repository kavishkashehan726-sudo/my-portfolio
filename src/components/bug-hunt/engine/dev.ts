import type { Layout } from "./layout";
import type { Palette } from "./palette";
import { limb, rand, roundRect, type Ctx } from "./util";

export type Pose = { t: number; alert: boolean; jitter: number; chomp: number };

/** Typing bounce for each hand. */
const typing = (t: number, phase: number) => Math.max(0, Math.sin(t * 15 + phase)) * 2.5;

/** Where the near hand rests on the keyboard. */
const nearHand = (L: Layout, t: number) => ({ x: L.dev.x + 70, y: L.dev.top - 13 - typing(t, 0) });
const farHand = (L: Layout, t: number) => ({ x: L.dev.x + 90, y: L.dev.top - 15 - typing(t, 2.1) });

/** The bounding box drawDev paints into, for rendering it off-screen when it glitches. */
export function devBounds(L: Layout) {
  return { x0: L.dev.x - 100, y0: L.dev.top - 230, x1: L.dev.x + 130, y1: L.floor + 4 };
}

/**
 * Me, sitting behind the desk in three-quarter view, typing on the right. Everything below the
 * desktop is drawn too: the desk is painted over it afterwards. Hands go on top of the keyboard,
 * so they're drawn separately unless `hands` is set.
 */
export function drawDev(c: Ctx, L: Layout, P: Palette, pose: Pose, hands: boolean) {
  const X = L.dev.x;
  const T = L.dev.top;
  const F = L.floor;
  const { t, alert } = pose;
  c.save();
  c.translate(pose.jitter, 0);

  // Chair base and gas lift.
  c.fillStyle = P.chair;
  c.fillRect(X - 6, T + 92, 12, F - T - 108);
  limb(c, [[X - 46, F - 16], [X + 46, F - 16]], [7], P.chair);
  c.fillStyle = P.metal;
  for (const wx of [X - 44, X, X + 44]) {
    c.beginPath();
    c.arc(wx, F - 7, 7, 0, Math.PI * 2);
    c.fill();
  }

  // Legs under the desk, far one first.
  limb(c, [[X - 4, T + 72], [X + 62, T + 80], [X + 66, F - 18]], [30, 24], P.jeansDark);
  shoe(c, X + 58, F - 20, P, 0.85);
  c.fillStyle = P.chairHi;
  roundRect(c, X - 58, T + 82, 110, 15, 7);
  c.fill();
  limb(c, [[X + 6, T + 76], [X + 80, T + 86], [X + 86, F - 18]], [32, 26], P.jeans);
  shoe(c, X + 78, F - 20, P, 1);

  // Chair back: the bug's way up.
  c.fillStyle = P.chair;
  roundRect(c, L.chair.x0, L.chair.top, L.chair.x1 - L.chair.x0, T + 96 - L.chair.top, 16);
  c.fill();
  c.fillStyle = P.chairHi;
  roundRect(c, L.chair.x0 + 6, L.chair.top + 8, 8, 120, 4);
  c.fill();

  // Far arm, behind the torso.
  const fh = farHand(L, t);
  limb(c, [[X + 16, T - 74], [X + 36, T - 20], [fh.x - 6, fh.y]], [22, 18], P.hoodieDark);

  // Torso in a hoodie; it breathes.
  const b = Math.sin(t * 1.7) * 1.2;
  c.fillStyle = P.hoodie;
  c.beginPath();
  c.moveTo(X - 38, T + 80);
  c.bezierCurveTo(X - 46, T + 10, X - 42, T - 60, X - 16, T - 88 - b);
  c.quadraticCurveTo(X + 10, T - 98 - b, X + 30, T - 82 - b);
  c.bezierCurveTo(X + 42, T - 40, X + 44, T + 40, X + 38, T + 80);
  c.closePath();
  c.fill();
  c.fillStyle = P.hoodieDark;
  c.beginPath();
  c.ellipse(X - 22, T - 86 - b, 22, 13, -0.2, 0, Math.PI * 2);
  c.fill();
  limb(c, [[X + 20, T - 88], [X + 22, T - 60]], [2], "#f1eef7");
  limb(c, [[X + 27, T - 86], [X + 30, T - 62]], [2], "#f1eef7");

  // Head, nodding along to the code.
  const hx = L.head.x + (alert ? -2 : 0);
  const hy = L.head.y + Math.sin(t * 2.6) * 0.8 - b + pose.chomp * 2;
  c.fillStyle = P.skinDark;
  c.fillRect(X + 2, T - 110, 16, 26);
  c.fillStyle = P.skin;
  c.beginPath();
  c.arc(hx, hy, L.head.r, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(hx + 25, hy - 6);
  c.lineTo(hx + 34, hy + 5);
  c.lineTo(hx + 25, hy + 7);
  c.fill();
  // Hair.
  c.fillStyle = P.hair;
  c.beginPath();
  c.moveTo(hx - 27, hy + 10);
  c.bezierCurveTo(hx - 38, hy - 30, hx - 6, hy - 44, hx + 18, hy - 30);
  c.bezierCurveTo(hx + 30, hy - 24, hx + 33, hy - 14, hx + 28, hy - 11);
  c.bezierCurveTo(hx + 14, hy - 20, hx - 2, hy - 16, hx - 10, hy - 8);
  c.bezierCurveTo(hx - 16, hy, hx - 18, hy + 10, hx - 20, hy + 18);
  c.closePath();
  c.fill();
  // Face: brow, eye behind glasses, mouth.
  limb(c, [[hx + 16, hy - (alert ? 18 : 14)], [hx + 27, hy - (alert ? 19 : 14)]], [2.2], P.hair);
  c.fillStyle = "#16121c";
  c.beginPath();
  c.arc(hx + 22, hy - 5, alert ? 2.4 : 1.8, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#16121c";
  c.lineWidth = 1.8;
  roundRect(c, hx + 14, hy - 11, 15, 11, 3);
  c.stroke();
  limb(c, [[hx + 14, hy - 7], [hx - 2, hy - 5]], [1.8], "#16121c");
  limb(c, alert ? [[hx + 22, hy + 13], [hx + 27, hy + 11]] : [[hx + 21, hy + 12], [hx + 28, hy + 12]], [1.6], "#5a2f22");
  // Headphones.
  c.strokeStyle = "#1d1a26";
  c.lineWidth = 6;
  c.beginPath();
  c.arc(hx, hy, 33, Math.PI * 1.08, Math.PI * 1.86);
  c.stroke();
  c.fillStyle = P.accent;
  roundRect(c, hx - 13, hy - 11, 17, 27, 8);
  c.fill();
  c.strokeStyle = "#1d1a26";
  c.lineWidth = 2;
  c.stroke();

  // Near arm.
  const nh = nearHand(L, t);
  limb(c, [[X - 4, T - 78], [X + 10, T - 18]], [24], P.hoodie);
  limb(c, [[X + 10, T - 18], [nh.x - 8, nh.y]], [20], P.hoodie);
  if (hands) drawHands(c, L, P, t);

  if (alert) {
    const bx = hx + 30;
    const by = hy - 74;
    c.fillStyle = "#fff";
    roundRect(c, bx, by, 26, 28, 10);
    c.fill();
    c.beginPath();
    c.moveTo(bx + 6, by + 26);
    c.lineTo(bx + 2, by + 36);
    c.lineTo(bx + 14, by + 27);
    c.fill();
    c.fillStyle = P.accent;
    c.fillRect(bx + 11, by + 6, 4, 11);
    c.fillRect(bx + 11, by + 20, 4, 4);
  }
  c.restore();
}

function shoe(c: Ctx, x: number, y: number, P: Palette, k: number) {
  c.fillStyle = P.shoe;
  c.globalAlpha = k;
  roundRect(c, x, y, 40, 16, 7);
  c.fill();
  c.globalAlpha = 1;
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.fillRect(x + 2, y + 12, 37, 4);
}

export function drawHands(c: Ctx, L: Layout, P: Palette, t: number) {
  const fh = farHand(L, t);
  const nh = nearHand(L, t);
  c.fillStyle = P.skinDark;
  c.beginPath();
  c.ellipse(fh.x, fh.y, 8, 6, 0.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = P.hoodieDark;
  c.fillRect(nh.x - 14, nh.y - 7, 6, 13);
  c.fillStyle = P.skin;
  c.beginPath();
  c.ellipse(nh.x, nh.y, 9, 6.5, 0.15, 0, Math.PI * 2);
  c.fill();
}

/* ---------- The monitor's screen ---------- */

type Line = { indent: number; toks: { w: number; c: string }[]; len: number };
const TOKEN_COLORS = ["#c792ea", "#82aaff", "#c3e88d", "#ffcb6b", "#89ddff", "#f07178", "#8a87a8"];

function makeLine(): Line {
  const indent = Math.floor(rand(0, 4));
  const toks = Array.from({ length: Math.floor(rand(1, 5)) }, () => ({
    w: Math.round(rand(6, 26)),
    c: TOKEN_COLORS[Math.floor(rand(0, TOKEN_COLORS.length))],
  }));
  return { indent, toks, len: toks.reduce((s, k) => s + k.w + 3, 0) };
}

/** Code being typed on the screen, a few characters at a time. */
export class Screen {
  lines: Line[] = Array.from({ length: 6 }, makeLine);
  cur = makeLine();
  typed = 0;

  step(dt: number) {
    this.typed += dt * 46;
    if (this.typed > this.cur.len + 8) {
      this.lines.push(this.cur);
      if (this.lines.length > 7) this.lines.shift();
      this.cur = makeLine();
      this.typed = 0;
    }
  }

  draw(c: Ctx, L: Layout, t: number, hacked: number, mono: string) {
    const { x, y0, y1, hw } = L.monitor;
    const sx = x - hw;
    const sw = hw * 2;
    const sh = y1 - y0;
    c.save();
    c.beginPath();
    c.rect(sx, y0, sw, sh);
    c.clip();
    if (hacked > 0) {
      const flick = Math.random() < 0.15;
      c.fillStyle = flick ? "#00ff9c" : Math.sin(t * 20) > 0 ? "#2a0008" : "#0a0004";
      c.fillRect(sx, y0, sw, sh);
      // Pixel skull.
      const skull = ["..XXXXX..", ".XXXXXXX.", "XXXXXXXXX", "XX..X..XX", "XX..X..XX", "XXXXXXXXX", ".XXX.XXX.", "..X.X.X..", "..XXXXX.."];
      const u = 3.2;
      const kx = x - 4.5 * u + (Math.random() - 0.5) * 3 * hacked;
      const ky = y0 + 10;
      c.fillStyle = flick ? "#000" : "#ff2b4a";
      skull.forEach((row, ry) => [...row].forEach((ch, rx) => ch === "X" && c.fillRect(kx + rx * u, ky + ry * u, u, u)));
      c.font = `700 13px ${mono}`;
      c.textAlign = "center";
      c.fillText("HACKED", x + (Math.random() - 0.5) * 4 * hacked, y1 - 22);
      c.font = `500 7px ${mono}`;
      c.fillText("rm -rf /dev/me", x, y1 - 10);
    } else {
      c.fillStyle = "#1b1830";
      c.fillRect(sx, y0, sw, sh);
      c.fillStyle = "#26223f";
      c.fillRect(sx, y0, 12, sh);
      const draw = (ln: Line, y: number, upto: number) => {
        let tx = sx + 16 + ln.indent * 7;
        let left = upto;
        for (const k of ln.toks) {
          if (left <= 0) break;
          const w = Math.min(k.w, left);
          c.fillStyle = k.c;
          c.fillRect(tx, y, w, 3.5);
          tx += k.w + 3;
          left -= k.w + 3;
        }
        return tx;
      };
      this.lines.forEach((ln, i) => draw(ln, y0 + 8 + i * 11, Infinity));
      const ex = draw(this.cur, y0 + 8 + this.lines.length * 11, this.typed);
      if (Math.sin(t * 8) > 0) {
        c.fillStyle = "#f3f1ff";
        c.fillRect(Math.min(ex, sx + sw - 8), y0 + 6 + this.lines.length * 11, 4, 8);
      }
    }
    // Glass sheen.
    c.fillStyle = "rgba(255,255,255,0.05)";
    c.beginPath();
    c.moveTo(sx, y0);
    c.lineTo(sx + sw * 0.55, y0);
    c.lineTo(sx + sw * 0.25, y1);
    c.lineTo(sx, y1);
    c.fill();
    c.restore();
  }
}
