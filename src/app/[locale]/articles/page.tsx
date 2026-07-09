import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListPage } from "@/components/pages/ArticleListPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  getArticles,
  getSupportedLocales,
  isSupportedLocale,
  type Locale,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Articles",
  description: "Mock CMS articles for local production verification.",
};

export function generateStaticParams() {
  return getSupportedLocales().map((locale) => ({ locale }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) notFound();

  const locale: Locale = localeParam;

  return (
    <SiteLayout lang={locale} page="works" currentPath={`/${locale}/articles/`}>
      <ArticleListPage articles={await getArticles(locale)} locale={locale} />
    </SiteLayout>
  );
}
