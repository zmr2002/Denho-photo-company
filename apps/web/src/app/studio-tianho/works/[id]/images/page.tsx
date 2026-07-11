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
            <p className="admin-help">修改图片路径、替代文字、图片说明、封面和排序。当前阶段不上传新图片。</p>
          </div>
        </header>
        <div className="admin-info-box">
          <strong>作品图片填写说明</strong>
          <p>图片路径：当前阶段填写已有图片路径。排序数字越小越靠前。封面图片会优先作为该作品的代表图。视频类型作品不会作为图片相册打开。</p>
        </div>
        <AdminWorkImagesForm workId={work.id} contentVersion={work.version} defaultValues={workToImageFormValues(work)} />
      </section>
    </AdminShell>
  );
}
