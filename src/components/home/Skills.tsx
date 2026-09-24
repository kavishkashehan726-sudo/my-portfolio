import type { IconType } from "react-icons";
import {
  SiDocker, SiElectron, SiGit, SiGooglegemini, SiLetsencrypt, SiLinux, SiMysql, SiNestjs, SiNextdotjs, SiNginx,
  SiNodedotjs, SiPhp, SiPm2, SiPostgresql, SiPrisma, SiReact, SiTailwindcss, SiThreedotjs, SiTypescript, SiVuedotjs,
} from "react-icons/si";
import { LuMic, LuSparkles } from "react-icons/lu";
import { skillGroups } from "@/data/skills";
import { Reveal } from "@/components/ui/Reveal";

const icons: Record<string, IconType> = {
  "Next.js": SiNextdotjs, React: SiReact, "Vue.js": SiVuedotjs, TypeScript: SiTypescript, "Tailwind CSS": SiTailwindcss,
  "Three.js": SiThreedotjs, NestJS: SiNestjs, "Node.js": SiNodedotjs, PHP: SiPhp, PostgreSQL: SiPostgresql, MySQL: SiMysql,
  Prisma: SiPrisma, Docker: SiDocker, Nginx: SiNginx, PM2: SiPm2, Linux: SiLinux, SSL: SiLetsencrypt, Git: SiGit,
  Electron: SiElectron, Gemini: SiGooglegemini, "Voice UX": LuMic, "Prompt engineering": LuSparkles,
};

// The real order a release goes through, so numbering carries meaning here.
const pipeline = ["git push", "build & test", "Docker / PM2", "Nginx + SSL", "live & monitored"];

const spans = ["lg:col-span-4", "lg:col-span-2", "lg:col-span-3", "lg:col-span-3"];

export function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 sm:px-10 sm:py-32 lg:pl-16 lg:pr-28">
      <Reveal>
        <p className="eyebrow">Skills & tools</p>
        <h2 className="mt-5 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink text-balance sm:text-5xl">
          One engineer, from the first screen to the production server.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {skillGroups.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.06} className={spans[i]}>
            <article className="group h-full rounded-3xl border border-line bg-bg-2/70 p-6 backdrop-blur transition-colors hover:border-accent/50 sm:p-8">
              <h3 className="font-display text-xl font-semibold text-ink">{g.title}</h3>
              <p className="mt-2 text-sm text-ink-2">{g.note}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {g.items.map((item) => {
                  const Icon = icons[item];
                  return (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-sm text-ink transition-colors group-hover:border-line"
                    >
                      {Icon && <Icon size={14} className="text-ink-2" aria-hidden />}
                      {item}
                    </li>
                  );
                })}
              </ul>
            </article>
          </Reveal>
        ))}

        <Reveal delay={0.25} className="sm:col-span-2 lg:col-span-6">
          <article className="relative overflow-hidden rounded-3xl border border-line bg-[#0c0a1c] p-6 text-white sm:p-8">
            <div aria-hidden className="nebula absolute -right-24 -top-24 h-72 w-72 opacity-60" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">How a release reaches production</h3>
                <p className="mt-2 text-sm text-white/60">The part most portfolios skip. I run it for every site I maintain.</p>
              </div>
              <ol className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm">
                {pipeline.map((step, i) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
                      <span className="mr-2 text-[#ff3b3f]">{i + 1}</span>
                      {step}
                    </span>
                    {i < pipeline.length - 1 && <span className="text-white/30" aria-hidden>→</span>}
                  </li>
                ))}
              </ol>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
