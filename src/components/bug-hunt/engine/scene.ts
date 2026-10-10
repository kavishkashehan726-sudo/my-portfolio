import type { Layout } from "./layout";
import type { Palette } from "./palette";
import type { Ball, Sling } from "./sling";
import { GLASS_R, type Lamp } from "./lamp";
import { roundRect, seeded, type Ctx } from "./util";

/* ---------- The room: drawn once per size and theme, then cached ---------- */

export function drawRoom(c: Ctx, L: Layout, P: Palette) {
  const { w, h, floor } = L;

  let g = c.createLinearGradient(0, 0, 0, floor);
  g.addColorStop(0, P.wallTop);
  g.addColorStop(1, P.wallBot);
  c.fillStyle = g;
  c.fillRect(0, 0, w, floor);
  c.fillStyle = P.stripe;
  for (let x = 0; x < w; x += 36) c.fillRect(x, 0, 12, floor);

  // Wainscot panels under a chair rail.
  const rail = floor - 128;
  c.fillStyle = P.wains;
  c.fillRect(0, rail, w, floor - rail);
  c.strokeStyle = P.line;
  c.lineWidth = 2;
  for (let x = 22; x < w - 40; x += 124) c.strokeRect(x, rail + 20, 100, floor - rail - 50);
  c.fillStyle = P.rail;
  c.fillRect(0, rail - 7, w, 9);
  c.fillStyle = P.line;
  c.fillRect(0, rail + 2, w, 2);

  drawWindow(c, L, P);
  drawShelf(c, L, P);
  drawTunnel(c, L, P);

  // Skirting board.
  c.fillStyle = P.rail;
  c.fillRect(0, floor - 16, w, 16);
  c.fillStyle = P.line;
  c.fillRect(0, floor - 16, w, 2);

  // Floorboards running away from the viewer.
  g = c.createLinearGradient(0, floor, 0, h);
  g.addColorStop(0, P.floorTop);
  g.addColorStop(1, P.floorBot);
  c.fillStyle = g;
  c.fillRect(0, floor, w, h - floor);
  const vx = w / 2;
  const vy = floor - 900;
  const k = (floor - vy) / (h - vy);
  c.strokeStyle = P.plank;
  c.lineWidth = 1.5;
  c.beginPath();
  for (let x = -w; x < w * 2; x += 96) {
    c.moveTo(vx + (x - vx) * k, floor);
    c.lineTo(x, h);
  }
  c.stroke();
  c.fillStyle = "rgba(0,0,0,0.12)";
  c.fillRect(0, floor, w, 3);
}

