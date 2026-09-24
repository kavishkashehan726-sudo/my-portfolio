"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { projects, type Project } from "@/data/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";

type Filter = "all" | Project["kind"] | Project["category"];

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "client", label: "Client work" },
  { value: "open-source", label: "Open source" },
  { value: "SaaS", label: "SaaS" },
  { value: "POS & ERP", label: "POS & ERP" },
  { value: "Business tools", label: "Business tools" },
  { value: "Education", label: "Education" },
  { value: "AI", label: "AI" },
];

export function ProjectGrid() {
  const [filter, setFilter] = useState<Filter>("all");

  const shown = useMemo(
    () => projects.filter((p) => filter === "all" || p.kind === filter || p.category === filter),
    [filter],
  );

  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-28 sm:px-10 lg:pl-16 lg:pr-28">
      <LayoutGroup>
        <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = f.value === filter;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.value)}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${active ? "text-white" : "text-ink-2 hover:text-ink"}`}
              >
                {active && <motion.span layoutId="filter-pill" className="absolute inset-0 -z-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 font-mono text-xs text-ink-2" aria-live="polite">
          Showing {shown.length} of {projects.length}
        </p>

        <motion.div layout className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </section>
  );
}
