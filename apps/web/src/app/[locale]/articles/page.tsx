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

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "ja") return { title: "記事", description: "制作事例、お知らせ、撮影に関する記事をご紹介します。" };
  if (locale === "zh") return { title: "文章", description: "查看制作案例、通知与摄影相关内容。" };
  return { title: "Articles", description: "Production stories, notices, and photography articles." };
}

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
