"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { noticeMutationSchema } from "@/lib/admin/validation";
import { useUnsavedChanges } from "@/lib/admin/useUnsavedChanges";
import { adminResponseMessage, writeAdminApi } from "@/lib/api/browser";
import { siteDateInputToTimestamp } from "@/lib/site-date";

export type AdminNoticeFormValues = z.input<typeof noticeMutationSchema>;

function localeLabel(locale: AdminNoticeFormValues["locale"]) {
  if (locale === "ja") return "日语页面（ja）";
  if (locale === "zh") return "中文页面（zh）";
  return "英语页面（en）";
}

export function AdminNoticeForm({ defaultValues, contentVersion = 0 }: { defaultValues: AdminNoticeFormValues; contentVersion?: number }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [version, setVersion] = useState(contentVersion);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AdminNoticeFormValues>({
    resolver: zodResolver(noticeMutationSchema),
    defaultValues,
  });
  useUnsavedChanges(isDirty);

  async function onSubmit(values: AdminNoticeFormValues) {
    setSubmitting(true);
    setMessage("");

    const response = await writeAdminApi("/api/v1/admin/notices", "PATCH", {
      ...values,
      startAt: siteDateInputToTimestamp(values.startAt),
      endAt: siteDateInputToTimestamp(values.endAt),
      expectedVersion: version,
    });

    setSubmitting(false);

    if (!response.ok) {
      setMessage(adminResponseMessage(response, "保存失败，请稍后重试。"));
      return;
    }

    const result = (await response.json()) as { id: string; version: number; status: string };
    setVersion(result.version);
    if (values.status === "published" && result.status === "DRAFT") {
      const publishResponse = await writeAdminApi(`/api/v1/admin/notices/${result.id}/publish`, "POST", { expectedVersion: result.version });
      if (!publishResponse.ok) {
        setMessage(adminResponseMessage(publishResponse, "通知已保存为草稿，但无法发布当前版本。"));
        router.refresh();
        return;
      }
      const published = (await publishResponse.json()) as { version: number };
      setVersion(published.version);
    }
    if (values.status === "draft" && result.status === "PUBLISHED") {
      const unpublishResponse = await writeAdminApi(`/api/v1/admin/notices/${result.id}/unpublish`, "POST", { expectedVersion: result.version });
      if (!unpublishResponse.ok) {
        setMessage(adminResponseMessage(unpublishResponse, "通知已保存，但无法撤下当前发布版本。"));
        router.refresh();
        return;
      }
      const unpublished = (await unpublishResponse.json()) as { version: number };
      setVersion(unpublished.version);
    }
    reset(values);
    setMessage("已保存。");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">语言</span>
          <strong>{localeLabel(defaultValues.locale)}</strong>
          <input type="hidden" {...register("locale")} />
          <span className="admin-help">语言由当前卡片确定，避免误改其他语言通知。</span>
        </label>
        <label className="admin-field">
          <span className="admin-label">状态</span>
          <select {...register("status")}>
            <option value="draft">草稿（不会显示）</option>
            <option value="published">已发布（允许显示）</option>
          </select>
          <span className="admin-help">需要临时关闭时，可以改为草稿或取消启用。</span>
        </label>
        <label className="admin-field admin-check-field">
          <span className="admin-label">启用</span>
          <input type="checkbox" {...register("enabled")} />
          <span className="admin-help">勾选后，符合日期范围的访客会看到弹窗。</span>
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">标签</span>
          <input {...register("label")} />
          <span className="admin-help">通知的小分类文字，例如：公告、休假通知。</span>
        </label>
        <label className="admin-field">
          <span className="admin-label">关闭按钮文字</span>
          <input {...register("dismissLabel")} />
          <span className="admin-help">访客关闭弹窗时看到的按钮文字。</span>
        </label>
        <label className="admin-field">
          <span className="admin-label">关闭记忆方式</span>
          <select {...register("dismissalMode")}>
            <option value="session">本次浏览</option>
            <option value="local">本地保存</option>
          </select>
          <span className="admin-help">本次浏览表示重新打开浏览器后可能再显示；本地保存表示同一设备会记住更久。</span>
        </label>
      </div>

      <label className="admin-field">
        <span className="admin-label">标题</span>
        <input {...register("title")} />
        <span className="admin-help">通知最醒目的标题，请保持简短。</span>
        {errors.title ? <span className="admin-error">{errors.title.message}</span> : null}
      </label>

      <label className="admin-field">
        <span className="admin-label">正文</span>
        <textarea {...register("body")} />
        <span className="admin-help">说明通知内容，适合临时公告、休假通知或活动提醒。</span>
        {errors.body ? <span className="admin-error">{errors.body.message}</span> : null}
      </label>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">链接文字</span>
          <input {...register("linkLabel")} />
          <span className="admin-help">如果通知需要跳转，再填写按钮文字。</span>
        </label>
        <label className="admin-field">
          <span className="admin-label">链接地址</span>
          <input {...register("linkHref")} />
          <span className="admin-help">可以留空。填写时请使用完整网址或站内路径。</span>
        </label>
        <label className="admin-field">
          <span className="admin-label">记忆键名</span>
          <input {...register("storageKey")} />
          <span className="admin-help">用于记住访客是否关闭过通知。一般不要修改。</span>
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">开始日期</span>
          <input type="date" {...register("startAt")} />
          <span className="admin-help">留空表示不限制开始时间。</span>
        </label>
        <label className="admin-field">
          <span className="admin-label">结束日期</span>
          <input type="date" {...register("endAt")} />
          <span className="admin-help">留空表示不设置自动结束。</span>
        </label>
      </div>

      <div className="admin-actions">
        <button className="admin-button" disabled={submitting} type="submit">
          {submitting ? "保存中" : "保存通知"}
        </button>
        {message ? <p className="admin-user">{message}</p> : null}
      </div>
    </form>
  );
}
