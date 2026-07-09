"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { noticeMutationSchema } from "@/lib/admin/validation";

export type AdminNoticeFormValues = z.input<typeof noticeMutationSchema>;

export function AdminNoticeForm({ defaultValues }: { defaultValues: AdminNoticeFormValues }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminNoticeFormValues>({
    resolver: zodResolver(noticeMutationSchema),
    defaultValues,
  });

  async function onSubmit(values: AdminNoticeFormValues) {
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/admin/notice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSubmitting(false);

    if (!response.ok) {
      setMessage("Save failed. Check the fields and try again.");
      return;
    }

    setMessage("Saved.");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Locale</span>
          <select {...register("locale")}>
            <option value="ja">Japanese</option>
            <option value="zh">Simplified Chinese</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="admin-field">
          <span className="admin-label">Status</span>
          <select {...register("status")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="admin-field admin-check-field">
          <span className="admin-label">Enabled</span>
          <input type="checkbox" {...register("enabled")} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Label</span>
          <input {...register("label")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">Dismiss label</span>
          <input {...register("dismissLabel")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">Dismissal mode</span>
          <select {...register("dismissalMode")}>
            <option value="session">Session</option>
            <option value="local">Local</option>
          </select>
        </label>
      </div>

      <label className="admin-field">
        <span className="admin-label">Title</span>
        <input {...register("title")} />
        {errors.title ? <span className="admin-error">{errors.title.message}</span> : null}
      </label>

      <label className="admin-field">
        <span className="admin-label">Body</span>
        <textarea {...register("body")} />
        {errors.body ? <span className="admin-error">{errors.body.message}</span> : null}
      </label>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Link label</span>
          <input {...register("linkLabel")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">Link href</span>
          <input {...register("linkHref")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">Storage key</span>
          <input {...register("storageKey")} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Start date</span>
          <input type="date" {...register("startAt")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">End date</span>
          <input type="date" {...register("endAt")} />
        </label>
      </div>

      <div className="admin-actions">
        <button className="admin-button" disabled={submitting} type="submit">
          {submitting ? "Saving" : "Save notice"}
        </button>
        {message ? <p className="admin-user">{message}</p> : null}
      </div>
    </form>
  );
}
