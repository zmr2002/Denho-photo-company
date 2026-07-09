"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { workImagesMutationSchema } from "@/lib/admin/validation";

export type AdminWorkImagesFormValues = z.input<typeof workImagesMutationSchema>;

type AdminWorkImagesFormProps = {
  workId: string;
  defaultValues: AdminWorkImagesFormValues;
};

export function AdminWorkImagesForm({ workId, defaultValues }: AdminWorkImagesFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { control, register, handleSubmit, setValue } = useForm<AdminWorkImagesFormValues>({
    resolver: zodResolver(workImagesMutationSchema),
    defaultValues,
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "images" });
  const mediaType = useWatch({ control, name: "mediaType" });

  async function onSubmit(values: AdminWorkImagesFormValues) {
    setSubmitting(true);
    setMessage("");

    const payload = {
      ...values,
      galleryEnabled: values.mediaType === "video" ? false : values.galleryEnabled,
      images: (values.images ?? []).map((image, index) => ({ ...image, sortOrder: index })),
    };

    const response = await fetch(`/api/admin/works/${workId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!response.ok) {
      setMessage("Save failed. Check the image rows and try again.");
      return;
    }

    setMessage("Saved.");
    router.refresh();
  }

  function removeImage(index: number) {
    if (window.confirm("Remove this image metadata row?")) {
      remove(index);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">Media type</span>
          <select {...register("mediaType")} onChange={(event) => {
            register("mediaType").onChange(event);
            if (event.target.value === "video") setValue("galleryEnabled", false);
          }}>
            <option value="photo">Photo</option>
            <option value="gallery">Gallery</option>
            <option value="video">Video</option>
          </select>
        </label>
        <label className="admin-field admin-check-field">
          <span className="admin-label">Gallery enabled</span>
          <input type="checkbox" disabled={mediaType === "video"} {...register("galleryEnabled")} />
        </label>
      </div>

      {mediaType === "video" ? (
        <p className="admin-warning">Video works remain separate from image galleries. Gallery mode is disabled for this record.</p>
      ) : null}

      <section className="admin-block-list" aria-label="Work images">
        <div className="admin-page-header">
          <div>
            <p className="admin-kicker">Image metadata</p>
            <h3>Images</h3>
          </div>
          <button
            className="admin-button-secondary"
            type="button"
            onClick={() =>
              append({
                path: "/placeholders/new-work-image.svg",
                label: "New image",
                tone: "neutral",
                altJa: "",
                altZh: "",
                altEn: "",
                captionJa: "",
                captionZh: "",
                captionEn: "",
                isCover: fields.length === 0,
                sortOrder: fields.length,
              })
            }
          >
            Add image row
          </button>
        </div>

        {fields.map((field, index) => (
          <article className="admin-block" key={field.id}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">Path</span>
                <input {...register(`images.${index}.path`)} />
              </label>
              <label className="admin-field">
                <span className="admin-label">Label</span>
                <input {...register(`images.${index}.label`)} />
              </label>
              <label className="admin-field">
                <span className="admin-label">Tone</span>
                <select {...register(`images.${index}.tone`)}>
                  <option value="neutral">Neutral</option>
                  <option value="warm">Warm</option>
                  <option value="cool">Cool</option>
                  <option value="rust">Rust</option>
                </select>
              </label>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">Alt JA</span>
                <input {...register(`images.${index}.altJa`)} />
              </label>
              <label className="admin-field">
                <span className="admin-label">Alt ZH</span>
                <input {...register(`images.${index}.altZh`)} />
              </label>
              <label className="admin-field">
                <span className="admin-label">Alt EN</span>
                <input {...register(`images.${index}.altEn`)} />
              </label>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">Caption JA</span>
                <input {...register(`images.${index}.captionJa`)} />
              </label>
              <label className="admin-field">
                <span className="admin-label">Caption ZH</span>
                <input {...register(`images.${index}.captionZh`)} />
              </label>
              <label className="admin-field">
                <span className="admin-label">Caption EN</span>
                <input {...register(`images.${index}.captionEn`)} />
              </label>
            </div>

            <div className="admin-actions">
              <label className="admin-inline-check">
                <input type="checkbox" {...register(`images.${index}.isCover`)} />
                Cover image
              </label>
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
              <button className="admin-danger" type="button" onClick={() => removeImage(index)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </section>

      <div className="admin-actions">
        <button className="admin-button" disabled={submitting} type="submit">
          {submitting ? "Saving" : "Save images"}
        </button>
        {message ? <p className="admin-user">{message}</p> : null}
      </div>
    </form>
  );
}
