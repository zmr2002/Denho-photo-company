import { notFound } from "next/navigation";
import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { articleToFormValues } from "@/lib/admin/article-form";
import { isTutorialArticle, localeLabel, statusLabel } from "@/lib/admin/labels";
import { prisma } from "@/lib/db/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });

  if (!article) notFound();

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">
              {localeLabel(article.locale)} / {statusLabel(article.status)}
              {isTutorialArticle(article) ? " / 教学示例" : ""}
            </p>
            <h2>编辑文章</h2>
            <p className="admin-help">
              {isTutorialArticle(article)
                ? "这是后台教学示例。可以查看每个字段的填写方式；如果要练习，请保持草稿状态。"
                : "保存后后台内容会更新。只有已发布的文章才会作为正式内容显示。"}
            </p>
          </div>
        </header>
        <AdminArticleForm articleId={article.id} defaultValues={articleToFormValues(article)} isTutorial={isTutorialArticle(article)} />
      </section>
    </AdminShell>
  );
}
