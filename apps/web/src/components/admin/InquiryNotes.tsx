"use client";

import { useState } from "react";
import { AdminActionFeedback, useAdministrationAction } from "@/components/admin/AdminActionFeedback";
import { adminResponseMessage, writeAdminApi } from "@/lib/api/browser";

type InquiryNote = {
  id: string;
  body: string;
  actorDisplayName: string;
  createdAt: string;
};

export function InquiryNotes({ inquiryId, disabled = false }: { inquiryId: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<InquiryNote[]>([]);
  const [body, setBody] = useState("");
  const { feedback, pending, run, showError, showSuccess } = useAdministrationAction();

  async function toggle() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (!nextOpen || loaded || loading) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/inquiries/${inquiryId}/notes`, { credentials: "same-origin" });
      if (!response.ok) {
        showError(adminResponseMessage(response, "无法读取处理记录，请稍后重试。"));
        return;
      }
      setNotes(await response.json() as InquiryNote[]);
      setLoaded(true);
    } catch {
      showError("暂时无法连接服务。请检查网络后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function addNote(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    await run(async () => {
      const response = await writeAdminApi(`/api/v1/admin/inquiries/${inquiryId}/notes`, "POST", { body: trimmed });
      if (!response.ok) {
        showError(adminResponseMessage(response, "无法保存处理记录，请稍后重试。"));
        return;
      }
      const note = await response.json() as InquiryNote;
      setNotes((current) => [note, ...current]);
      setBody("");
      setLoaded(true);
      showSuccess("处理记录已保存。");
    });
  }

  return (
    <section className="admin-inquiry-notes">
      <button aria-expanded={open} className="admin-button-secondary" onClick={toggle} type="button">
        {open ? "收起处理记录" : "查看处理记录"}
      </button>
      {open ? (
        <div className="admin-inquiry-notes-panel">
          {loading ? <p className="admin-help" role="status">正在读取处理记录…</p> : null}
          {!loading && loaded && notes.length === 0 ? <p className="admin-empty">还没有处理记录。</p> : null}
          {notes.length > 0 ? (
            <ol className="admin-inquiry-note-list">
              {notes.map((note) => (
                <li key={note.id}>
                  <p>{note.body}</p>
                  <small>{note.actorDisplayName} · {new Date(note.createdAt).toLocaleString("zh-CN")}</small>
                </li>
              ))}
            </ol>
          ) : null}
          {!disabled ? (
            <form className="admin-inquiry-note-form" onSubmit={addNote}>
              <label className="admin-field">
                <span className="admin-label">新增处理记录</span>
                <textarea maxLength={2000} onChange={(event) => setBody(event.target.value)} placeholder="例如：已回复邮件，等待客户确认日期" value={body} />
                <span className="admin-help">只记录工作进度，不要重复抄写客户的敏感资料。</span>
              </label>
              <div className="admin-actions">
                <button className="admin-button" disabled={pending || !body.trim()} type="submit">{pending ? "保存中" : "保存记录"}</button>
                <AdminActionFeedback feedback={feedback} />
              </div>
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
