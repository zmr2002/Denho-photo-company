import Link from "next/link";
import { getLanguageBase, languageLinks, navigationLabels } from "@/data/navigation";
import { site } from "@/data/site";
import type { SiteLanguage } from "@/data/navigation";

interface HeaderProps {
  lang: SiteLanguage;
  currentPath: string;
}

export function Header({ lang, currentPath }: HeaderProps) {
  const isRootMarket = currentPath === "/";
  const navBase = getLanguageBase(lang);
  const labels = navigationLabels[lang];
  const navItems = [
    { href: `${navBase}/`, label: labels.home },
    { href: `${navBase}/services/`, label: labels.services },
    { href: `${navBase}/works/`, label: labels.works },
    { href: `${navBase}/about/`, label: labels.about },
    { href: `${navBase}/contact/`, label: labels.contact },
  ];

  const isCurrent = (href: string) =>
    currentPath === href || (isRootMarket && href === "/ja/");

  return (
    <header className="site-header">
      <div className="header-grid wide-container">
        <Link className="site-wordmark" href="/">
          {site.name}
        </Link>

        <nav className="primary-navigation" aria-label="Primary navigation">
          <ul>
            {navItems.map((item) => {
              const current = isCurrent(item.href);
              const className = [
                "nav-link",
                current ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <li key={item.href}>
                  <Link
                    className={className}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav className="language-navigation" aria-label="Language selection">
          <ul>
            {languageLinks.map((item) => (
              <li key={item.lang}>
                <Link
                  className={`language-link ${lang === item.lang ? "active" : ""}`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
