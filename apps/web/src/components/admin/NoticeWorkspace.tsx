"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminNoticeForm, type AdminNoticeFormValues } from "@/components/admin/AdminNoticeForm";
import { localeLabel } from "@/lib/admin/labels";

type NoticeWorkspaceEntry = {
  locale: "ja" | "zh" | "en";
  noticeId: string | null;
  version: number;
  visitorState: string;
  defaultValues: AdminNoticeFormValues;
};

export function NoticeWorkspace({ entries }: { entries: NoticeWorkspaceEntry[] }) {
  const [activeLocale, setActiveLocale] = useState(entries[0]?.locale ?? "ja");

  return (
    <section className="admin-notice-workspace">
      <div className="admin-language-tabs" role="tablist" aria-label="通知语言">
        {entries.map((entry) => (
          <button
            aria-controls={`notice-panel-${entry.locale}`}
            aria-selected={activeLocale === entry.locale}
            className="admin-language-tab"
            id={`notice-tab-${entry.locale}`}
            key={entry.locale}
            onClick={() => setActiveLocale(entry.locale)}
            role="tab"
            type="button"
          >
            {localeLabel(entry.locale)}
          </button>
        ))}
      </div>

      {entries.map((entry) => (
        <article
          aria-labelledby={`notice-tab-${entry.locale}`}
          className="admin-card admin-notice-panel"
          hidden={activeLocale !== entry.locale}
          id={`notice-panel-${entry.locale}`}
          key={entry.locale}
          role="tabpanel"
        >
          <div className="admin-card-heading">
            <div>
              <p className="admin-label">{localeLabel(entry.locale)}</p>
              <p className="admin-notice-visibility" data-visible={entry.visitorState === "当前访客可以看到"}>
                {entry.visitorState}
              </p>
            </div>
            {entry.noticeId ? (
              <Link className="admin-button-secondary" href={`/studio-tianho/preview/notices/${entry.locale}/`} target="_blank">
                打开真实首页预览
              </Link>
            ) : (
              <span className="admin-help">首次保存后可预览</span>
            )}
          </div>
          <AdminNoticeForm contentVersion={entry.version} defaultValues={entry.defaultValues} />
        </article>
      ))}
    </section>
  );
}
