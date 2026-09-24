import type { ReactNode } from "react";
import { Constellation } from "@/components/home/Constellation";
import { Reveal } from "./Reveal";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative isolate overflow-hidden">
      <Constellation className="-z-10 opacity-70" />
      <div aria-hidden className="splash absolute -left-10 -top-10 -z-10 h-64 w-64 opacity-60" />
      <div className="mx-auto max-w-[1400px] px-5 pb-14 pt-36 sm:px-10 sm:pb-20 sm:pt-44 lg:pl-16 lg:pr-28">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink text-balance sm:text-6xl">
            {title}
          </h1>
          {children && <div className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">{children}</div>}
        </Reveal>
      </div>
    </header>
  );
}
