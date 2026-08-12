"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AdminActionFeedback, useAdministrationAction } from "@/components/admin/AdminActionFeedback";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";
import { workImagesMutationSchema } from "@/lib/admin/validation";
import { useUnsavedChanges } from "@/lib/admin/useUnsavedChanges";
import type { MediaAsset } from "@/lib/api/admin";
import { adminResponseMessage, writeAdminApi } from "@/lib/api/browser";

export type AdminWorkImagesFormValues = z.input<typeof workImagesMutationSchema>;

type AdminWorkImagesFormProps = {
  workId: string;
  contentVersion: number;
  defaultValues: AdminWorkImagesFormValues;
};

export function AdminWorkImagesForm({ workId, contentVersion, defaultValues }: AdminWorkImagesFormProps) {
  const router = useRouter();
  const [version, setVersion] = useState(contentVersion);
  const [mediaTarget, setMediaTarget] = useState<number | null>(null);
  const { feedback, pending: submitting, run, showError, showSuccess } = useAdministrationAction();
  const { control, register, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm<AdminWorkImagesFormValues>({
    resolver: zodResolver(workImagesMutationSchema),
    defaultValues,
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "images" });
  const mediaType = useWatch({ control, name: "mediaType" });
  const images = useWatch({ control, name: "images" });
  useUnsavedChanges(isDirty);

  async function onSubmit(values: AdminWorkImagesFormValues) {
    await run(async () => {
      const payload = {
        ...values,
        expectedVersion: version,
        galleryEnabled: values.mediaType === "video" ? false : values.galleryEnabled,
        images: (values.images ?? []).map((image, index) => ({ ...image, sortOrder: index })),
      };

      const response = await writeAdminApi(`/api/v1/admin/works/${workId}/images`, "PATCH", payload);

      if (!response.ok) {
        showError(adminResponseMessage(response, "保存失败，请稍后重试。"));
        return;
      }

      const result = (await response.json()) as { version: number };
      setVersion(result.version);
      reset({ ...values, galleryEnabled: payload.galleryEnabled, images: payload.images });
      showSuccess("作品图片已保存。");
      router.refresh();
    });
  }

  function removeImage(index: number) {
    if (window.confirm("确定要移除这条图片资料吗？")) {
      remove(index);
    }
  }

  function addImage() {
    const index = fields.length;
    append({
      path: "/placeholders/new-work-image.svg",
      label: "新图片",
      tone: "neutral",
      altJa: "",
      altZh: "",
      altEn: "",
      captionJa: "",
      captionZh: "",
      captionEn: "",
      isCover: fields.length === 0,
      sortOrder: fields.length,
    });
    setMediaTarget(index);
  }

  function selectMedia(asset: MediaAsset) {
    if (mediaTarget === null) return;
    setValue(`images.${mediaTarget}.path`, asset.url, { shouldDirty: true, shouldValidate: true });
    const currentLabel = images?.[mediaTarget]?.label?.trim();
    if (!currentLabel || currentLabel === "新图片") {
      setValue(`images.${mediaTarget}.label`, asset.originalFilename, { shouldDirty: true });
    }
    setMediaTarget(null);
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="admin-form-grid">
        <label className="admin-field">
          <span className="admin-label">媒体类型</span>
          <select {...register("mediaType")} onChange={(event) => {
            register("mediaType").onChange(event);
            if (event.target.value === "video") setValue("galleryEnabled", false);
          }}>
            <option value="photo">照片</option>
            <option value="gallery">图片相册</option>
            <option value="video">视频</option>
          </select>
          <span className="admin-help">视频类型不会作为图片相册打开。</span>
        </label>
        <label className="admin-field admin-check-field">
          <span className="admin-label">启用图库</span>
          <input type="checkbox" disabled={mediaType === "video"} {...register("galleryEnabled")} />
          <span className="admin-help">只有照片或图片相册类型才可启用。</span>
        </label>
      </div>

      {mediaType === "video" ? (
        <p className="admin-warning">视频作品与图片图库分开管理。此记录已禁用图库模式。</p>
      ) : null}

      <section className="admin-block-list" aria-label="作品图片">
        <div className="admin-page-header">
          <div>
            <p className="admin-kicker">图片资料</p>
            <h3>图片</h3>
          </div>
          <button
            className="admin-button-secondary"
            type="button"
            onClick={addImage}
          >
            从媒体库添加图片
          </button>
        </div>

        {fields.map((field, index) => (
          <article className="admin-block" key={field.id}>
            <div className="admin-work-image-layout">
              <div className="admin-work-image-preview">
                {images?.[index]?.path?.startsWith("/") ? (
                  <Image alt="" fill sizes="176px" src={images[index].path} unoptimized />
                ) : (
                  <span>暂无预览</span>
                )}
                <small>第 {index + 1} 张{images?.[index]?.isCover ? " · 当前封面" : ""}</small>
              </div>
              <div className="admin-image-fields">
                <div className="admin-card-heading">
                  <div>
                    <p className="admin-label">图片 {index + 1}</p>
                    <strong>{images?.[index]?.label || "未命名图片"}</strong>
                  </div>
                  <button className="admin-button-secondary" type="button" onClick={() => setMediaTarget(index)}>
                    从媒体库更换
                  </button>
                </div>
              <label className="admin-field">
                <span className="admin-label">后台标签</span>
                <input {...register(`images.${index}.label`)} />
                <span className="admin-help">用于后台识别这张图片。</span>
              </label>
              </div>
            </div>

            <details className="admin-advanced-settings">
              <summary>图片路径与显示色调</summary>
              <div className="admin-form-grid admin-advanced-content">
              <label className="admin-field">
                <span className="admin-label">图片路径</span>
                <input {...register(`images.${index}.path`)} />
                <span className="admin-help">通常由媒体库自动填写，只有迁移旧图片时才需手动修改。</span>
              </label>
              <label className="admin-field">
                <span className="admin-label">色调</span>
                <select {...register(`images.${index}.tone`)}>
                  <option value="neutral">中性</option>
                  <option value="warm">暖色</option>
                  <option value="cool">冷色</option>
                  <option value="rust">砖红</option>
                </select>
              </label>
              </div>
            </details>

            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">日语页面替代文字</span>
                <input {...register(`images.${index}.altJa`)} />
                <span className="admin-help">简短描述画面内容，供无法看到图片的访客理解。</span>
              </label>
              <label className="admin-field">
                <span className="admin-label">中文替代文字</span>
                <input {...register(`images.${index}.altZh`)} />
                <span className="admin-help">简短描述画面内容，供无法看到图片的访客理解。</span>
              </label>
              <label className="admin-field">
                <span className="admin-label">英语页面替代文字</span>
                <input {...register(`images.${index}.altEn`)} />
                <span className="admin-help">简短描述画面内容，供无法看到图片的访客理解。</span>
              </label>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">日语页面说明</span>
                <input {...register(`images.${index}.captionJa`)} />
                <span className="admin-help">显示给日语读者看的图片注释。</span>
              </label>
              <label className="admin-field">
                <span className="admin-label">中文说明</span>
                <input {...register(`images.${index}.captionZh`)} />
                <span className="admin-help">显示给中文读者看的图片注释。</span>
              </label>
              <label className="admin-field">
                <span className="admin-label">英语页面说明</span>
                <input {...register(`images.${index}.captionEn`)} />
                <span className="admin-help">显示给英语读者看的图片注释。</span>
              </label>
            </div>

            <div className="admin-actions">
              <input type="hidden" {...register(`images.${index}.isCover`)} />
              <label className="admin-inline-check">
                <input
                  checked={Boolean(images?.[index]?.isCover)}
                  name="work-cover"
                  onChange={() => fields.forEach((_, imageIndex) => setValue(`images.${imageIndex}.isCover`, imageIndex === index, { shouldDirty: true, shouldValidate: true }))}
                  type="radio"
                />
                设为封面
              </label>
              <button className="admin-button-secondary" type="button" disabled={index === 0} onClick={() => move(index, index - 1)}>
                上移
              </button>
              <button
                className="admin-button-secondary"
                type="button"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
              >
                下移
              </button>
              <button className="admin-danger" type="button" onClick={() => removeImage(index)}>
                移除
              </button>
            </div>
          </article>
        ))}
      </section>
      {errors.images?.root ? <p className="admin-error">{errors.images.root.message}</p> : null}

      <div className="admin-actions">
        <button className="admin-button" disabled={submitting} type="submit">
          {submitting ? "保存中" : "保存图片"}
        </button>
        <AdminActionFeedback feedback={feedback} />
      </div>
      {mediaTarget !== null ? <MediaPickerDialog onClose={() => setMediaTarget(null)} onSelect={selectMedia} /> : null}
    </form>
  );
}
