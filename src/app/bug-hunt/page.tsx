import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TransitionLink } from "@/components/ui/TransitionLink";

export const metadata: Metadata = {
  title: "Bug hunt",
  description: "The bug that roams this portfolio lives here.",
};

export default function BugHuntPage() {
  return (
    <PageHeader eyebrow="Bug hunt" title="The hunting ground is still being built.">
      For now the bug roams every page. Come back soon to catch it, or{" "}
      <TransitionLink href="/" className="text-accent underline underline-offset-4">
        head back home
      </TransitionLink>
      .
    </PageHeader>
  );
}
