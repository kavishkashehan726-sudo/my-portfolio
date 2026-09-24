import { LuArrowRight } from "react-icons/lu";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";

export function SelectedWork() {
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-10 sm:py-32 lg:pl-16 lg:pr-28">
      <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Selected work</p>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink text-balance sm:text-5xl">
            Systems in daily use, not just demos.
          </h2>
        </div>
        <TransitionLink href="/projects" className="group flex shrink-0 items-center gap-2 font-medium text-ink hover:text-accent">
          See all {projects.length} projects
          <LuArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden />
        </TransitionLink>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}
