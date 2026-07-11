import { AdminShell } from "@/components/admin/AdminShell";
import { MediaLibraryPanel } from "@/components/admin/MediaLibraryPanel";
import { getMediaAssets } from "@/lib/api/admin";

export default async function AdminMediaPage() {
  const [activeAssets, recycledAssets] = await Promise.all([
    getMediaAssets("ACTIVE"),
    getMediaAssets("TRASHED"),
  ]);

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">媒体</p>
            <h2>媒体库</h2>
            <p className="admin-help">上传 JPEG 或 PNG 图片，复制主文件路径后粘贴到文章或作品图片字段。</p>
          </div>
        </header>
        <MediaLibraryPanel activeAssets={activeAssets} recycledAssets={recycledAssets} />
      </section>
    </AdminShell>
  );
}