function drawWindow(c: Ctx, L: Layout, P: Palette) {
  const { x0, y0, x1, y1 } = L.window;
  const ww = x1 - x0;
  const wh = y1 - y0;
  const rnd = seeded(7);

  let g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, P.skyTop);
  g.addColorStop(1, P.skyBot);
  c.fillStyle = g;
  c.fillRect(x0, y0, ww, wh);

  c.save();
  c.beginPath();
  c.rect(x0, y0, ww, wh);
  c.clip();
  if (P.dark) {
    c.fillStyle = "#fff";
    for (let i = 0; i < 26; i++) {
      c.globalAlpha = 0.3 + rnd() * 0.7;
      c.fillRect(x0 + rnd() * ww, y0 + rnd() * wh * 0.7, 1.6, 1.6);
    }
    c.globalAlpha = 1;
    const mx = x0 + ww * 0.7;
    const my = y0 + 44;
    g = c.createRadialGradient(mx, my, 6, mx, my, 60);
    g.addColorStop(0, "rgba(220,230,255,0.35)");
    g.addColorStop(1, "rgba(220,230,255,0)");
    c.fillStyle = g;
    c.fillRect(x0, y0, ww, wh);
    c.fillStyle = "#eef1ff";
    c.beginPath();
    c.arc(mx, my, 14, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = P.skyTop;
    c.beginPath();
    c.arc(mx + 6, my - 4, 12, 0, Math.PI * 2);
    c.fill();
  } else {
    c.fillStyle = "rgba(255,255,255,0.92)";
    for (const [cx, cy, s] of [
      [x0 + ww * 0.28, y0 + wh * 0.28, 1],
      [x0 + ww * 0.78, y0 + wh * 0.5, 0.7],
    ]) {
      c.beginPath();
      c.ellipse(cx, cy, 26 * s, 10 * s, 0, 0, Math.PI * 2);
      c.ellipse(cx + 16 * s, cy - 8 * s, 16 * s, 12 * s, 0, 0, Math.PI * 2);
      c.ellipse(cx - 12 * s, cy - 5 * s, 12 * s, 9 * s, 0, 0, Math.PI * 2);
      c.fill();
    }
  }
  // Distant hills, then a palm for Hikkaduwa.
  c.fillStyle = P.hills;
  c.beginPath();
  c.moveTo(x0, y1);
  c.lineTo(x0, y1 - 34);
  c.quadraticCurveTo(x0 + ww * 0.3, y1 - 70, x0 + ww * 0.55, y1 - 38);
  c.quadraticCurveTo(x0 + ww * 0.8, y1 - 16, x1, y1 - 46);
  c.lineTo(x1, y1);
  c.fill();
  const px = x0 + ww * 0.2;
  c.strokeStyle = P.dark ? "#0a0e24" : "#5d8a4f";
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(px, y1);
  c.quadraticCurveTo(px + 8, y1 - 40, px + 2, y1 - 78);
  c.stroke();
  c.lineWidth = 3;
  for (const a of [-2.6, -2.1, -1.4, -0.8, -0.3]) {
    c.beginPath();
    c.moveTo(px + 2, y1 - 78);
    c.quadraticCurveTo(px + 2 + Math.cos(a) * 20, y1 - 78 + Math.sin(a) * 20 - 6, px + 2 + Math.cos(a) * 34, y1 - 78 + Math.sin(a) * 26 + 10);
    c.stroke();
  }
  c.restore();

  // Frame and mullions.
  c.strokeStyle = P.frame;
  c.lineWidth = 10;
  c.strokeRect(x0, y0, ww, wh);
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(x0 + ww / 2, y0);
  c.lineTo(x0 + ww / 2, y1);
  c.moveTo(x0, y0 + wh * 0.45);
  c.lineTo(x1, y0 + wh * 0.45);
  c.stroke();
  // Sill.
  c.fillStyle = P.frame;
  roundRect(c, x0 - 14, y1 + 2, ww + 28, 10, 3);
  c.fill();
  c.fillStyle = P.shade;
  c.fillRect(x0 - 10, y1 + 12, ww + 20, 4);

  // Curtains with soft folds.
  const curtain = (cx0: number, cw: number) => {
    const cg = c.createLinearGradient(cx0, 0, cx0 + cw, 0);
    for (let i = 0; i <= 6; i++) cg.addColorStop(i / 6, i % 2 ? P.curtainDark : P.curtain);
    c.fillStyle = cg;
    c.beginPath();
    c.moveTo(cx0, y0 - 16);
    c.lineTo(cx0 + cw, y0 - 16);
    c.quadraticCurveTo(cx0 + cw * 0.7, y1 - 10, cx0 + cw + 4, y1 + 34);
    c.lineTo(cx0 - 4, y1 + 34);
    c.quadraticCurveTo(cx0 + cw * 0.3, y1 - 10, cx0, y0 - 16);
    c.fill();
  };
  curtain(x0 - 38, 42);
  curtain(x1 - 4, 42);
  c.fillStyle = P.metal;
  roundRect(c, x0 - 50, y0 - 20, ww + 100, 5, 2);
  c.fill();
  c.beginPath();
  c.arc(x0 - 52, y0 - 17.5, 5, 0, Math.PI * 2);
  c.arc(x1 + 52, y0 - 17.5, 5, 0, Math.PI * 2);
  c.fill();
}

