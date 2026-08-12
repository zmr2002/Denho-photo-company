"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminActionFeedback, useAdministrationAction } from "@/components/admin/AdminActionFeedback";
import { InquiryNotes } from "@/components/admin/InquiryNotes";
import { adminResponseMessage, writeAdminApi } from "@/lib/api/browser";
import type { Inquiry } from "@/lib/api/admin";

const filters: Array<{ status: Inquiry["status"]; label: string }> = [
  { status: "NEW", label: "新咨询" },
  { status: "IN_PROGRESS", label: "处理中" },
  { status: "CLOSED", label: "已完成" },
  { status: "SPAM", label: "垃圾咨询" },
  { status: "ANONYMIZED", label: "已匿名化" },
];

export function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
  const router = useRouter();
  const [items, setItems] = useState(inquiries);
  const [activeStatus, setActiveStatus] = useState<Inquiry["status"]>("NEW");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { feedback, run, showError, showSuccess } = useAdministrationAction();
  const counts = useMemo(() => Object.fromEntries(filters.map(({ status }) => [status, items.filter((item) => item.status === status).length])), [items]);
  const visibleInquiries = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return items.filter((inquiry) => inquiry.status === activeStatus && (!term || [
      inquiry.nameCompany,
      inquiry.email,
      inquiry.projectType,
      inquiry.location,
      inquiry.message,
    ].some((value) => value?.toLocaleLowerCase().includes(term))));
  }, [activeStatus, items, query]);

  async function changeStatus(inquiry: Inquiry, status: Inquiry["status"]) {
    await run(async () => {
      setPendingId(inquiry.id);
      const response = await writeAdminApi(`/api/v1/admin/inquiries/${inquiry.id}/status`, "PATCH", { status });
      setPendingId(null);
      if (!response.ok) {
        showError(adminResponseMessage(response, "状态更新失败，请稍后重试。"));
        return;
      }
      const updated = await response.json() as Inquiry;
      setItems((current) => current.map((item) => item.id === inquiry.id ? updated : item));
      showSuccess(`已将咨询更新为“${statusLabel(status)}”。`);
      router.refresh();
    });
  }

  return (
    <div className="admin-worklist">
      <div className="admin-inquiry-toolbar">
        <div className="admin-language-tabs" role="group" aria-label="咨询状态">
          {filters.map((filter) => (
            <button
              aria-pressed={activeStatus === filter.status}
              className="admin-language-tab"
              key={filter.status}
              onClick={() => setActiveStatus(filter.status)}
              type="button"
            >
              {filter.label} <span>{counts[filter.status] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="admin-field">
          <span className="admin-label">搜索当前分类</span>
          <input onChange={(event) => setQuery(event.target.value)} placeholder="姓名、邮箱、项目、地点或正文" type="search" value={query} />
        </label>
        <div className="admin-card-heading">
          <p className="admin-worklist-count">显示 {visibleInquiries.length} 条咨询</p>
          <AdminActionFeedback feedback={feedback} />
        </div>
      </div>
      {visibleInquiries.length === 0 ? <p className="admin-empty">当前分类没有符合条件的咨询。</p> : null}
      {visibleInquiries.map((inquiry) => (
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
          <InquiryNotes disabled={inquiry.status === "ANONYMIZED"} inquiryId={inquiry.id} />
          {inquiry.status !== "ANONYMIZED" ? (
            <div className="admin-actions">
              {actionsFor(inquiry.status).map((action) => (
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

function actionsFor(status: Inquiry["status"]): Array<{ status: Inquiry["status"]; label: string }> {
  if (status === "NEW") return [{ status: "IN_PROGRESS", label: "开始处理" }, { status: "SPAM", label: "标记为垃圾咨询" }];
  if (status === "IN_PROGRESS") return [{ status: "CLOSED", label: "标记完成" }, { status: "NEW", label: "退回新咨询" }, { status: "SPAM", label: "标记为垃圾咨询" }];
  if (status === "CLOSED") return [{ status: "IN_PROGRESS", label: "重新处理" }];
  if (status === "SPAM") return [{ status: "NEW", label: "恢复为新咨询" }];
  return [];
}

function statusLabel(status: Inquiry["status"]) {
  return ({ NEW: "新咨询", IN_PROGRESS: "处理中", CLOSED: "已完成", SPAM: "垃圾咨询", ANONYMIZED: "已匿名化" })[status];
}

function localeLabel(locale: string) {
  return ({ ja: "日语", zh: "中文", en: "英语" } as Record<string, string>)[locale] || locale;
}
