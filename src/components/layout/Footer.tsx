import { navItems, profile } from "@/data/profile";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { SocialLinks } from "./Header";

export function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-12 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:pl-16 lg:pr-28">
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            {profile.shortName}
            <span className="text-accent">.</span>
          </p>
          <p className="mt-1 text-sm text-ink-2">
            {profile.role} · {profile.location}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
        <SocialLinks />
      </div>
      <p className="border-t border-line px-5 py-5 text-center font-mono text-[11px] tracking-wider text-ink-2">
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </p>
    </footer>
  );
}
