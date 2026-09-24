import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Skills } from "@/components/home/Skills";
import { SelectedWork } from "@/components/home/SelectedWork";
import { CallToAction } from "@/components/home/CallToAction";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <SelectedWork />
      <CallToAction />
    </>
  );
}
