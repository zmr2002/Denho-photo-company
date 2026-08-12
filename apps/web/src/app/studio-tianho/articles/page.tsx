import Link from "next/link";
import { ArticleWorklist } from "@/components/admin/ArticleWorklist";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminCollection, type AdminArticle } from "@/lib/api/admin";

export default async function AdminArticlesPage() {
  const articles = await getAdminCollection<AdminArticle>("articles");

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
        <ArticleWorklist articles={articles} />
      </section>
    </AdminShell>
  );
}
