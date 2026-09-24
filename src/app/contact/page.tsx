import type { Metadata } from "next";
import { LuClock, LuMail, LuMapPin } from "react-icons/lu";
import { SiWhatsapp } from "react-icons/si";
import { profile } from "@/data/profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project or discuss a role with Shehan Kavishka.",
};

const channels = [
  { icon: LuMail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { icon: SiWhatsapp, label: "WhatsApp", value: "Chat on WhatsApp", href: profile.whatsapp },
  { icon: LuMapPin, label: "Location", value: `${profile.location} · working remotely` },
  { icon: LuClock, label: "Reply time", value: "Usually within a day" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title={<>Tell me what you&rsquo;re <span className="text-accent">building</span>.</>}>
        A new system, a rescue job on an existing one, or a full-stack role. Share a few details and I&rsquo;ll come back with
        questions and a rough plan.
      </PageHeader>
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-28 sm:px-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:pl-16 lg:pr-28">
        <Reveal>
          <ul className="space-y-3">
            {channels.map(({ icon: Icon, label, value, href }) => {
              const body = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span>
                    <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2">{label}</span>
                    <span className="mt-0.5 block text-ink">{value}</span>
                  </span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noreferrer"
                      className="flex items-center gap-4 rounded-2xl border border-line bg-bg-2/60 p-4 transition-colors hover:border-accent/50"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-line bg-bg-2/60 p-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </section>
    </>
  );
}
