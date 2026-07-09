import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminWorkImagesForm } from "@/components/admin/AdminWorkImagesForm";
import { workToImageFormValues } from "@/lib/admin/work-images-form";
import { prisma } from "@/lib/db/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminWorkImagesPage({ params }: PageProps) {
  const { id } = await params;
  const work = await prisma.work.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!work) notFound();

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">
              {work.locale} / {work.mediaType}
            </p>
            <h2>{work.title}</h2>
          </div>
        </header>
        <AdminWorkImagesForm workId={work.id} defaultValues={workToImageFormValues(work)} />
      </section>
    </AdminShell>
  );
}
