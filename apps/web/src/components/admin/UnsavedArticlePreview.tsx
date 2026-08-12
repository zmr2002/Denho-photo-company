"use client";

import { useEffect, useRef } from "react";
import { ArticleDetailPage } from "@/components/pages/ArticleDetailPage";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { articleFormValuesToPreview } from "@/lib/admin/article-preview";
import type { AdminArticleFormValues } from "@/components/admin/AdminArticleForm";

export function UnsavedArticlePreview({ values, onClose }: { values: AdminArticleFormValues; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const article = articleFormValuesToPreview(values);

  useEffect(() => {
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="admin-live-preview" role="dialog" aria-label="当前文章稿预览" aria-modal="true">
      <div className="admin-live-preview-toolbar">
        <div>
          <strong>当前稿预览</strong>
          <span>显示的是表单中尚未保存的内容，页面样式与访客文章页相同。</span>
        </div>
        <button className="admin-button" onClick={onClose} ref={closeButton} type="button">返回编辑</button>
      </div>
      <div className="admin-live-preview-page">
        <div className="site-shell page-theme-works" lang={article.language}>
          <Header currentPath={`/${article.language}/articles/${article.slug}/`} lang={article.language} />
          <main><ArticleDetailPage article={article} /></main>
          <Footer lang={article.language} />
        </div>
      </div>
    </div>
  );
}
