"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { setBugHidden, useBugHidden } from "@/lib/bugStore";

/** Lets visitors send the roaming bug back into its tunnel (or let it out again). */
export function BugToggle() {
  const reduce = useReducedMotion();
  const hidden = useBugHidden();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Wait for mount: reduced motion and the stored choice are only known in the browser.
  if (!mounted || reduce) return null;

  return (
    <button type="button" onClick={() => setBugHidden(!hidden)} className="underline-offset-4 transition-colors hover:text-accent hover:underline">
      {hidden ? "Let the bug out" : "Hide the bug"}
    </button>
  );
}
