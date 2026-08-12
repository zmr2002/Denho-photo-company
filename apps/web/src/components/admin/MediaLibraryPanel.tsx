"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCsrfHeaders, writeAdminApi } from "@/lib/api/browser";
import type { MediaAsset } from "@/lib/api/admin";

type MediaLibraryPanelProps = {
  activeAssets: MediaAsset[];
  recycledAssets: MediaAsset[];
};

export function MediaLibraryPanel({ activeAssets, recycledAssets }: MediaLibraryPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const csrfHeaders = await getCsrfHeaders();
      if (!csrfHeaders) {
        setMessage("无法取得安全验证信息，请刷新页面。");
        return;
      }
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/v1/admin/media", {
        method: "POST",
        credentials: "same-origin",
        headers: csrfHeaders,
        body,
      });
      if (!response.ok) {
        const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
        setMessage(problem?.detail || "上传失败，请检查图片格式和大小。网络中断时可以直接重试。");
        return;
      }
      form.reset();
      setMessage("图片已上传。");
      router.refresh();
    } catch {
      setMessage("暂时无法连接服务。图片没有上传，请检查网络后重试。");
    } finally {
      setUploading(false);
    }
  }

  async function changeState(asset: MediaAsset, action: "trash" | "restore") {
    setMessage("");
    const response = await writeAdminApi(`/api/v1/admin/media/${asset.id}/${action}`, "POST", {});
    if (!response.ok) {
      const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
      setMessage(problem?.detail || "操作失败。");
      return;
    }
    router.refresh();
  }

  async function copyPath(path: string) {
    try {
      await navigator.clipboard.writeText(path);
      setMessage("主文件路径已复制。");
    } catch {
      setMessage("浏览器未允许复制，请手动选择路径。");
    }
  }

  return (
    <div className="admin-grid">
      <form className="admin-card admin-form" onSubmit={upload}>
        <h3>上传图片</h3>
        <p className="admin-help">仅 JPEG/PNG；最大 15 MB、50 MP。系统会去除照片元数据并生成缩略图。</p>
        <input accept="image/jpeg,image/png" name="file" required type="file" />
        <button className="admin-button" disabled={uploading} type="submit">{uploading ? "上传中" : "上传图片"}</button>
        {message ? <p className="admin-help" role="status">{message}</p> : null}
      </form>

      <section className="admin-card">
        <h3>可用图片（{activeAssets.length}）</h3>
        <div className="admin-list">
          {activeAssets.map((asset) => (
            <article className="admin-list-row" key={asset.id}>
              <Image alt={asset.originalFilename} height={120} src={asset.thumbnailUrl} width={160} />
              <div>
                <strong>{asset.originalFilename}</strong>
                <p className="admin-help">{asset.width} × {asset.height} / {formatBytes(asset.byteSize)} / 引用 {asset.referenceCount}</p>
                <code>{asset.url}</code>
              </div>
              <div>
                <button className="admin-button-secondary" onClick={() => copyPath(asset.url)} type="button">复制路径</button>
                <button className="admin-muted-link" disabled={asset.referenceCount > 0} onClick={() => changeState(asset, "trash")} type="button">移入回收站</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <h3>回收站（{recycledAssets.length}）</h3>
        <div className="admin-list">
          {recycledAssets.map((asset) => (
            <article className="admin-list-row" key={asset.id}>
              <Image alt={asset.originalFilename} height={90} src={asset.thumbnailUrl} width={120} />
              <div><strong>{asset.originalFilename}</strong><p className="admin-help">预计清理：{asset.purgeAfter ? new Date(asset.purgeAfter).toLocaleDateString("zh-CN") : "-"}</p></div>
              <button className="admin-button-secondary" onClick={() => changeState(asset, "restore")} type="button">恢复</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
