import { clients } from "@/data/clients";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/ui/Reveal";

/**
 * A full-width bar of logos from products in daily use, drifting left to right.
 * The row repeats until it's wide enough to loop without a gap, then shows twice.
 */
export function ClientLogos() {
  const copies = Math.max(2, Math.ceil(10 / clients.length));
  const row = Array.from({ length: copies }, () => clients).flat();
  const tiles = (dup: boolean) =>
    row.map((c, i) => (
      <li key={`${dup}-${i}`} className="shrink-0 px-3" aria-hidden={dup || i >= clients.length || undefined}>
        <div
          className={`flex h-20 items-center justify-center rounded-2xl px-6 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] ring-1 transition-transform duration-300 hover:-translate-y-1 ${
            c.tile === "light" ? "bg-white ring-black/5" : "bg-black ring-white/10"
          }`}
          style={c.tile.startsWith("#") ? { backgroundColor: c.tile } : undefined}
        >
          <img src={asset(c.logo)} alt={dup || i >= clients.length ? "" : c.name} title={c.name} loading="lazy" className="h-14 w-auto max-w-[11rem] object-contain" />
        </div>
      </li>
    ));

  return (
    <Reveal className="mt-20 sm:mt-24">
      <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-ink-2">In daily use at</p>
      <div className="client-marquee relative left-1/2 mt-6 w-screen -translate-x-1/2 overflow-hidden border-y border-line bg-ink/[0.02] py-6">
        <ul className="client-marquee-track flex w-max">
          {tiles(false)}
          {tiles(true)}
        </ul>
      </div>
    </Reveal>
  );
}
