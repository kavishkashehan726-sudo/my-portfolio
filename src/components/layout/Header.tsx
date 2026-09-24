"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LuMenu, LuX } from "react-icons/lu";
import { useLenis } from "lenis/react";
import { navItems, profile } from "@/data/profile";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { socials } from "./navIcons";

export function Logo() {
  return (
    <TransitionLink href="/" className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl" aria-label={`${profile.name}, home`}>
      {profile.shortName}
      <span className="text-accent">.</span>
    </TransitionLink>
  );
}

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {socials.map(({ label, href, icon: Icon, primary }) => (
        <li key={label}>
          <a
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={label}
            title={label}
            className={
              primary
                ? "ml-1 grid h-9 w-9 place-items-center rounded-full bg-accent text-white transition-transform hover:scale-110"
                : "grid h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:text-accent"
            }
          >
            <Icon size={primary ? 17 : 15} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lenis = useLenis();

  useLenis(({ scroll }) => setScrolled(scroll > 40));

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:h-20 sm:px-10 lg:px-16">
          <Logo />
          <div className="flex items-center gap-2">
            <SocialLinks className="hidden md:flex" />
            <ThemeToggle className="ml-1" />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink lg:hidden"
            >
              <LuMenu size={18} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[70] flex flex-col bg-[#07060f] px-6 pb-10 pt-5 text-white"
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 36px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 36px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 36px)" }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-semibold">
                {profile.shortName}
                <span className="text-accent">.</span>
              </span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full border border-white/15">
                <LuX size={20} />
              </button>
            </div>
            <nav className="mt-12 flex flex-1 flex-col justify-center" aria-label="Main">
              <ul className="space-y-2">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TransitionLink
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-4 font-display text-5xl font-semibold tracking-tight sm:text-6xl"
                    >
                      <span className="transition-colors group-hover:text-[#ff3b3f]">{item.label}</span>
                    </TransitionLink>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center justify-between text-sm text-white/60">
              <a href={`mailto:${profile.email}`} className="hover:text-white">
                {profile.email}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
