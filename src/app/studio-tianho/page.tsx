import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db/prisma";

export default async function AdminDashboardPage() {
  const [articleCount, noticeCount, workCount] = await Promise.all([
    prisma.article.count(),
    prisma.openingNotice.count(),
    prisma.work.count(),
  ]);

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">Local MVP</p>
            <h2>Content dashboard</h2>
          </div>
        </header>
        <div className="admin-grid admin-grid-3">
          <article className="admin-card">
            <p className="admin-label">Articles</p>
            <h3>{articleCount}</h3>
            <Link className="admin-button-secondary" href="/studio-tianho/articles">
              Manage articles
            </Link>
          </article>
          <article className="admin-card">
            <p className="admin-label">Opening notices</p>
            <h3>{noticeCount}</h3>
            <Link className="admin-button-secondary" href="/studio-tianho/notice">
              Manage notices
            </Link>
          </article>
          <article className="admin-card">
            <p className="admin-label">Works</p>
            <h3>{workCount}</h3>
            <Link className="admin-button-secondary" href="/studio-tianho/works">
              Manage images
            </Link>
          </article>
        </div>
      </section>
    </AdminShell>
  );
}
