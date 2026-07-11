import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { isTutorialArticle, localeLabel, statusLabel } from "@/lib/admin/labels";
import { prisma } from "@/lib/db/prisma";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ locale: "asc" }, { displayOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">文章</p>
            <h2>文章管理</h2>
            <p className="admin-help">第一次使用后台时，请先打开“教学示例”文章，了解每个字段的用途。</p>
          </div>
          <Link className="admin-button" href="/studio-tianho/articles/new">
            新增文章
          </Link>
        </header>
        <div className="admin-list">
          {articles.length === 0 ? <p className="admin-empty">还没有文章。可以先新增一篇草稿。</p> : null}
          {articles.map((article) => (
            <article className={`admin-list-row ${isTutorialArticle(article) ? "admin-list-row-sample" : ""}`} key={article.id}>
              <div>
                <p className="admin-label">
                  {localeLabel(article.locale)} / {statusLabel(article.status)} / {article.category}
                </p>
                <h3>
                  {article.title}
                  {isTutorialArticle(article) ? <span className="admin-badge">教学示例</span> : null}
                </h3>
                <p>{article.slug}</p>
              </div>
              <Link className="admin-button-secondary" href={`/studio-tianho/articles/${article.id}`}>
                编辑
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
