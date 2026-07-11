import { notFound } from "next/navigation";
import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { articleToFormValues } from "@/lib/admin/article-form";
import { isTutorialArticle, localeLabel, statusLabel } from "@/lib/admin/labels";
import { getAdminContent, type AdminArticle } from "@/lib/api/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await getAdminContent<AdminArticle>("articles", id);

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
                ? "这是后台教学示例。当前作为预上线公开演示样本显示；它不是正式客户案例。"
                : "保存后后台内容会更新。只有已发布的文章才会作为正式内容显示。"}
            </p>
          </div>
        </header>
        <AdminArticleForm articleId={article.id} contentVersion={article.version} defaultValues={articleToFormValues(article)} isTutorial={isTutorialArticle(article)} />
      </section>
    </AdminShell>
  );
}
