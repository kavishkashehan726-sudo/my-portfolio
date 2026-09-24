export const profile = {
  name: "Shehan Kavishka",
  shortName: "shehan kavishka",
  role: "Full-Stack Engineer",
  location: "Hikkaduwa, Sri Lanka",
  company: { name: "Thambapanni IT Solutions", url: "https://thambapanniitsolutions.lk" },
  education: "BSE (Hons) undergraduate · The Open University of Sri Lanka",
  email: "kavishkashehan726@gmail.com",
  whatsapp: "https://wa.me/94753429801",
  github: "https://github.com/kavishkashehan726-sudo",
  intro:
    "Full-stack engineer from Hikkaduwa, Sri Lanka. I design, build and deploy multi-tenant SaaS, POS & ERP systems and learning platforms — then keep them running on production servers long after launch.",
  stats: [
    { value: "15+", label: "live production sites I deploy and maintain" },
    { value: "10+", label: "business systems built for real clients" },
    { value: "1.5 yrs", label: "shipping professional software with AI" },
  ],
} as const;

export type NavItem = { label: string; href: string; icon: "home" | "about" | "skills" | "projects" | "faqs" | "contact" };

export const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "About", href: "/#about", icon: "about" },
  { label: "Skills", href: "/#skills", icon: "skills" },
  { label: "Projects", href: "/projects", icon: "projects" },
  { label: "FAQs", href: "/faqs", icon: "faqs" },
  { label: "Contact", href: "/contact", icon: "contact" },
];
