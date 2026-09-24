"use client";

import { motion } from "motion/react";
import { LuArrowUpRight, LuLock } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import type { Project } from "@/data/projects";
import { asset } from "@/lib/asset";

/** Typographic cover for projects without a screenshot: the project's initials over a node grid. */
function Cover({ project }: { project: Project }) {
  const initials = project.title
    .split(/[\s&]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0f0c22]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 transition-transform duration-700 group-hover:scale-110"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(199,154,85,.7) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div aria-hidden className="nebula absolute -bottom-1/2 -right-1/4 h-[140%] w-[90%] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute bottom-3 left-5 font-display text-7xl font-semibold tracking-tighter text-white/90">{initials}</span>
      <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur">
        {project.category}
      </span>
    </div>
  );
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const privateWork = project.kind === "client" && !project.repo;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-bg-2/70 backdrop-blur transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-accent/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(project.image)}
            alt={`Screenshot of ${project.title}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <Cover project={project} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2">{project.client ?? project.category}</p>
          {privateWork ? (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] text-ink-2">
              <LuLock size={11} aria-hidden /> Client work · private
            </span>
          ) : (
            project.kind === "open-source" && (
              <span className="shrink-0 rounded-full bg-accent/12 px-2.5 py-1 text-[11px] text-accent">Open source</span>
            )
          )}
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{project.summary}</p>
        <ul className="mt-4 space-y-1.5 text-sm text-ink">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.stack.map((s) => (
            <li key={s} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-ink-2">
              {s}
            </li>
          ))}
        </ul>
        {(project.repo || project.live) && (
          <div className="mt-auto flex gap-4 pt-6 text-sm font-medium">
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                Open live site <LuArrowUpRight size={15} aria-hidden />
              </a>
            )}
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-ink hover:text-accent">
                <SiGithub size={14} aria-hidden /> View code
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
