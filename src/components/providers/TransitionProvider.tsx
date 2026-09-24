"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";

type Navigate = (href: string) => void;

const TransitionContext = createContext<Navigate>(() => {});

const FADE_MS = 450;

const splitHref = (href: string) => {
  const [path, hash] = href.split("#");
  return { path: path || "/", hash: hash ? `#${hash}` : "" };
};

const normalise = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

/** Fade-to-black route changes: cover the screen, swap the page, then reveal it. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const [covered, setCovered] = useState(false);
  const pendingHash = useRef<string | null>(null);

  const scrollTo = useCallback(
    (hash: string, immediate: boolean) => {
      const target = hash ? document.querySelector<HTMLElement>(hash) : null;
      if (lenis) lenis.scrollTo(target ?? 0, { immediate, offset: target ? -24 : 0 });
      else (target ?? document.body).scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    },
    [lenis],
  );

  const navigate = useCallback<Navigate>(
    (href) => {
      const { path, hash } = splitHref(href);
      if (normalise(path) === normalise(pathname)) {
        scrollTo(hash, false);
        history.replaceState(null, "", href);
        return;
      }
      pendingHash.current = hash;
      setCovered(true);
      window.setTimeout(() => router.push(href, { scroll: false }), FADE_MS);
    },
    [pathname, router, scrollTo],
  );

  // New page mounted behind the curtain: jump to its start (or hash), then lift the curtain.
  useEffect(() => {
    if (pendingHash.current === null) return;
    const hash = pendingHash.current;
    pendingHash.current = null;
    requestAnimationFrame(() => {
      scrollTo(hash, true);
      setCovered(false);
    });
  }, [pathname, scrollTo]);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <AnimatePresence>
        {covered && (
          <motion.div
            key="curtain"
            aria-hidden
            className="pointer-events-auto fixed inset-0 z-[80] bg-[#07060f]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
          />
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

export const useNavigate = () => useContext(TransitionContext);
