"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LuPlus } from "react-icons/lu";
import { faqs } from "@/data/faqs";
import { Reveal } from "@/components/ui/Reveal";

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <ul className="max-w-4xl divide-y divide-line border-y border-line">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q}>
            <Reveal delay={Math.min(i * 0.05, 0.3)}>
              <h2>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${id}-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
                >
                  <span className={`font-display text-lg font-semibold transition-colors sm:text-2xl ${isOpen ? "text-accent" : "text-ink group-hover:text-accent"}`}>
                    {f.q}
                  </span>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                      isOpen ? "rotate-45 border-accent bg-accent text-white" : "border-line text-ink"
                    }`}
                    aria-hidden
                  >
                    <LuPlus size={18} />
                  </span>
                </button>
              </h2>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`${id}-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl pb-7 pr-14 leading-relaxed text-ink-2">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
