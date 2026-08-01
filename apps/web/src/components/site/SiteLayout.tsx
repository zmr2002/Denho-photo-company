import type { ReactNode } from "react";
import type { SiteLanguage } from "@/data/navigation";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SiteOpeningNotice } from "@/components/ui/SiteOpeningNotice";
import { getSiteOpeningNotice, type SiteNotice } from "@/lib/content";

type PageTheme = "home" | "services" | "works" | "about" | "contact" | "placeholder";

interface SiteLayoutProps {
  children: ReactNode;
  lang: SiteLanguage;
  currentPath: string;
  page?: PageTheme;
  openingNoticeOverride?: SiteNotice | null;
  forceOpeningNotice?: boolean;
}

export async function SiteLayout({
  children,
  lang,
  currentPath,
  page = "home",
  openingNoticeOverride,
  forceOpeningNotice = false,
}: SiteLayoutProps) {
  const openingNotice = openingNoticeOverride === undefined
    ? await getSiteOpeningNotice(lang)
    : openingNoticeOverride ?? undefined;

  return (
    <div className={`site-shell page-theme-${page}`} lang={lang}>
      <Header lang={lang} currentPath={currentPath} />
      <main>{children}</main>
      <Footer lang={lang} />
      <SiteOpeningNotice notice={openingNotice} ignoreStoredDismissal={forceOpeningNotice} />
    </div>
  );
}