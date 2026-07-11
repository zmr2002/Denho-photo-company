import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { tutorialArticleSlug } from "@/lib/admin/labels";
import { getAdminCollection, type AdminArticle, type AdminNotice, type AdminWork } from "@/lib/api/admin";

export default async function AdminDashboardPage() {
  const [articles, notices, works] = await Promise.all([
    getAdminCollection<AdminArticle>("articles"),
    getAdminCollection<AdminNotice>("notices"),
    getAdminCollection<AdminWork>("works"),
  ]);
  const tutorialArticle = articles.find((article) => article.locale === "zh" && article.slug === tutorialArticleSlug);
  const articleCount = articles.length;
  const noticeCount = notices.length;
  const workCount = works.length;

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">本地管理后台</p>
            <h2>内容控制台</h2>
            <p className="admin-help">这里用于管理网站内容。第一次使用时，请先阅读教学示例，了解每个字段的用途。</p>
          </div>
        </header>
        <section className="admin-guide-card" aria-labelledby="admin-guide-title">
          <div>
            <p className="admin-kicker">后台使用说明 / 教学示例</p>
            <h3 id="admin-guide-title">先看一篇完整示例，再开始编辑正式内容</h3>
            <p>
              文章管理用于新增和编辑公告、案例文章、最近动态；通知管理用于控制访客打开网站时是否显示弹窗通知；作品图片管理用于调整作品图片路径、说明文字、顺序和封面。
            </p>
            <p>不理解的字段请先不要修改。可以先保存为草稿，确认页面显示正常后再切换为发布状态。</p>
          </div>
          {tutorialArticle ? (
            <Link className="admin-button" href={`/studio-tianho/articles/${tutorialArticle.id}`}>
              打开教学示例文章
            </Link>
          ) : (
            <p className="admin-warning">尚未找到教学示例。请先运行本地 seed。</p>
          )}
        </section>
        <div className="admin-grid admin-grid-3">
          <article className="admin-card">
            <p className="admin-label">文章</p>
            <h3>{articleCount}</h3>
            <p className="admin-help">新增或编辑文章，草稿不会作为正式文章显示。</p>
            <Link className="admin-button-secondary" href="/studio-tianho/articles">
              管理文章
            </Link>
          </article>
          <article className="admin-card">
            <p className="admin-label">开场通知</p>
            <h3>{noticeCount}</h3>
            <p className="admin-help">控制网站打开时的临时弹窗通知。</p>
            <Link className="admin-button-secondary" href="/studio-tianho/notice">
              管理通知
            </Link>
          </article>
          <article className="admin-card">
            <p className="admin-label">作品</p>
            <h3>{workCount}</h3>
            <p className="admin-help">调整已有作品的图片路径、封面和说明文字。</p>
            <Link className="admin-button-secondary" href="/studio-tianho/works">
              管理图片
            </Link>
          </article>
        </div>
      </section>
    </AdminShell>
  );
}
