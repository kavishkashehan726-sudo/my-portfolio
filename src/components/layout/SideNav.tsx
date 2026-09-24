"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/profile";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { navIcon } from "./navIcons";

const SECTIONS = ["home", "about", "skills"];

/** The floating vertical pill from the template. Tracks the route, and on the home page the section in view. */
export function SideNav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [section, setSection] = useState("home");

  useEffect(() => {
    if (!onHome) return;
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setSection(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [onHome, pathname]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return onHome && section === href.slice(2);
    if (href === "/") return onHome && section === "home";
    return pathname.replace(/\/$/, "") === href;
  };

  return (
    <nav
      aria-label="Sections"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 rounded-full border border-line bg-[var(--nav-bg)] p-2 shadow-[0_10px_40px_rgba(0,0,0,.18)] backdrop-blur-xl lg:block xl:right-8"
    >
      <ul className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = navIcon[item.icon];
          const active = isActive(item.href);
          return (
            <li key={item.href} className="group relative">
              <TransitionLink
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${
                  active ? "bg-accent/15 text-accent" : "text-ink-2 hover:text-ink"
                }`}
              >
                <Icon size={17} />
              </TransitionLink>
              <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-medium text-bg opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100">
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
