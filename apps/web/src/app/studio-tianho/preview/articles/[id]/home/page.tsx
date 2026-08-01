import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { adminArticleToHomeNewsItem, adminArticleToPreview, selectAdminArticlesForPlacement } from "@/lib/admin/article-preview";
import { getAdminCollection, getAdminContent, type AdminArticle } from "@/lib/api/admin";
import { requireAdminSession } from "@/lib/auth/session";
import { getHomePageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "首页文章栏预览",
  robots: { index: false, follow: false, nocache: true },
};

type PreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArticleHomePreviewPage({ params }: PreviewPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const records = selectAdminArticlesForPlacement(await getAdminCollection<AdminArticle>("articles"), id);
  const target = records.find((article) => article.id === id);
  if (!target) notFound();

  const locale = adminArticleToPreview(target).language;
  const baseContent = await getHomePageContent(locale);
  const detailedRecords = await Promise.all(
    records.slice(0, 3).map(async (article) =>
      (await getAdminContent<AdminArticle>("articles", article.id)) ?? article,
    ),
  );
  const content = {
    ...baseContent,
    news: {
      ...baseContent.news,
      items: detailedRecords.map(adminArticleToHomeNewsItem),
    },
  };

  return (
    <SiteLayout lang={locale} page="home" currentPath={`/${locale}/`}>
      <HomePage content={content} basePath={`/${locale}`} />
    </SiteLayout>
  );
}