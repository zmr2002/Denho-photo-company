import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListPage } from "@/components/pages/ArticleListPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { adminArticleToPreview, selectAdminArticlesForPlacement } from "@/lib/admin/article-preview";
import { getAdminCollection, type AdminArticle } from "@/lib/api/admin";
import { requireAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文章列表预览",
  robots: { index: false, follow: false, nocache: true },
};

type PreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArticleListPreviewPage({ params }: PreviewPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const records = selectAdminArticlesForPlacement(await getAdminCollection<AdminArticle>("articles"), id);
  const target = records.find((article) => article.id === id);
  if (!target) notFound();

  const locale = adminArticleToPreview(target).language;
  const articles = records.map(adminArticleToPreview);

  return (
    <SiteLayout lang={locale} page="works" currentPath={`/${locale}/articles/`}>
      <ArticleListPage
        articles={articles}
        locale={locale}
        articleHref={(article) =>
          article.id === id
            ? `/studio-tianho/preview/articles/${id}/`
            : `/${locale}/articles/${article.slug}/`
        }
      />
    </SiteLayout>
  );
}