export type Project = {
  slug: string;
  title: string;
  client?: string;
  summary: string;
  highlights: string[];
  stack: string[];
  kind: "client" | "open-source";
  category: "SaaS" | "POS & ERP" | "Education" | "Web" | "Business tools" | "AI";
  repo?: string;
  live?: string;
  image?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "maliban-distribution",
    title: "Distribution & Credit Control System",
    client: "Bhathiya Group · Maliban distributor",
    summary:
      "One system for a biscuit distributor's whole cash cycle: sales, distribution, delivery, collection, credit control and banking.",
    highlights: ["Route-level delivery and collection tracking", "Credit limits and outstanding control per outlet", "Daily banking reconciliation"],
    stack: ["PHP", "MySQL", "JavaScript"],
    kind: "client",
    category: "Business tools",
    featured: true,
  },
  {
    slug: "amb-restaurant-pos",
    title: "Restaurant POS & ERP",
    client: "Amb Restaurant",
    summary:
      "A multi-tenant restaurant management system that runs the tills of a working restaurant every day, with a printer bridge and scheduled jobs.",
    highlights: ["Live in daily service", "Kitchen & receipt printer bridge", "Multi-tenant from day one"],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
    kind: "client",
    category: "POS & ERP",
    featured: true,
  },
  {
    slug: "multi-tenant-lms",
    title: "Multi-tenant LMS Platform",
    summary:
      "School and institute management served to many tenants, each on their own domain, with a role-based super-admin portal.",
    highlights: ["Custom domain per tenant", "Role-based super-admin portal", "Classes, students and payments"],
    stack: ["Next.js", "NestJS", "PostgreSQL", "Nginx"],
    kind: "client",
    category: "Education",
    featured: true,
  },
  {
    slug: "microfinance-saas",
    title: "Microfinance SaaS",
    summary: "A multi-tenant loan and operations platform for Sri Lankan microfinance companies — borrowers, loans, schedules and collections.",
    highlights: ["Loan schedules and arrears", "Field collection workflows", "Tenant-isolated data"],
    stack: ["NestJS", "Next.js", "PostgreSQL"],
    kind: "client",
    category: "SaaS",
  },
  {
    slug: "lawyer-mail",
    title: "Lawyer Mail & Translation System",
    client: "Law firm",
    summary:
      "Generates English→Sinhala envelopes and Post Office manifests for a law firm, with Gemini handling the translation.",
    highlights: ["English→Sinhala address translation", "Printable envelopes", "Post Office manifest export"],
    stack: ["Next.js", "PostgreSQL", "Gemini"],
    kind: "client",
    category: "AI",
  },
  {
    slug: "hospital-management",
    title: "Hospital Management UI",
    client: "Hospital",
    summary: "Patient, staff and appointment management interface, containerised with Docker for consistent development and serving.",
    highlights: ["Patient & appointment flows", "Staff management", "Docker-based dev serving"],
    stack: ["TypeScript", "React", "Docker"],
    kind: "client",
    category: "Business tools",
  },
  {
    slug: "studio-pos",
    title: "StudioPOS",
    client: "Studio Liberty",
    summary: "A desktop POS & ERP for a photo studio — orders, billing and stock in an app that works on the shop's own machines.",
    highlights: ["Desktop app, offline-friendly", "Orders, billing & stock", "Built for the counter"],
    stack: ["Electron", "React", "JavaScript"],
    kind: "client",
    category: "POS & ERP",
  },
  {
    slug: "talkmate",
    title: "TalkMate",
    summary: "An AI-powered, voice-first English learning companion that installs as a PWA and lets learners practise by speaking.",
    highlights: ["Voice-first practice", "Installable PWA", "AI conversation partner"],
    stack: ["Next.js", "TypeScript", "AI"],
    kind: "client",
    category: "AI",
  },
  {
    slug: "lead-crm",
    title: "Lead Management CRM",
    client: "Thambapanni IT Solutions",
    summary: "A mobile-first lead pipeline the marketing team uses in the field to capture, follow up and close leads.",
    highlights: ["Mobile-first for field teams", "Pipeline stages & follow-ups", "Team-wide visibility"],
    stack: ["Next.js", "TypeScript"],
    kind: "client",
    category: "Business tools",
  },
  {
    slug: "construction-finance",
    title: "Construction Finance Tracker",
    summary: "Tracks income, expenses and budgets across construction projects so owners see where the money went, per site.",
    highlights: ["Per-project budgets", "Expense categories", "Financial summaries"],
    stack: ["Next.js", "Prisma", "MySQL"],
    kind: "client",
    category: "Business tools",
  },
  {
    slug: "salon-saas",
    title: "Salon SaaS Platform",
    summary: "A multi-tenant platform for Sri Lankan salons — bookings, services, staff and billing under each salon's own brand.",
    highlights: ["Online bookings", "Staff & service management", "Per-salon branding"],
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
    kind: "client",
    category: "SaaS",
  },
  {
    slug: "ecommerce-saas",
    title: "E-commerce SaaS",
    summary: "Multivendor and single-vendor e-commerce for Sri Lankan sellers, from a single codebase.",
    highlights: ["Multivendor or single-vendor mode", "Seller dashboards", "Built for local payments"],
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
    kind: "client",
    category: "SaaS",
  },
  {
    slug: "thambapanni-it",
    title: "Thambapanni IT Website",
    client: "Thambapanni IT Solutions",
    summary: "The company's full-stack portfolio website, with an admin panel the team uses to publish their own work.",
    highlights: ["Content admin panel", "Company portfolio", "Deployed & maintained"],
    stack: ["HTML", "CSS", "JavaScript"],
    kind: "client",
    category: "Web",
    live: "https://thambapanniitsolutions.lk",
  },
  {
    slug: "edu-orbit-lms",
    title: "EduOrbit",
    summary:
      "Your whole student life in one place — a study planner, Pomodoro timer, GPA calculator, Vue 3 forum and wellness tracker behind one dashboard.",
    highlights: ["No build step", "Vue 3 forum", "GPA calculator & Pomodoro timer"],
    stack: ["HTML", "CSS", "JavaScript", "Vue 3"],
    kind: "open-source",
    category: "Education",
    repo: "https://github.com/kavishkashehan726-sudo/edu-orbit-lms",
    live: "https://kavishkashehan726-sudo.github.io/edu-orbit-lms/",
    image: "/images/projects/edu-orbit.webp",
    featured: true,
  },
  {
    slug: "vyona-villa",
    title: "VYONA Villa",
    client: "Boutique villa · Weligama",
    summary:
      "A direct-booking site for a seven-room boutique villa, with an interactive Three.js villa, a custom GLSL water shader and a working mock booking flow.",
    highlights: ["Interactive Three.js villa", "Custom GLSL water shader", "Mock booking flow"],
    stack: ["Three.js", "GLSL", "CSS", "JavaScript"],
    kind: "open-source",
    category: "Web",
    repo: "https://github.com/kavishkashehan726-sudo/vyona-villa",
    featured: true,
  },
];
