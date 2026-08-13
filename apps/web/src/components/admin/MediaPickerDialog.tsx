"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { uploadAdminMedia } from "@/lib/api/browser";
import type { MediaAsset } from "@/lib/api/admin";

export function MediaPickerDialog({ onClose, onSelect }: { onClose: () => void; onSelect: (asset: MediaAsset) => void }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/admin/media?status=ACTIVE", { credentials: "same-origin", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("media request failed");
        setAssets(await response.json() as MediaAsset[]);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
      });
    return () => controller.abort();
  }, []);

  const filteredAssets = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return term ? assets.filter((asset) => asset.originalFilename.toLocaleLowerCase().includes(term)) : assets;
  }, [assets, query]);

  async function upload() {
    if (!uploadFile) return;

    setUploading(true);
    setUploadMessage("");
    try {
      const result = await uploadAdminMedia(uploadFile);
      if (result.validationMessage) {
        setUploadMessage(result.validationMessage);
        return;
      }
      if (!result.response?.ok) {
        const problem = await result.response?.json().catch(() => null) as { detail?: string } | null;
        setUploadMessage(problem?.detail || "上传失败，请检查图片格式、大小和服务连接。可以直接重试。");
        return;
      }

      const asset = await result.response.json() as MediaAsset;
      setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
      onSelect(asset);
    } catch {
      setUploadMessage("上传结果无法读取，请重新打开媒体库确认后再试。");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-picker-backdrop" role="dialog" aria-label="从媒体库选择图片" aria-modal="true">
      <section className="admin-picker-panel">
        <header className="admin-picker-header">
          <div><p className="admin-kicker">媒体库</p><h3>选择图片</h3></div>
          <button className="admin-button-secondary" onClick={onClose} type="button">取消</button>
        </header>
        <label className="admin-field">
          <span className="admin-label">搜索文件名</span>
          <input autoFocus onChange={(event) => setQuery(event.target.value)} placeholder="输入图片文件名" value={query} />
        </label>
        <div className="admin-picker-upload">
          <div>
            <strong>直接上传并使用</strong>
            <small>仅 JPEG/PNG，最大 15 MB；系统仍会在服务端检查真实图片内容和像素。</small>
          </div>
          <input
            accept="image/jpeg,image/png"
            aria-label="选择要上传的图片"
            onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
            type="file"
          />
          <button className="admin-button" disabled={uploading || !uploadFile} onClick={upload} type="button">{uploading ? "上传中…" : "上传并使用"}</button>
          {uploadMessage ? <p className="admin-error" role="alert">{uploadMessage}</p> : null}
        </div>
        {state === "loading" ? <p className="admin-empty" role="status">正在读取媒体库…</p> : null}
        {state === "error" ? <p className="admin-error" role="alert">无法读取媒体库，请确认服务已启动后重试。</p> : null}
        {state === "ready" && filteredAssets.length === 0 ? <p className="admin-empty">没有符合条件的可用图片。</p> : null}
        <div className="admin-picker-grid">
          {filteredAssets.map((asset) => (
            <button className="admin-picker-item" key={asset.id} onClick={() => onSelect(asset)} type="button">
              <Image alt="" height={150} src={asset.thumbnailUrl} width={200} />
              <strong>{asset.originalFilename}</strong>
              <small>{asset.width} × {asset.height}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
