import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { blankArticleFormValues } from "@/lib/admin/article-form";

export default function NewAdminArticlePage() {
  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">Articles</p>
            <h2>New article</h2>
          </div>
        </header>
        <AdminArticleForm defaultValues={blankArticleFormValues()} />
      </section>
    </AdminShell>
  );
}
