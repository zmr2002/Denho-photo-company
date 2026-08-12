import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminWorkImagesForm } from "@/components/admin/AdminWorkImagesForm";
import { workToImageFormValues } from "@/lib/admin/work-images-form";
import { localeLabel, mediaTypeLabel } from "@/lib/admin/labels";
import { getAdminContent, type AdminWork } from "@/lib/api/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminWorkImagesPage({ params }: PageProps) {
  const { id } = await params;
  const work = await getAdminContent<AdminWork>("works", id);

  if (!work) notFound();

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">
              {localeLabel(work.locale)} / {mediaTypeLabel(work.mediaType)}
            </p>
            <h2>{work.title}</h2>
            <p className="admin-help">从媒体库选择图片，确认缩略图、替代文字、图片说明、封面和展示顺序。</p>
          </div>
        </header>
        <div className="admin-info-box">
          <strong>作品图片填写说明</strong>
          <p>点击“从媒体库添加图片”即可选择已上传素材；使用上移、下移调整访客看到的顺序。每个作品必须指定一张封面图片。</p>
        </div>
        <AdminWorkImagesForm workId={work.id} contentVersion={work.version} defaultValues={workToImageFormValues(work)} />
      </section>
    </AdminShell>
  );
}
