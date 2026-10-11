import type { IconType } from "react-icons";
import { LuMic, LuSparkles } from "react-icons/lu";
import {
  SiDocker, SiElectron, SiGit, SiGooglegemini, SiLetsencrypt, SiLinux, SiMysql, SiNestjs, SiNextdotjs, SiNginx,
  SiNodedotjs, SiPhp, SiPm2, SiPostgresql, SiPrisma, SiReact, SiTailwindcss, SiThreedotjs, SiTypescript, SiVuedotjs,
} from "react-icons/si";

/** Icons for the names used in data/skills. */
export const techIcons: Record<string, IconType> = {
  "Next.js": SiNextdotjs, React: SiReact, "Vue.js": SiVuedotjs, TypeScript: SiTypescript, "Tailwind CSS": SiTailwindcss,
  "Three.js": SiThreedotjs, NestJS: SiNestjs, "Node.js": SiNodedotjs, PHP: SiPhp, PostgreSQL: SiPostgresql, MySQL: SiMysql,
  Prisma: SiPrisma, Docker: SiDocker, Nginx: SiNginx, PM2: SiPm2, Linux: SiLinux, SSL: SiLetsencrypt, Git: SiGit,
  Electron: SiElectron, Gemini: SiGooglegemini, "Voice UX": LuMic, "Prompt engineering": LuSparkles,
};
