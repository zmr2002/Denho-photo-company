import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
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
            <p className="admin-kicker">Articles</p>
            <h2>Article content</h2>
          </div>
          <Link className="admin-button" href="/studio-tianho/articles/new">
            New article
          </Link>
        </header>
        <div className="admin-list">
          {articles.map((article) => (
            <article className="admin-list-row" key={article.id}>
              <div>
                <p className="admin-label">
                  {article.locale} / {article.status} / {article.category}
                </p>
                <h3>{article.title}</h3>
                <p>{article.slug}</p>
              </div>
              <Link className="admin-button-secondary" href={`/studio-tianho/articles/${article.id}`}>
                Edit
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
