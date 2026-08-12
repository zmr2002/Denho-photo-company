"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { MediaAsset } from "@/lib/api/admin";

export function MediaPickerDialog({ onClose, onSelect }: { onClose: () => void; onSelect: (asset: MediaAsset) => void }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

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
