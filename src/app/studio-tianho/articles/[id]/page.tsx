import { notFound } from "next/navigation";
import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { articleToFormValues } from "@/lib/admin/article-form";
import { prisma } from "@/lib/db/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });

  if (!article) notFound();

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">Articles</p>
            <h2>Edit article</h2>
          </div>
        </header>
        <AdminArticleForm articleId={article.id} defaultValues={articleToFormValues(article)} />
      </section>
    </AdminShell>
  );
}
