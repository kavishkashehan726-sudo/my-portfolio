import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Preloader } from "@/components/layout/Preloader";
import { Header } from "@/components/layout/Header";
import { SideNav } from "@/components/layout/SideNav";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { profile } from "@/data/profile";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", weight: ["400", "500"] });

const siteUrl = "https://kavishkashehan726-sudo.github.io/my-portfolio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${profile.name} · ${profile.role}`, template: `%s · ${profile.name}` },
  description: profile.intro,
  authors: [{ name: profile.name, url: profile.github }],
  openGraph: {
    type: "website",
    title: `${profile.name} · ${profile.role}`,
    description: profile.intro,
    images: [{ url: "og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#120f26" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2fa" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <body>
        <noscript>
          <style>{`[role="status"]{display:none!important}`}</style>
        </noscript>
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
            Skip to content
          </a>
          <Preloader />
          <Cursor />
          <Header />
          <SideNav />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
