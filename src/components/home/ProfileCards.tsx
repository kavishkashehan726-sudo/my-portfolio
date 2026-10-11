"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { FaLinkedinIn } from "react-icons/fa6";
import { LuArrowUpRight } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { profile } from "@/data/profile";

const GITHUB_USER = profile.github.split("/").pop()!;
const STATS_KEY = "github-stats";

type Stats = { repos: number; followers: number };

/** Public repo and follower counts from GitHub's API, cached for the visit. Null until (or unless) they load. */
function useGithubStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STATS_KEY);
      if (cached) return setStats(JSON.parse(cached));
    } catch {
      // Storage blocked: fetch every time.
    }
    const ctrl = new AbortController();
    fetch(`https://api.github.com/users/${GITHUB_USER}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        const s = { repos: d.public_repos, followers: d.followers };
        if (typeof s.repos !== "number") return;
        setStats(s);
        try {
          sessionStorage.setItem(STATS_KEY, JSON.stringify(s));
        } catch {}
      })
      .catch(() => {
        // Rate-limited or offline: the card keeps its default line.
      });
    return () => ctrl.abort();
  }, []);
  return stats;
}

function Card({
  href,
  icon: Icon,
  label,
  title,
  sub,
  ring,
  badge,
}: {
  href: string;
  icon: IconType;
  label: string;
  title: string;
  sub: ReactNode;
  ring: string;
  badge: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="profile-card group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-4 pr-5 backdrop-blur-md transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08]"
      style={{ "--ring": ring } as CSSProperties}
    >
      <span className="profile-ring relative grid h-16 w-16 shrink-0 place-items-center rounded-full">
        <span className="profile-ping absolute inset-0 rounded-full" />
        <span className={`relative grid h-[3.25rem] w-[3.25rem] place-items-center rounded-full ${badge} transition-transform duration-500 group-hover:rotate-[360deg]`}>
          <Icon size={26} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</span>
        <span className="mt-0.5 block truncate font-display text-[0.95rem] font-semibold text-white sm:text-lg">{title}</span>
        <span className="mt-0.5 block text-xs text-white/60">{sub}</span>
      </span>
      <LuArrowUpRight size={20} className="shrink-0 text-white/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
      <span aria-hidden className="profile-shine pointer-events-none absolute inset-0" />
    </a>
  );
}

/** Big, animated links to my GitHub and LinkedIn, so they aren't missed among the small header icons. */
export function ProfileCards() {
  const stats = useGithubStats();
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[26.5rem] lg:grid-cols-1">
      <Card
        href={profile.github}
        icon={SiGithub}
        label="GitHub"
        title={`@${GITHUB_USER}`}
        sub={stats ? `${stats.repos} public repos · ${stats.followers} followers` : "Open-source code and live demos"}
        ring="conic-gradient(from var(--bubble-turn), #ff3b3f, #ff8a3d, #b18cff, #ff3b3f)"
        badge="bg-white text-[#17132e]"
      />
      <Card
        href={profile.linkedin}
        icon={FaLinkedinIn}
        label="LinkedIn"
        title={profile.name}
        sub="Let's connect"
        ring="conic-gradient(from var(--bubble-turn), #0a66c2, #4fc3ff, #ffffff, #0a66c2)"
        badge="bg-[#0a66c2] text-white"
      />
    </div>
  );
}
