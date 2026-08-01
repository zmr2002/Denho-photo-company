import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailPage } from "@/components/pages/ArticleDetailPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { adminArticleToPreview } from "@/lib/admin/article-preview";
import { getAdminContent, type AdminArticle } from "@/lib/api/admin";
import { requireAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文章预览",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type PreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArticlePreviewPage({ params }: PreviewPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const storedArticle = await getAdminContent<AdminArticle>("articles", id);
  if (!storedArticle) notFound();

  const article = adminArticleToPreview(storedArticle);

  return (
    <SiteLayout
      currentPath={"/" + article.language + "/articles/" + article.slug + "/"}
      lang={article.language}
      page="works"
    >
      <ArticleDetailPage article={article} />
    </SiteLayout>
  );
}
