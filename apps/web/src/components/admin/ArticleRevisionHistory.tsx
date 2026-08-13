"use client";

import { useState } from "react";
import { UnsavedArticlePreview } from "@/components/admin/UnsavedArticlePreview";
import { articleToFormValues } from "@/lib/admin/article-form";
import type { AdminRevision } from "@/lib/api/admin";

const actionLabels: Record<string, string> = {
  CREATED: "创建内容",
  UPDATED: "保存修改",
  PUBLISHED: "发布",
  UNPUBLISHED: "撤下",
  ARCHIVED: "归档",
  RESTORED: "恢复为草稿",
};

type ArticleRevisionHistoryProps = {
  revisions: AdminRevision[];
  onLoadRevision: (revision: AdminRevision) => void;
};

export function ArticleRevisionHistory({ revisions, onLoadRevision }: ArticleRevisionHistoryProps) {
  const [previewRevision, setPreviewRevision] = useState<AdminRevision | null>(null);

  return (
    <>
      <details className="admin-revision-history">
        <summary>
          <span><strong>修改记录</strong><small>共 {revisions.length} 个版本，可预览或载入后重新保存</small></span>
        </summary>
        <div className="admin-revision-list">
          {revisions.length === 0 ? <p className="admin-empty">尚无修改记录。</p> : null}
          {revisions.map((revision) => (
            <article key={revision.id}>
              <span className="admin-content-state">版本 {revision.version}</span>
              <div><strong>{actionLabels[revision.action] || revision.action}</strong><small>{new Date(revision.createdAt).toLocaleString("zh-CN")}</small></div>
              <div className="admin-revision-actions">
                <button className="admin-button-secondary" onClick={() => setPreviewRevision(revision)} type="button">预览版本</button>
                <button className="admin-button-secondary" onClick={() => onLoadRevision(revision)} type="button">载入此版本</button>
              </div>
            </article>
          ))}
        </div>
      </details>
      {previewRevision ? (
        <UnsavedArticlePreview
          ariaLabel={`历史版本 ${previewRevision.version} 预览`}
          closeLabel="返回修改记录"
          description={`显示版本 ${previewRevision.version} 保存时的内容，页面样式与访客文章页相同。`}
          onClose={() => setPreviewRevision(null)}
          title={`历史版本 ${previewRevision.version} 预览`}
          values={articleToFormValues(previewRevision.snapshot)}
        />
      ) : null}
    </>
  );
}
