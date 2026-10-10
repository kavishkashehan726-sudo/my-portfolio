/* Pixel bug facing right: feet on row 10, wings above row 0. Shared by the roaming bug and the bug hunt game. */

export const BUG_BODY = [
  ".............A..",
  "....SSSS....A...",
  "..SSSSSSSS.HH...",
  ".SSKSSSKSSHHHH..",
  ".SSSKSKSSSHHEH..",
  ".SSSSKSSSSHHHHH.",
  ".SSSKSKSSSHHHH..",
  ".SSKSSSKSSHHH...",
  "...SSSSSSSS.....",
];
export const BUG_LEGS_A = ["...L..L..L......", "..L..L..L......."];
export const BUG_LEGS_B = ["....L..L..L.....", ".....L..L..L...."];
export const BUG_WINGS = [".......WW.......", "...WW.WWWW......", "..WWWWWWWW......", "...WWWWWW......."];

export type PixelRun = { x: number; y: number; w: number; c: string };

/** Turns rows of letters into runs of same-coloured pixels. */
export function pixelRuns(rows: string[], top: number): PixelRun[] {
  return rows.flatMap((row, y) => {
    const runs: PixelRun[] = [];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === ".") continue;
      const last = runs[runs.length - 1];
      if (last && last.c === c && last.x + last.w === x) last.w++;
      else runs.push({ x, y: y + top, w: 1, c });
    }
    return runs;
  });
}
