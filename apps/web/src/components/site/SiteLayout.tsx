import type { ReactNode } from "react";
import type { SiteLanguage } from "@/data/navigation";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SiteOpeningNotice } from "@/components/ui/SiteOpeningNotice";
import { getSiteOpeningNotice } from "@/lib/content";

type PageTheme = "home" | "services" | "works" | "about" | "contact" | "placeholder";

interface SiteLayoutProps {
  children: ReactNode;
  lang: SiteLanguage;
  currentPath: string;
  page?: PageTheme;
  showOpeningNotice?: boolean;
}

export async function SiteLayout({
  children,
  lang,
  currentPath,
  page = "home",
  showOpeningNotice = true,
}: SiteLayoutProps) {
  const openingNotice = showOpeningNotice ? await getSiteOpeningNotice(lang) : undefined;

  return (
    <div className={`site-shell page-theme-${page}`} lang={lang}>
      <Header lang={lang} currentPath={currentPath} />
      <main>{children}</main>
      <Footer lang={lang} />
      <SiteOpeningNotice notice={openingNotice} />
    </div>
  );
}
