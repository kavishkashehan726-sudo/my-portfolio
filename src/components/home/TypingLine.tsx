"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 1900;
const GAP_MS = 350;

/**
 * Terminal prompt that types each line, deletes it and moves to the next, forever.
 * Waits for `start` (the intro), and shows the first line still when reduced motion is on.
 */
export function TypingLine({ lines, start }: { lines: readonly string[]; start: boolean }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!start) return;
    if (reduce) {
      // Set after hydration so the server and client markup match.
      setIndex(0);
      setCount(lines[0].length);
      setDeleting(false);
      return;
    }
    const line = lines[index];
    let delay = deleting ? DELETE_MS : TYPE_MS;
    let next: () => void;

    if (!deleting && count === line.length) {
      delay = HOLD_MS;
      next = () => setDeleting(true);
    } else if (deleting && count === 0) {
      delay = GAP_MS;
      next = () => {
        setDeleting(false);
        setIndex((i) => (i + 1) % lines.length);
      };
    } else {
      next = () => setCount((c) => c + (deleting ? -1 : 1));
    }

    const t = setTimeout(next, delay);
    return () => clearTimeout(t);
  }, [start, reduce, lines, index, count, deleting]);

  const shown = lines[index].slice(0, count);

  return (
    <p className="flex items-center whitespace-nowrap font-mono text-[0.95rem] text-ink sm:text-[1.1rem] xl:text-[1.2rem]">
      <span className="sr-only">{lines.join(". ")}</span>
      <span aria-hidden className="flex items-center">
        <span className="mr-3 text-accent">~ $</span>
        <span>{shown}</span>
        <span className="caret-blink ml-0.5 inline-block h-[1.15em] w-[0.55em] translate-y-[0.05em] bg-accent" />
      </span>
    </p>
  );
}
