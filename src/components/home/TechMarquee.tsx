import { skillGroups } from "@/data/skills";
import { techIcons } from "@/components/ui/techIcons";

const items = skillGroups.flatMap((g) => g.items).filter((name) => techIcons[name]);

/**
 * A faint, full-width strip of the stack drifting right to left, centred behind the project cards.
 * Kept at very low contrast so it reads as texture, never competing with the cards.
 */
export function TechMarquee() {
  const row = items.map((name) => {
    const Icon = techIcons[name];
    return (
      <li key={name} className="flex shrink-0 items-center gap-3 px-8">
        <Icon size={34} />
        <span className="font-mono text-sm uppercase tracking-[0.2em]">{name}</span>
      </li>
    );
  });
  return (
    <div
      aria-hidden
      className="tech-marquee pointer-events-none absolute left-1/2 top-1/2 -z-10 w-screen -translate-x-1/2 -translate-y-1/2 overflow-hidden border-y border-ink/10 bg-ink/[0.02] py-6 text-ink opacity-[0.2]"
    >
      <ul className="tech-marquee-track flex w-max">
        {row}
        {row}
      </ul>
    </div>
  );
}
