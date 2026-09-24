import { LuArrowUpRight } from "react-icons/lu";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";

export function CallToAction() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 pb-28 pt-10 sm:px-10 lg:pl-16 lg:pr-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-[#0c0a1c] px-6 py-16 text-center text-white sm:px-12 sm:py-24">
          <div aria-hidden className="nebula absolute left-1/2 top-full h-[160%] w-[90%] -translate-x-1/2 -translate-y-1/2 opacity-80" />
          <p className="eyebrow relative">Open for freelance & full-time</p>
          <h2 className="relative mx-auto mt-5 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-6xl">
            Have a system in mind? Let&rsquo;s build it.
          </h2>
          <div className="relative mt-10 flex justify-center">
            <Magnetic>
              <TransitionLink
                href="/contact"
                className="flex items-center gap-2 rounded-full bg-[#ff3b3f] px-8 py-4 font-medium text-white shadow-[0_10px_40px_rgba(255,59,63,.35)] transition-transform hover:scale-[1.03]"
              >
                Let&rsquo;s talk <LuArrowUpRight size={18} aria-hidden />
              </TransitionLink>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
