import type { IconType } from "react-icons";
import { LuFolderKanban, LuGlobe, LuHouse, LuLayoutGrid, LuMail, LuMessageCircleQuestion, LuUser } from "react-icons/lu";
import { SiGithub, SiWhatsapp } from "react-icons/si";
import type { NavItem } from "@/data/profile";
import { profile } from "@/data/profile";

export const navIcon: Record<NavItem["icon"], IconType> = {
  home: LuHouse,
  about: LuUser,
  skills: LuLayoutGrid,
  projects: LuFolderKanban,
  faqs: LuMessageCircleQuestion,
  contact: LuMail,
};

export const socials: { label: string; href: string; icon: IconType; primary?: boolean }[] = [
  { label: "WhatsApp", href: profile.whatsapp, icon: SiWhatsapp },
  { label: "Email", href: `mailto:${profile.email}`, icon: LuMail },
  { label: "Thambapanni IT Solutions", href: profile.company.url, icon: LuGlobe },
  { label: "GitHub", href: profile.github, icon: SiGithub, primary: true },
];