function drawShelf(c: Ctx, L: Layout, P: Palette) {
  const { x0, x1, y } = L.shelf;
  const rnd = seeded(3);
  const colors = ["#e3263a", "#3d3176", "#f2b134", "#2f8f83", "#5a4fcf", "#e86a3a", "#2a2440", "#c6c0dc"];
  let x = x0 + 12;
  while (x < x1 - 70) {
    const bw = 9 + rnd() * 9;
    const bh = 34 + rnd() * 20;
    c.fillStyle = colors[Math.floor(rnd() * colors.length)];
    c.fillRect(x, y - bh, bw, bh);
    c.fillStyle = "rgba(255,255,255,0.35)";
    c.fillRect(x + 2, y - bh + 6, bw - 4, 2);
    c.fillRect(x + 2, y - 10, bw - 4, 2);
    x += bw + 1;
  }
  // A leaning book, a little bug-catching trophy and a cactus.
  c.save();
  c.translate(x + 4, y);
  c.rotate(0.32);
  c.fillStyle = "#f2b134";
  c.fillRect(0, -40, 11, 40);
  c.restore();
  const tx = x1 - 42;
  c.fillStyle = "#e0b33f";
  c.beginPath();
  c.moveTo(tx - 9, y - 30);
  c.lineTo(tx + 9, y - 30);
  c.quadraticCurveTo(tx + 8, y - 14, tx, y - 13);
  c.quadraticCurveTo(tx - 8, y - 14, tx - 9, y - 30);
  c.fill();
  c.fillRect(tx - 2, y - 13, 4, 7);
  c.fillRect(tx - 7, y - 6, 14, 6);
  const kx = x1 - 18;
  c.fillStyle = "#c46a43";
  c.fillRect(kx - 8, y - 12, 16, 12);
  c.fillStyle = "#3f8f5a";
  roundRect(c, kx - 5, y - 32, 10, 22, 5);
  c.fill();
  roundRect(c, kx + 3, y - 26, 7, 4, 2);
  c.fill();

  c.fillStyle = P.shelf;
  roundRect(c, x0, y, x1 - x0, 9, 2);
  c.fill();
  c.fillStyle = P.shade;
  c.fillRect(x0 + 4, y + 9, x1 - x0 - 8, 4);
  c.fillStyle = P.metal;
  c.fillRect(x0 + 24, y + 9, 4, 16);
  c.fillRect(x1 - 28, y + 9, 4, 16);
}

/** Where the arch of the bug's burrow is, so eyes can glow inside it. */
function tunnelPath(c: Ctx, x: number, y: number) {
  c.beginPath();
  c.moveTo(x - 30, y);
  c.lineTo(x - 30, y - 22);
  c.ellipse(x, y - 22, 30, 26, 0, Math.PI, 0);
  c.lineTo(x + 30, y);
  c.closePath();
}

function drawTunnel(c: Ctx, L: Layout, P: Palette) {
  const { x, y } = L.tunnel;
  const rnd = seeded(11);
  // Plaster broken away around the hole, showing bricks.
  c.save();
  c.beginPath();
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + (rnd() - 0.5) * 0.28;
    const px = x + 6 + Math.cos(a) * 66 * r;
    const py = y - 26 + Math.sin(a) * 50 * r;
    if (i) c.lineTo(px, py);
    else c.moveTo(px, py);
  }
  c.closePath();
  c.fillStyle = P.mortar;
  c.fill();
  c.strokeStyle = P.line;
  c.lineWidth = 3;
  c.stroke();
  c.clip();
  for (let row = 0; row < 10; row++) {
    const by = y - 80 + row * 13;
    for (let col = -1; col < 7; col++) {
      const bx = x - 70 + col * 30 + (row % 2) * 15;
      c.fillStyle = P.brick;
      c.globalAlpha = 0.75 + rnd() * 0.25;
      c.fillRect(bx, by, 27, 10);
    }
  }
  c.restore();
  c.globalAlpha = 1;

  tunnelPath(c, x, y);
  const g = c.createRadialGradient(x, y - 14, 4, x, y - 14, 40);
  g.addColorStop(0, "#000");
  g.addColorStop(1, "#1a1424");
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 3;
  c.stroke();

  // Hairline cracks.
  c.strokeStyle = P.line;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(x + 64, y - 50);
  c.lineTo(x + 84, y - 62);
  c.lineTo(x + 92, y - 58);
  c.moveTo(x - 56, y - 64);
  c.lineTo(x - 70, y - 82);
  c.stroke();

  // The little ledge the bug crawls out onto.
  c.fillStyle = P.shelf;
  roundRect(c, x - 46, y, 120, 8, 2);
  c.fill();
  c.fillStyle = P.shade;
  c.fillRect(x - 42, y + 8, 112, 4);
}

export function drawTunnelEyes(c: Ctx, L: Layout, t: number) {
  const { x, y } = L.tunnel;
  const blink = Math.sin(t * 9) > 0.85 ? 0.2 : 1;
  c.save();
  c.fillStyle = "#ff3b3f";
  c.shadowColor = "#ff3b3f";
  c.shadowBlur = 10;
  c.fillRect(x - 9, y - 22, 5, 5 * blink);
  c.fillRect(x + 5, y - 22, 5, 5 * blink);
  c.restore();
}

/* ---------- Props ---------- */

