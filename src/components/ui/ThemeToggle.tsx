"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LuMoon, LuSun } from "react-icons/lu";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted ? resolvedTheme === "dark" : false;
  const label = dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      {mounted && (dark ? <LuSun size={16} /> : <LuMoon size={16} />)}
    </button>
  );
}
