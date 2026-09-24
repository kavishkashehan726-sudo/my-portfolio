import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectGrid } from "./ProjectGrid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Business systems, SaaS platforms and open-source web projects built by Shehan Kavishka.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader eyebrow="Projects" title={<>Work that runs <span className="text-accent">real businesses</span>.</>}>
        Most of this is client work in private repositories, so there&rsquo;s no code to link. Each card says what the system does
        and what it&rsquo;s built with. The open-source projects link to their code and live demos.
      </PageHeader>
      <ProjectGrid />
    </>
  );
}
