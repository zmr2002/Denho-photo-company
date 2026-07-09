import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { blankArticleFormValues } from "@/lib/admin/article-form";

export default function NewAdminArticlePage() {
  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">文章</p>
            <h2>新增文章</h2>
            <p className="admin-help">建议先保存为草稿。确认内容和页面显示正常后，再改为已发布。</p>
          </div>
        </header>
        <AdminArticleForm defaultValues={blankArticleFormValues()} />
      </section>
    </AdminShell>
  );
}