export function drawContactShadows(c: Ctx, L: Layout, P: Palette) {
  const { floor, table, tower, crate, sling, dev } = L;
  c.fillStyle = P.shade;
  const blob = (x: number, rx: number) => {
    c.beginPath();
    c.ellipse(x, floor + 3, rx, 6, 0, 0, Math.PI * 2);
    c.fill();
  };
  blob(table.x0 + 18, 22);
  blob(table.x1 - 18, 22);
  blob((tower.x0 + tower.x1) / 2, 44);
  blob((crate.x0 + crate.x1) / 2, 56);
  blob(sling.x, 34);
  blob(dev.x, 64);
}

export function drawDesk(c: Ctx, L: Layout, P: Palette) {
  const { x0, x1, top, thick } = L.table;
  const F = L.floor;
  c.fillStyle = P.metal;
  for (const lx of [x0 + 10, x1 - 26]) {
    c.fillRect(lx, top + thick, 16, F - top - thick - 4);
    roundRect(c, lx - 5, F - 6, 26, 6, 2);
    c.fill();
  }
  // Surface seen slightly from above, then the front edge.
  c.fillStyle = P.woodTop;
  c.beginPath();
  c.moveTo(x0 - 6, top);
  c.lineTo(x0 + 6, top - 9);
  c.lineTo(x1 - 6, top - 9);
  c.lineTo(x1 + 6, top);
  c.fill();
  c.fillStyle = P.woodEdge;
  c.fillRect(x0 - 6, top, x1 - x0 + 12, thick);
  c.strokeStyle = P.woodGrain;
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x0 + 30, top + 6);
  c.bezierCurveTo(x0 + 200, top + 4, x0 + 260, top + 11, x1 - 120, top + 8);
  c.moveTo(x0 + 90, top + 13);
  c.bezierCurveTo(x0 + 240, top + 15, x1 - 300, top + 10, x1 - 40, top + 13);
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.18)";
  c.fillRect(x0 - 6, top, x1 - x0 + 12, 2);
  c.fillStyle = "rgba(0,0,0,0.15)";
  c.fillRect(x0 - 6, top + thick - 3, x1 - x0 + 12, 3);
}

export function drawKeyboard(c: Ctx, L: Layout, P: Palette) {
  const { x0, x1 } = L.keyboard;
  const top = L.table.top;
  c.fillStyle = P.bezel;
  roundRect(c, x0, top - 9, x1 - x0, 8, 2);
  c.fill();
  c.fillStyle = "rgba(255,255,255,0.25)";
  for (let x = x0 + 4; x < x1 - 4; x += 6) c.fillRect(x, top - 7, 4, 2);
  // Mouse.
  c.fillStyle = P.bezel;
  roundRect(c, x1 + 8, top - 7, 14, 6, 3);
  c.fill();
}

export function drawMonitorFrame(c: Ctx, L: Layout, P: Palette) {
  const { x, y0, y1, hw } = L.monitor;
  const top = L.table.top;
  c.fillStyle = P.metal;
  c.fillRect(x - 5, y1, 10, top - y1 - 4);
  roundRect(c, x - 28, top - 7, 56, 7, 3);
  c.fill();
  c.fillStyle = P.bezel;
  roundRect(c, x - hw - 6, y0 - 6, hw * 2 + 12, y1 - y0 + 12, 7);
  c.fill();
  // Sticky notes on the bezel.
  c.save();
  c.translate(x + hw + 2, y0 + 6);
  c.rotate(0.12);
  c.fillStyle = "#ffd84d";
  c.fillRect(0, 0, 18, 18);
  c.fillStyle = "rgba(0,0,0,0.35)";
  c.fillRect(3, 5, 11, 1.5);
  c.fillRect(3, 9, 8, 1.5);
  c.restore();
}

