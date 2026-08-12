import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { summarizeAdministrationTasks } from "@/lib/admin/dashboard";
import { tutorialArticleSlug } from "@/lib/admin/labels";
import { getAdminCollection, getInquiries, type AdminArticle, type AdminNotice, type AdminWork } from "@/lib/api/admin";

export default async function AdminDashboardPage() {
  const [articles, notices, works, inquiries] = await Promise.all([
    getAdminCollection<AdminArticle>("articles"),
    getAdminCollection<AdminNotice>("notices"),
    getAdminCollection<AdminWork>("works"),
    getInquiries("NEW"),
  ]);
  const tutorialArticle = articles.find((article) => article.locale === "zh" && article.slug === tutorialArticleSlug);
  const summary = summarizeAdministrationTasks(articles, notices, works, inquiries);

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
        <section className="admin-dashboard-section" aria-labelledby="admin-tasks-title">
          <div className="admin-section-heading">
            <div>
              <p className="admin-kicker">需要处理</p>
              <h3 id="admin-tasks-title">管理待办</h3>
            </div>
            <p className="admin-help">先处理新咨询和未完成内容，再检查当前公开状态。</p>
          </div>
          <div className="admin-task-list">
            <Link className="admin-task-row" href="/studio-tianho/inquiries?status=NEW">
              <span><strong>{summary.newInquiries}</strong> 条新咨询</span>
              <small>{summary.newInquiries > 0 ? "建议优先回复" : "目前没有待回复咨询"}</small>
            </Link>
            <Link className="admin-task-row" href="/studio-tianho/articles">
              <span><strong>{summary.draftArticles}</strong> 篇草稿</span>
              <small>{summary.publishedArticles} 篇文章正在公开展示</small>
            </Link>
            <Link className="admin-task-row" href="/studio-tianho/works">
              <span><strong>{summary.worksNeedingImages}</strong> 个作品需要检查图片</span>
              <small>包括未设置图片或未指定封面的相册</small>
            </Link>
          </div>
        </section>

        <section className="admin-dashboard-section" aria-labelledby="admin-status-title">
          <div className="admin-section-heading">
            <div>
              <p className="admin-kicker">当前状态</p>
              <h3 id="admin-status-title">网站内容概况</h3>
            </div>
          </div>
          <div className="admin-overview-grid">
            <Link href="/studio-tianho/articles">
              <strong>{articles.length}</strong>
              <span>全部文章</span>
            </Link>
            <Link href="/studio-tianho/notice">
              <strong>{summary.visibleNotices}</strong>
              <span>当前可见通知</span>
            </Link>
            <Link href="/studio-tianho/works">
              <strong>{works.length}</strong>
              <span>全部作品</span>
            </Link>
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
