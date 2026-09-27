import { useSyncExternalStore } from "react";

const KEY = "bug-hidden";
const listeners = new Set<() => void>();
let memory = false; // used when storage is blocked

function read() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return memory;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Whether the visitor sent the bug back into its tunnel. Remembered per browser. */
export function useBugHidden() {
  return useSyncExternalStore(subscribe, read, () => true);
}

export function setBugHidden(hidden: boolean) {
  memory = hidden;
  try {
    if (hidden) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: `memory` keeps the choice until reload.
  }
  listeners.forEach((l) => l());
}
