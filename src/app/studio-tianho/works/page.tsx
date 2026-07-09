import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db/prisma";

export default async function AdminWorksPage() {
  const works = await prisma.work.findMany({
    include: { images: true },
    orderBy: [{ locale: "asc" }, { featuredOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">Works</p>
            <h2>Image metadata</h2>
          </div>
        </header>
        <div className="admin-list">
          {works.map((work) => (
            <article className="admin-list-row" key={work.id}>
              <div>
                <p className="admin-label">
                  {work.locale} / {work.mediaType} / {work.galleryEnabled ? "gallery enabled" : "gallery off"}
                </p>
                <h3>{work.title}</h3>
                <p>
                  {work.slug} / {work.images.length} image rows
                </p>
              </div>
              <Link className="admin-button-secondary" href={`/studio-tianho/works/${work.id}/images`}>
                Manage images
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
