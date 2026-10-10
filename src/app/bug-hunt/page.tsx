import type { Metadata } from "next";
import { BugHunt } from "@/components/bug-hunt/BugHunt";

export const metadata: Metadata = {
  title: "Bug hunt",
  description: "Bugs crawl out of the wall and come for me at my desk. Load the slingshot and squash them before they reach me.",
};

export default function BugHuntPage() {
  return <BugHunt />;
}
