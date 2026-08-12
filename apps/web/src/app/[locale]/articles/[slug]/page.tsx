import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailPage } from "@/components/pages/ArticleDetailPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  getArticle,
  isSupportedLocale,
  type Locale,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) return {};
  const article = await getArticle(locale, slug);
  return {
    title: article?.seoTitle ?? "Article",
    description: article?.seoDescription,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  if (!isSupportedLocale(localeParam)) notFound();

  const locale: Locale = localeParam;
  const article = await getArticle(locale, slug);
  if (!article) notFound();

  return (
    <SiteLayout
      lang={locale}
      page="works"
      currentPath={`/${locale}/articles/${article.slug}/`}
    >
      <ArticleDetailPage article={article} />
    </SiteLayout>
  );
}
