import Link from "next/link";
import type { SiteLanguage } from "@/data/navigation";
import { languageLinks } from "@/data/navigation";
import { site } from "@/data/site";

interface FooterProps {
  lang: SiteLanguage;
}

const productionText: Record<SiteLanguage, string> = {
  ja: "企画、撮影、編集、納品",
  zh: "策划、拍摄、编辑与交付",
  en: "Planning, Shooting, Editing and Delivery",
};

const mediaText: Record<SiteLanguage, string> = {
  ja: "写真 / 映像 / 当日納品",
  zh: "摄影 / 视频 / 现场交付",
  en: "Photography / Film / Live Delivery",
};

export function Footer({ lang }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="wide-container grid gap-12 py-16 md:grid-cols-2 md:items-end md:py-20">
        <div>
          <p className="text-xl font-semibold tracking-[0.08em] text-white">{site.name}</p>
          <p className="mt-5 max-w-lg text-sm leading-7 text-stone-400">
            {mediaText[lang]}
            <br />
            {productionText[lang]}
          </p>
        </div>
        <div className="text-sm leading-7 md:text-right">
          <nav className="footer-language-links" aria-label="Footer language selection">
            {languageLinks.map((item) => (
              <Link
                key={item.lang}
                href={item.href}
                aria-current={lang === item.lang ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-2 text-stone-500">© 2026 {site.name}. Demo website.</p>
        </div>
      </div>
    </footer>
  );
}
