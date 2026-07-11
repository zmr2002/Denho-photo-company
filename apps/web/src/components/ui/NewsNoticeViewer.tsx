"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { HomeNewsItem } from "@/data/home";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

interface NewsNoticeViewerProps {
  items: HomeNewsItem[];
}

export function NewsNoticeViewer({ items }: NewsNoticeViewerProps) {
  const [selected, setSelected] = useState<HomeNewsItem | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const portalRoot = typeof document === "undefined" ? null : document.body;

  const closeArticle = useCallback(() => {
    setSelected(null);
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!selected) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeArticle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeArticle, selected]);

  return (
    <div className="border-t border-stone-400">
      {items.map((item) => (
        <button
          className="news-row news-row-button"
          key={`${item.date}-${item.title}`}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={selected === item}
          onClick={(event) => {
            lastTriggerRef.current = event.currentTarget;
            setSelected(item);
          }}
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

      {selected && portalRoot
        ? createPortal(
        <div
          className="news-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="news-detail-title"
          onClick={closeArticle}
        >
          <div className="news-detail-panel" onClick={(event) => event.stopPropagation()}>
            <div className="news-detail-header">
              <div className="news-detail-meta">
                <span>{selected.category}</span>
                <time>{selected.date}</time>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeArticle}>
                {selected.closeLabel ?? "Close"}
              </button>
            </div>
            <article className="news-detail-article">
              <h3 id="news-detail-title">{selected.detailTitle ?? selected.title}</h3>
              <p className="news-detail-lead">
                {selected.detailLead ?? selected.excerpt}
              </p>
              {selected.detailImage ? (
                <figure className="news-detail-image">
                  <PlaceholderMedia
                    label={selected.detailImage.label}
                    size="wide"
                    tone={selected.detailImage.tone}
                    src={selected.detailImage.src}
                    alt={selected.detailImage.alt}
                  />
                  {selected.detailImage.caption ? (
                    <figcaption>{selected.detailImage.caption}</figcaption>
                  ) : null}
                </figure>
              ) : null}
              {selected.detailSectionTitle ? <h4>{selected.detailSectionTitle}</h4> : null}
              <div className="news-detail-body">
                {(selected.detailParagraphs ?? [selected.detailBody ?? selected.excerpt]).map(
                  (paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ),
                )}
              </div>
              {selected.detailSections?.map((section) => (
                <section className="news-detail-section" key={section.heading}>
                  <h4>{section.heading}</h4>
                  <div className="news-detail-body">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.image ? (
                    <figure className="news-detail-image news-detail-image-inline">
                      <PlaceholderMedia label={section.image.label} size="wide" tone={section.image.tone} />
                      {section.image.caption ? <figcaption>{section.image.caption}</figcaption> : null}
                    </figure>
                  ) : null}
                </section>
              ))}
              {selected.detailClosing ? (
                <p className="news-detail-closing">{selected.detailClosing}</p>
              ) : null}
            </article>
          </div>
        </div>,
          portalRoot,
        )
        : null}
    </div>
  );
}
