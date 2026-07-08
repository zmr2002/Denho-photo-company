"use client";

import { useEffect, useState } from "react";
import type { HomeNewsItem } from "@/data/home";

interface NewsNoticeViewerProps {
  items: HomeNewsItem[];
}

export function NewsNoticeViewer({ items }: NewsNoticeViewerProps) {
  const [selected, setSelected] = useState<HomeNewsItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected]);

  return (
    <div className="border-t border-stone-400">
      {items.map((item) => (
        <button
          className="news-row news-row-button"
          key={`${item.date}-${item.title}`}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={selected === item}
          onClick={() => setSelected(item)}
        >
          <div className="news-meta">
            <time>{item.date}</time>
            <span>{item.category}</span>
          </div>
          <div>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
          </div>
          <span className="news-arrow" aria-hidden="true">
            -&gt;
          </span>
        </button>
      ))}

      {selected ? (
        <div
          className="news-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="news-detail-title"
          onClick={() => setSelected(null)}
        >
          <div className="news-detail-panel" onClick={(event) => event.stopPropagation()}>
            <div className="news-detail-header">
              <p>{selected.category}</p>
              <button type="button" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <h3 id="news-detail-title">{selected.detailTitle ?? selected.title}</h3>
            <p>{selected.detailBody ?? selected.excerpt}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
