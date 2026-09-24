import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { FaqList } from "./FaqList";

export const metadata: Metadata = {
  title: "FAQs",
  description: "How Shehan Kavishka works: stack, deployment, AI, availability and how to start a project.",
};

export default function FaqsPage() {
  return (
    <>
      <PageHeader eyebrow="FAQs" title="Questions people ask before we start.">
        Can&rsquo;t find yours?{" "}
        <TransitionLink href="/contact" className="text-accent underline underline-offset-4">
          Send me a message
        </TransitionLink>
        .
      </PageHeader>
      <section className="mx-auto max-w-[1400px] px-5 pb-28 sm:px-10 lg:pl-16 lg:pr-28">
        <FaqList />
      </section>
    </>
  );
}
