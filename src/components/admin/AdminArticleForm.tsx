"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { articleMutationSchema } from "@/lib/admin/validation";

const articleFormSchema = articleMutationSchema.omit({ relatedServices: true }).extend({
  relatedServicesText: z.string().optional(),
});

export type AdminArticleFormValues = z.input<typeof articleFormSchema>;

type AdminArticleFormProps = {
  articleId?: string;
  defaultValues: AdminArticleFormValues;
};

export function AdminArticleForm({ articleId, defaultValues }: AdminArticleFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues,
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "blocks" });

  async function onSubmit(values: AdminArticleFormValues) {
    setSubmitting(true);
    setMessage("");

    const payload = {
      ...values,
      relatedServices: splitLines(values.relatedServicesText),
      blocks: values.blocks.map((block, index) => ({ ...block, sortOrder: index })),
    };

    const response = await fetch(articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles", {
      method: articleId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!response.ok) {
      setMessage("Save failed. Check the fields and try again.");
      return;
    }

    const result = (await response.json()) as { article?: { id: string } };
    setMessage("Saved.");
    router.refresh();

    if (!articleId && result.article?.id) {
      router.push(`/studio-tianho/articles/${result.article.id}`);
    }
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
        <label className="admin-field">
          <span className="admin-label">Display order</span>
          <input type="number" min="0" {...register("displayOrder", { valueAsNumber: true })} />
        </label>
      </div>

      <label className="admin-field">
        <span className="admin-label">Title</span>
        <input {...register("title")} />
        {errors.title ? <span className="admin-error">{errors.title.message}</span> : null}
      </label>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Slug</span>
          <input {...register("slug")} />
          {errors.slug ? <span className="admin-error">{errors.slug.message}</span> : null}
        </label>
        <label className="admin-field">
          <span className="admin-label">Category</span>
          <input {...register("category")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">Author</span>
          <input {...register("authorName")} />
        </label>
      </div>

      <label className="admin-field">
        <span className="admin-label">Lead / excerpt</span>
        <textarea {...register("excerpt")} />
      </label>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Hero image path</span>
          <input placeholder="/placeholders/article.svg" {...register("heroImagePath")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">Hero alt</span>
          <input {...register("heroAlt")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">Hero caption</span>
          <input {...register("heroCaption")} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Hero label</span>
          <input {...register("heroLabel")} />
        </label>
        <label className="admin-field">
          <span className="admin-label">Hero tone</span>
          <select {...register("heroTone")}>
            <option value="neutral">Neutral</option>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="rust">Rust</option>
          </select>
        </label>
        <label className="admin-field">
          <span className="admin-label">Published at</span>
          <input type="date" {...register("publishedAt")} />
        </label>
      </div>

      <label className="admin-field">
        <span className="admin-label">Related services</span>
        <textarea {...register("relatedServicesText")} />
      </label>

      <label className="admin-field">
        <span className="admin-label">Closing note</span>
        <textarea {...register("closingNote")} />
      </label>

      <section className="admin-block-list" aria-label="Article blocks">
        <div className="admin-page-header">
          <div>
            <p className="admin-kicker">Structured content</p>
            <h3>Blocks</h3>
          </div>
          <button
            className="admin-button-secondary"
            type="button"
            onClick={() => append({ type: "paragraph", body: "", sortOrder: fields.length, imageTone: "neutral" })}
          >
            Add block
          </button>
        </div>
        {fields.map((field, index) => (
          <article className="admin-block" key={field.id}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">Type</span>
                <select {...register(`blocks.${index}.type`)}>
                  <option value="heading">Heading</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="image">Image</option>
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-label">Order</span>
                <input readOnly value={index + 1} />
              </label>
            </div>
            <label className="admin-field">
              <span className="admin-label">Heading</span>
              <input {...register(`blocks.${index}.heading`)} />
            </label>
            <label className="admin-field">
              <span className="admin-label">Paragraph</span>
              <textarea {...register(`blocks.${index}.body`)} />
            </label>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">Image path</span>
                <input {...register(`blocks.${index}.imagePath`)} />
              </label>
              <label className="admin-field">
                <span className="admin-label">Image alt</span>
                <input {...register(`blocks.${index}.imageAlt`)} />
              </label>
              <label className="admin-field">
                <span className="admin-label">Image caption</span>
                <input {...register(`blocks.${index}.caption`)} />
              </label>
            </div>
            <div className="admin-actions">
              <button className="admin-button-secondary" type="button" disabled={index === 0} onClick={() => move(index, index - 1)}>
                Move up
              </button>
              <button
                className="admin-button-secondary"
                type="button"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
              >
                Move down
              </button>
              <button className="admin-danger" type="button" disabled={fields.length <= 1} onClick={() => remove(index)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </section>

      <div className="admin-actions">
        <button className="admin-button" disabled={submitting} type="submit">
          {submitting ? "Saving" : "Save article"}
        </button>
        {message ? <p className="admin-user">{message}</p> : null}
      </div>
    </form>
  );
}

function splitLines(value?: string | null) {
  return (value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
