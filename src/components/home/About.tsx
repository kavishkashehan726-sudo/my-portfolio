import { Reveal } from "@/components/ui/Reveal";
import { FactsBubble } from "./FactsBubble";
import { StatBars } from "./StatBars";

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 sm:px-10 sm:py-32 lg:pl-16 lg:pr-28">
      <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">About</p>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-ink text-balance sm:text-5xl">
              I don&rsquo;t stop at <span className="font-mono text-[0.8em] text-accent">git push</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 space-y-5 text-[1.05rem] leading-relaxed text-ink-2">
              <p>
                I build the software small and growing businesses run on every day: point-of-sale tills, distribution and credit control,
                loan books, school portals and CRMs. Most of it is multi-tenant, so one codebase serves many organisations, each with
                its own data and domain.
              </p>
              <p>
                Then I ship it. I provision the servers, configure Nginx, run the apps under PM2, systemd or Docker, set up SSL and
                keep an eye on uptime. Right now that&rsquo;s more than fifteen live production sites.
              </p>
              <p>
                Lately I&rsquo;ve been building AI into products (Gemini-driven translation, voice-first language practice) and
                experimenting with interactive 3D on the web.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-[4.5rem] lg:gap-16">
          <Reveal delay={0.15}>
            <FactsBubble />
          </Reveal>
          <Reveal delay={0.2}>
            <StatBars />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
