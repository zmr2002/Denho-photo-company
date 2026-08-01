import type { Metadata } from "next";
import Link from "next/link";
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
  const publicPath = "/" + article.language + "/articles/" + article.slug + "/";

  return (
    <div className="min-h-screen bg-white">
      <aside className="sticky top-0 z-[100] flex min-h-14 items-center justify-between gap-4 bg-stone-950 px-4 py-3 text-white md:px-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-orange-300">
            {article.status === "published" ? "预览模式 · 已发布版本" : "预览模式 · 尚未公开"}
          </p>
          <p className="mt-1 text-xs text-stone-300">显示后台当前已经保存的版本</p>
        </div>
        <Link
          className="inline-flex min-h-9 items-center border border-white/40 px-4 text-xs font-semibold tracking-[0.12em] transition-colors hover:border-white hover:bg-white hover:text-stone-950"
          href={"/studio-tianho/articles/" + article.id}
        >
          返回编辑
        </Link>
      </aside>
      <SiteLayout
        currentPath={publicPath}
        lang={article.language}
        page="works"
        showOpeningNotice={false}
      >
        <ArticleDetailPage article={article} />
      </SiteLayout>
    </div>
  );
}
