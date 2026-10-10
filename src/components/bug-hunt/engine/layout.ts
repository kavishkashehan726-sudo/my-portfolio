import { box, cap, type Collider } from "./physics";
import { clamp } from "./util";

/** The smallest world the scene is laid out in. Bigger screens get more room, never smaller props. */
export const MIN_W = 1040;
export const MIN_H = 640;

export type Layout = ReturnType<typeof makeLayout>;

/**
 * Where everything stands, in world units, for a world of w × h. Props hang off the floor so tall screens
 * just get more wall. `safeTop` is how far down the fixed site header reaches, in world units.
 */
export function makeLayout(w: number, h: number, safeTop = 0) {
  const floor = Math.round(h - clamp(56, 90, h * 0.09));
  const top = floor - 210;
  const tableW = clamp(620, 940, w * 0.58);
  const cx = w * 0.57;
  const table = { x0: cx - tableW / 2, x1: cx + tableW / 2, top, thick: 18 };
  const dev = { x: table.x1 - 215, top };
  const monitor = { x: table.x1 - 64, y0: top - 150, y1: top - 50, hw: 54 };
  const keyboard = { x0: dev.x + 40, x1: dev.x + 104 };
  const tower = { x0: table.x1 + 18, x1: table.x1 + 80, y0: floor - 150 };
  const sx = clamp(150, table.x0 - 95, w * 0.15);
  const sling = { x: sx, tipY: floor - 150, forkY: floor - 92, restY: floor - 140 };
  const crate = { x0: sx - 132, x1: sx - 42, y0: floor - 46 };
  const tunnel = { x: Math.max(sx + 30, w * 0.12), y: top - 125 };
  // The window sits between the burrow and the lamp so the bulb never hangs in front of it.
  const winCx = (tunnel.x + 80 + w / 2 - 40) / 2;
  const window = { x0: winCx - 74, x1: winCx + 74, y0: Math.max(top - 290, safeTop + 24), y1: top - 100 };
  const shelf = { x0: dev.x - 50, x1: dev.x + 150, y: top - 215 };
  const lamp = { x: w / 2, len: Math.max(60, top - 262) };
  const land = { x0: table.x0 + 50, x1: table.x0 + 110 };
  /** Where the bug starts up the chair back, and the top of the head it is after. */
  const chair = { x0: dev.x - 80, x1: dev.x - 38, top: top - 124 };
  const head = { x: dev.x + 10, y: top - 132, r: 28 };

  const colliders: Collider[] = [
    box(-600, floor, w + 600, floor + 600, 0.45, 0.3, "floor"),
    box(-600, -4000, 0, floor + 600, 0.5),
    box(w, -4000, w + 600, floor + 600, 0.5),
    box(table.x0 - 6, top, table.x1 + 6, top + table.thick, 0.4, 0.3, "desk"),
    box(table.x0 + 10, top, table.x0 + 26, floor, 0.4),
    box(table.x1 - 26, top, table.x1 - 10, floor, 0.4),
    box(monitor.x - monitor.hw - 5, monitor.y0 - 5, monitor.x + monitor.hw + 5, monitor.y1 + 5, 0.35),
    cap(monitor.x, monitor.y1, monitor.x, top, 5, 0.35),
    box(keyboard.x0, top - 8, keyboard.x1, top, 0.3),
    box(chair.x0, chair.top, chair.x1, top, 0.3, 0.3, "dev"),
    cap(dev.x - 2, top - 74, dev.x, top, 38, 0.3, 0.3, "dev"),
    cap(head.x, head.y, head.x, head.y, head.r + 2, 0.4, 0.3, "dev"),
    box(tower.x0, tower.y0, tower.x1, floor, 0.4),
    cap(crate.x0, crate.y0, crate.x0, floor, 5, 0.3),
    cap(crate.x1, crate.y0, crate.x1, floor, 5, 0.3),
    cap(sx, floor, sx, sling.forkY, 7, 0.4),
    cap(tunnel.x - 44, tunnel.y + 4, tunnel.x + 72, tunnel.y + 4, 4, 0.35),
    cap(shelf.x0, shelf.y + 4, shelf.x1, shelf.y + 4, 5, 0.35),
    cap(window.x0 - 12, window.y1 + 7, window.x1 + 12, window.y1 + 7, 5, 0.35),
  ];

  return { w, h, floor, table, dev, monitor, keyboard, tower, sling, crate, tunnel, window, shelf, lamp, land, chair, head, colliders };
}
