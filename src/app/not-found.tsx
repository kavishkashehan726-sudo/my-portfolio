import { PageHeader } from "@/components/ui/PageHeader";
import { TransitionLink } from "@/components/ui/TransitionLink";

export default function NotFound() {
  return (
    <div className="min-h-[70vh]">
      <PageHeader eyebrow="404" title="This page isn't here.">
        The link may be old or mistyped.{" "}
        <TransitionLink href="/" className="text-accent underline underline-offset-4">
          Go to the home page
        </TransitionLink>{" "}
        or{" "}
        <TransitionLink href="/projects" className="text-accent underline underline-offset-4">
          browse projects
        </TransitionLink>
        .
      </PageHeader>
    </div>
  );
}
