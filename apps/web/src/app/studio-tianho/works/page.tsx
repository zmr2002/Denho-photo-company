import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { localeLabel, mediaTypeLabel, statusLabel } from "@/lib/admin/labels";
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
            <p className="admin-kicker">作品</p>
            <h2>作品图片管理</h2>
            <p className="admin-help">这里调整已有作品的图片路径、说明文字、显示顺序和封面。不负责上传新图片。</p>
          </div>
        </header>
        <div className="admin-info-box">
          <strong>图片管理提示</strong>
          <p>图片路径当前填写已有图片路径；排序数字越小越靠前；封面图片会优先作为该作品的代表图；视频类型作品不会作为图片相册打开。</p>
        </div>
        <div className="admin-list">
          {works.length === 0 ? <p className="admin-empty">还没有作品记录。作品基础资料目前由本地数据准备。</p> : null}
          {works.map((work) => (
            <article className="admin-list-row" key={work.id}>
              <div>
                <p className="admin-label">
                  {localeLabel(work.locale)} / {statusLabel(work.status)} / {mediaTypeLabel(work.mediaType)} / {work.galleryEnabled ? "图片相册已启用" : "图片相册未启用"}
                </p>
                <h3>{work.title}</h3>
                <p>
                  {work.slug} / {work.images.length} 条图片资料
                </p>
              </div>
              <Link className="admin-button-secondary" href={`/studio-tianho/works/${work.id}/images`}>
                管理图片
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
