"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { IntroProvider } from "./IntroProvider";
import { TransitionProvider } from "./TransitionProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
      <ReactLenis root options={{ lerp: 0.09, smoothWheel: true }}>
        <MotionConfig reducedMotion="user">
          <IntroProvider>
            <TransitionProvider>{children}</TransitionProvider>
          </IntroProvider>
        </MotionConfig>
      </ReactLenis>
    </ThemeProvider>
  );
}
