"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SiteNotice } from "@/lib/content";

interface SiteOpeningNoticeProps {
  notice?: SiteNotice;
}

export function SiteOpeningNotice({ notice }: SiteOpeningNoticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const portalRoot = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!notice) return;

    const storage = notice.dismissalMode === "local" ? window.localStorage : window.sessionStorage;
    const wasDismissed = storage.getItem(notice.storageKey) === "dismissed";

    if (wasDismissed) return;

    const frameId = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [notice]);

  const dismissNotice = useCallback(() => {
    if (notice) {
      const storage = notice.dismissalMode === "local" ? window.localStorage : window.sessionStorage;
      storage.setItem(notice.storageKey, "dismissed");
    }

    setIsVisible(false);
  }, [notice]);

  useEffect(() => {
    if (!isVisible) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissNotice();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissNotice, isVisible]);

  if (!notice || !isVisible || !portalRoot) return null;

  return createPortal(
    <div className="site-notice-backdrop" role="presentation" onClick={dismissNotice}>
      <section
        className="site-opening-notice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-opening-notice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <p className="site-opening-notice-label">{notice.label}</p>
          <h2 id="site-opening-notice-title">{notice.title}</h2>
          <p>{notice.body}</p>
        </div>
        <button
          ref={closeButtonRef}
          className="site-opening-notice-dismiss"
          type="button"
          onClick={dismissNotice}
        >
          {notice.dismissLabel}
        </button>
      </section>
    </div>,
    portalRoot,
  );
}
