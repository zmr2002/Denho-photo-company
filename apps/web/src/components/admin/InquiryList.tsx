"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { writeAdminApi } from "@/lib/api/browser";
import type { Inquiry } from "@/lib/api/admin";

const actions: Array<{ status: Inquiry["status"]; label: string }> = [
  { status: "IN_PROGRESS", label: "开始处理" },
  { status: "CLOSED", label: "标记完成" },
  { status: "SPAM", label: "标记垃圾咨询" },
];

export function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function changeStatus(inquiry: Inquiry, status: Inquiry["status"]) {
    setPendingId(inquiry.id);
    setMessage("");
    const response = await writeAdminApi(`/api/v1/admin/inquiries/${inquiry.id}/status`, "PATCH", { status });
    setPendingId(null);
    if (!response.ok) {
      const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
      setMessage(problem?.detail || "状态更新失败，请稍后重试。");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-list">
      {message ? <p className="admin-error" role="status">{message}</p> : null}
      {inquiries.length === 0 ? <p className="admin-empty">当前分类没有咨询。</p> : null}
      {inquiries.map((inquiry) => (
        <article className="admin-card admin-inquiry" key={inquiry.id}>
          <header>
            <div>
              <p className="admin-label">{statusLabel(inquiry.status)} / {localeLabel(inquiry.locale)}</p>
              <h3>{inquiry.nameCompany}</h3>
              <p className="admin-help">{new Date(inquiry.createdAt).toLocaleString("zh-CN")} · {inquiry.projectType}</p>
            </div>
            <a className="admin-button-secondary" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
          </header>
          <dl className="admin-inquiry-details">
            <div><dt>期望日期</dt><dd>{inquiry.requestedDate || "未填写"}</dd></div>
            <div><dt>拍摄地点</dt><dd>{inquiry.location || "未填写"}</dd></div>
          </dl>
          <p className="admin-inquiry-message">{inquiry.message}</p>
          {inquiry.status !== "ANONYMIZED" ? (
            <div className="admin-actions">
              {actions.filter((action) => action.status !== inquiry.status).map((action) => (
                <button
                  className="admin-button-secondary"
                  disabled={pendingId === inquiry.id}
                  key={action.status}
                  onClick={() => changeStatus(inquiry, action.status)}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function statusLabel(status: Inquiry["status"]) {
  return ({ NEW: "新咨询", IN_PROGRESS: "处理中", CLOSED: "已完成", SPAM: "垃圾咨询", ANONYMIZED: "已匿名化" })[status];
}

function localeLabel(locale: string) {
  return ({ ja: "日语", zh: "中文", en: "英语" } as Record<string, string>)[locale] || locale;
}
