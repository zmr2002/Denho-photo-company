import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { blankArticleFormValues } from "@/lib/admin/article-form";
import { requireAdminSession } from "@/lib/auth/session";

export default async function NewAdminArticlePage() {
  const session = await requireAdminSession();
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
        <AdminArticleForm
          canManagePublication={session.role === "ADMIN"}
          defaultValues={blankArticleFormValues()}
        />
      </section>
    </AdminShell>
  );
}
