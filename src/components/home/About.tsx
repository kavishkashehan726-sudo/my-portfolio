import { LuBuilding2, LuGraduationCap, LuMapPin, LuUsers } from "react-icons/lu";
import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";

const facts = [
  { icon: LuMapPin, label: "Based in", value: profile.location },
  { icon: LuBuilding2, label: "Working at", value: profile.company.name, href: profile.company.url },
  { icon: LuGraduationCap, label: "Studying", value: profile.education },
  { icon: LuUsers, label: "Clients include", value: "Maliban distribution, hospitals, restaurants, law firms and schools" },
];

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

        <div className="flex flex-col gap-10">
          <Reveal delay={0.15}>
            <dl className="divide-y divide-line rounded-3xl border border-line bg-bg-2/60 backdrop-blur">
              {facts.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex gap-4 p-5 sm:p-6">
                  <Icon className="mt-0.5 shrink-0 text-accent" size={18} aria-hidden />
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2">{label}</dt>
                    <dd className="mt-1 text-ink">
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer" className="underline decoration-accent/50 underline-offset-4 hover:text-accent">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.2}>
            <ul className="grid grid-cols-3 gap-4">
              {profile.stats.map((s) => (
                <li key={s.label}>
                  <p className="font-display text-3xl font-semibold text-ink sm:text-4xl">{s.value}</p>
                  <p className="mt-2 text-xs leading-snug text-ink-2 sm:text-sm">{s.label}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