export function drawTower(c: Ctx, L: Layout, P: Palette, t: number) {
  const { x0, x1, y0 } = L.tower;
  const F = L.floor;
  c.fillStyle = P.metal;
  roundRect(c, x0, y0, x1 - x0, F - y0, 5);
  c.fill();
  c.fillStyle = "rgba(255,255,255,0.06)";
  roundRect(c, x0 + 6, y0 + 8, x1 - x0 - 12, F - y0 - 20, 3);
  c.fill();
  // RGB strip cycling through colours, and a power LED.
  const hue = (t * 40) % 360;
  c.save();
  c.fillStyle = `hsl(${hue} 90% 60%)`;
  c.shadowColor = c.fillStyle;
  c.shadowBlur = 12;
  c.fillRect(x0 + 10, y0 + 14, 3, F - y0 - 34);
  c.fillStyle = "#4dff9c";
  c.fillRect(x1 - 16, y0 + 14, 4, 4);
  c.restore();
  c.fillStyle = "rgba(0,0,0,0.35)";
  for (let y = y0 + 30; y < F - 30; y += 7) c.fillRect(x0 + 22, y, x1 - x0 - 34, 2);
  // Plant on top.
  const px = (x0 + x1) / 2;
  c.fillStyle = "#3f8f5a";
  for (const [a, l] of [
    [-2.2, 30],
    [-1.8, 38],
    [-1.4, 34],
    [-1.0, 28],
    [-2.6, 22],
  ]) {
    c.beginPath();
    c.ellipse(px + Math.cos(a) * l * 0.5, y0 - 24 + Math.sin(a) * l * 0.5, l * 0.5, 5, a, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#c46a43";
  c.beginPath();
  c.moveTo(px - 15, y0 - 26);
  c.lineTo(px + 15, y0 - 26);
  c.lineTo(px + 11, y0);
  c.lineTo(px - 11, y0);
  c.fill();
}

export function drawCrateBack(c: Ctx, L: Layout, P: Palette) {
  const { x0, x1, y0 } = L.crate;
  c.fillStyle = P.crateDark;
  c.fillRect(x0, y0, x1 - x0, L.floor - y0);
}

export function drawCrateFront(c: Ctx, L: Layout, P: Palette) {
  const { x0, x1, y0 } = L.crate;
  const F = L.floor;
  c.fillStyle = P.crate;
  c.fillRect(x0 - 5, y0, x1 - x0 + 10, 11);
  c.fillRect(x0 - 5, F - 15, x1 - x0 + 10, 15);
  c.fillRect(x0 - 5, y0, 9, F - y0);
  c.fillRect(x1 - 4, y0, 9, F - y0);
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.fillRect(x0 - 5, y0 + 9, x1 - x0 + 10, 2);
  c.fillRect(x0 - 5, F - 15, x1 - x0 + 10, 2);
  c.fillStyle = "rgba(0,0,0,0.45)";
  for (const nx of [x0, x1]) {
    c.fillRect(nx - 1, y0 + 4, 2, 2);
    c.fillRect(nx - 1, F - 8, 2, 2);
  }
}

/* ---------- Slingshot ---------- */

function prong(c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, P: Palette) {
  c.lineCap = "round";
  c.strokeStyle = P.slingDark;
  c.lineWidth = w;
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.stroke();
  c.strokeStyle = P.slingWood;
  c.lineWidth = w * 0.55;
  c.beginPath();
  c.moveTo(x0 - w * 0.12, y0);
  c.lineTo(x1 - w * 0.12, y1);
  c.stroke();
}

function band(c: Ctx, fx: number, fy: number, S: Sling, P: Palette, wide: number) {
  c.strokeStyle = P.rubber;
  c.lineCap = "round";
  c.lineWidth = wide;
  c.beginPath();
  c.moveTo(fx, fy);
  c.lineTo(S.pouch.x, S.pouch.y);
  c.stroke();
}

const bandWidth = (S: Sling) => 7 - Math.min(1, S.stretch() / 135) * 3.5;

export function drawSlingBack(c: Ctx, L: Layout, P: Palette, S: Sling) {
  const { x, tipY, forkY } = L.sling;
  const F = L.floor;
  // Back prong, then the band behind the ball.
  prong(c, x, forkY + 4, x + 24, tipY, 12, P);
  band(c, x + 24, tipY + 6, S, P, bandWidth(S));
  // Stand and post.
  c.fillStyle = P.slingDark;
  roundRect(c, x - 28, F - 14, 56, 14, 4);
  c.fill();
  prong(c, x, F - 10, x, forkY, 15, P);
  // Leather pouch behind the ball.
  const dx = S.pouch.x - S.rx;
  const dy = S.pouch.y - S.ry;
  const a = Math.atan2(dy, dx);
  c.save();
  c.translate(S.pouch.x, S.pouch.y);
  c.rotate(a);
  c.fillStyle = "#4a2f23";
  roundRect(c, 2, -15, 12, 30, 6);
  c.fill();
  c.restore();
}

export function drawSlingFront(c: Ctx, L: Layout, P: Palette, S: Sling) {
  const { x, tipY, forkY } = L.sling;
  prong(c, x, forkY + 4, x - 24, tipY, 12, P);
  band(c, x - 24, tipY + 6, S, P, bandWidth(S) + 0.5);
  c.fillStyle = P.rubber;
  c.fillRect(x - 30, tipY + 2, 12, 8);
  c.fillRect(x + 18, tipY + 2, 12, 8);
}

/* ---------- Balls ---------- */

export function drawBall(c: Ctx, b: Ball, P: Palette) {
  c.save();
  c.globalAlpha = b.alpha;
  c.translate(b.x, b.y);
  const g = c.createRadialGradient(-4, -5, 2, 0, 0, b.r);
  g.addColorStop(0, P.seam);
  g.addColorStop(0.25, P.ball);
  g.addColorStop(1, P.ballDark);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, b.r, 0, Math.PI * 2);
  c.fill();
  // Tennis seam turns with the ball so its spin shows.
  c.rotate(b.angle);
  c.strokeStyle = P.seam;
  c.lineWidth = 1.6;
  c.beginPath();
  c.arc(-b.r * 1.2, 0, b.r * 0.85, -0.85, 0.85);
  c.stroke();
  c.beginPath();
  c.arc(b.r * 1.2, 0, b.r * 0.85, Math.PI - 0.85, Math.PI + 0.85);
  c.stroke();
  c.restore();
}

/* ---------- Lamp ---------- */

export function drawLamp(c: Ctx, lamp: Lamp, light: number) {
  const p = lamp.pts;
  c.fillStyle = "#1a1622";
  roundRect(c, lamp.ax - 18, -6, 36, 14, 5);
  c.fill();
  c.strokeStyle = "#1a1622";
  c.lineWidth = 2.6;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(p[0].x, p[0].y);
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i].x + p[i + 1].x) / 2;
    const my = (p[i].y + p[i + 1].y) / 2;
    c.quadraticCurveTo(p[i].x, p[i].y, mx, my);
  }
  c.lineTo(lamp.end.x, lamp.end.y);
  c.stroke();

  const d = lamp.dir();
  c.save();
  c.translate(lamp.end.x, lamp.end.y);
  c.rotate(Math.atan2(-d.x, d.y));
  // Socket.
  c.fillStyle = "#1d1924";
  roundRect(c, -7.5, -2, 15, 20, 3);
  c.fill();
  c.fillStyle = "rgba(255,255,255,0.12)";
  c.fillRect(-7.5, 4, 15, 1.5);
  c.fillRect(-7.5, 9, 15, 1.5);
  c.fillStyle = "#2a2531";
  roundRect(c, -9, 15, 18, 6, 2);
  c.fill();
  // Pear-shaped glass, like an Edison bulb.
  c.beginPath();
  c.moveTo(-6, 21);
  c.bezierCurveTo(-7, 28, -GLASS_R, 30, -GLASS_R, 43);
  c.bezierCurveTo(-GLASS_R, 56, -11, 64, 0, 64);
  c.bezierCurveTo(11, 64, GLASS_R, 56, GLASS_R, 43);
  c.bezierCurveTo(GLASS_R, 30, 7, 28, 6, 21);
  c.closePath();
  if (light > 0.02) {
    const g = c.createRadialGradient(0, 44, 2, 0, 44, 26);
    g.addColorStop(0, `rgba(255,255,248,${0.6 + light * 0.4})`);
    g.addColorStop(0.55, `rgba(255,236,180,${0.45 + light * 0.5})`);
    g.addColorStop(1, `rgba(255,200,110,${0.35 + light * 0.5})`);
    c.fillStyle = g;
  } else {
    c.fillStyle = "rgba(225,222,236,0.5)";
  }
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.45)";
  c.lineWidth = 1;
  c.stroke();
  // Filament.
  c.strokeStyle = light > 0.02 ? "#fff3c4" : "#6b5a4a";
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(-3, 22);
  c.lineTo(-3, 38);
  c.lineTo(-6, 42);
  c.lineTo(-2, 46);
  c.lineTo(2, 42);
  c.lineTo(6, 46);
  c.lineTo(3, 38);
  c.lineTo(3, 22);
  c.stroke();
  c.fillStyle = "rgba(255,255,255,0.55)";
  c.beginPath();
  c.ellipse(-10, 40, 2.5, 8, 0.2, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
