"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { articleMutationSchema } from "@/lib/admin/validation";
import { adminResponseMessage, writeAdminApi } from "@/lib/api/browser";
import { siteDateInputToTimestamp } from "@/lib/site-date";

const articleFormSchema = articleMutationSchema.omit({ excerpt: true, relatedServices: true }).extend({
  excerpt: z.string().trim().max(10_000, "内容过长").optional(),
  relatedServicesText: z.string().max(10_000, "内容过长").optional(),
}).superRefine((values, context) => {
  const services = splitLines(values.relatedServicesText);
  if (services.length > 40 || services.some((service) => service.length > 160)) {
    context.addIssue({ code: "custom", path: ["relatedServicesText"], message: "最多填写 40 项，每项最多 160 个字符。" });
  }
});

export type AdminArticleFormValues = z.input<typeof articleFormSchema>;

type ArticleBlock = AdminArticleFormValues["blocks"][number];

type AdminArticleFormProps = {
  articleId?: string;
  contentVersion?: number;
  defaultValues: AdminArticleFormValues;
  isTutorial?: boolean;
  canManagePublication?: boolean;
};

const blockLabels: Record<ArticleBlock["type"], string> = {
  heading: "小标题",
  paragraph: "正文",
  image: "图片",
};

export function AdminArticleForm({
  articleId,
  contentVersion = 0,
  defaultValues,
  isTutorial = false,
  canManagePublication = false,
}: AdminArticleFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [version, setVersion] = useState(contentVersion);
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
  const blocks = useWatch({ control, name: "blocks" });

  async function onSubmit(values: AdminArticleFormValues) {
    setSubmitting(true);
    setMessage("");

    const payload = {
      ...values,
      excerpt: resolveArticleExcerpt(values.excerpt, values.blocks, values.title),
      relatedServices: splitLines(values.relatedServicesText),
      blocks: values.blocks.map((block, index) => ({ ...block, sortOrder: index })),
      publishedAt: siteDateInputToTimestamp(values.publishedAt),
      demo: isTutorial,
    };
    delete (payload as Partial<typeof payload>).relatedServicesText;
    delete (payload as Partial<typeof payload>).status;

    const response = await writeAdminApi(
      articleId ? `/api/v1/admin/articles/${articleId}` : "/api/v1/admin/articles",
      articleId ? "PATCH" : "POST",
      articleId ? { expectedVersion: version, article: payload } : payload,
    );

    setSubmitting(false);

    if (!response.ok) {
      setMessage(adminResponseMessage(response, "保存失败，请稍后重试。"));
      return;
    }

    const result = (await response.json()) as ArticleMutationResult;
    let savedResult = result;
    if (canManagePublication) {
      const transitionResult = await transitionArticleStatus(result, values.status);
      savedResult = transitionResult.current;
      if (transitionResult.error) {
        setVersion(savedResult.version);
        setMessage(transitionResult.error);
        router.refresh();
        return;
      }
    }
    setVersion(savedResult.version);
    setMessage("已保存。");
    router.refresh();

    if (!articleId && result.id) {
      router.push(`/studio-tianho/articles/${result.id}`);
    }
  }

  async function handleArchive() {
    if (!articleId) return;
    const confirmed = window.confirm("归档后将不会向访客显示，可在后台恢复为草稿。确定归档吗？");
    if (!confirmed) return;

    setSubmitting(true);
    setMessage("");

    const response = await writeAdminApi(`/api/v1/admin/articles/${articleId}/archive`, "POST", {
      expectedVersion: version,
    });

    setSubmitting(false);

    if (!response.ok) {
      setMessage(adminResponseMessage(response, "归档失败，请稍后重试。"));
      return;
    }

    router.push("/studio-tianho/articles");
    router.refresh();
  }

  function addBlock(type: ArticleBlock["type"]) {
    append(createBlock(type, fields.length));
  }

  return (
    <form className="admin-form admin-article-editor" onSubmit={handleSubmit(onSubmit)}>
      {isTutorial ? (
        <div className="admin-info-box">
          <strong>教学示例</strong>
          <p>这篇文章用于学习后台字段。当前作为预上线公开演示样本显示；请保留教学示例标识，避免误认为真实案例。</p>
        </div>
      ) : null}

      <section className="admin-form-section admin-editor-primary" aria-labelledby="article-content-title">
        <div className="admin-editor-heading">
          <div>
            <p className="admin-kicker">文章内容</p>
            <h3 id="article-content-title">写作与排列</h3>
          </div>
          {canManagePublication ? (
            <label className="admin-field admin-status-field">
              <span className="admin-label">状态</span>
              <select {...register("status")}>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </label>
          ) : (
            <div className="admin-field admin-status-field">
              <span className="admin-label">状态</span>
              <strong>{articleStatusLabel(defaultValues.status)}</strong>
              <input type="hidden" {...register("status")} />
            </div>
          )}
        </div>

        <label className="admin-field admin-title-field">
          <span className="admin-label">文章标题</span>
          <input autoFocus placeholder="输入文章标题" {...register("title")} />
          {errors.title ? <span className="admin-error">{errors.title.message}</span> : null}
        </label>

        <div className="admin-block-toolbar" aria-label="添加文章内容">
          <span>在末尾添加</span>
          <button className="admin-button-secondary" type="button" onClick={() => addBlock("paragraph")}>
            正文
          </button>
          <button className="admin-button-secondary" type="button" onClick={() => addBlock("heading")}>
            小标题
          </button>
          <button className="admin-button-secondary" type="button" onClick={() => addBlock("image")}>
            图片
          </button>
        </div>

        <div className="admin-block-list" aria-label="文章内容区块">
          {fields.map((field, index) => {
            const type = blocks?.[index]?.type ?? field.type;
            return (
              <article className={`admin-block admin-block-${type}`} key={field.id}>
                <div className="admin-block-header">
                  <span className="admin-block-number">{index + 1}</span>
                  <strong>{blockLabels[type]}</strong>
                  <div className="admin-block-actions">
                    <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`上移第 ${index + 1} 个区块`}>
                      上移
                    </button>
                    <button
                      type="button"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      aria-label={`下移第 ${index + 1} 个区块`}
                    >
                      下移
                    </button>
                    <button type="button" disabled={fields.length <= 1} onClick={() => remove(index)} aria-label={`移除第 ${index + 1} 个区块`}>
                      移除
                    </button>
                  </div>
                </div>

                <input type="hidden" {...register(`blocks.${index}.type`)} />
                {type === "heading" ? (
                  <label className="admin-field">
                    <span className="admin-label">小标题</span>
                    <input placeholder="输入段落小标题" {...register(`blocks.${index}.heading`)} />
                  </label>
                ) : null}
                {type === "paragraph" ? (
                  <label className="admin-field">
                    <span className="admin-label">正文</span>
                    <textarea rows={7} placeholder="输入正文内容" {...register(`blocks.${index}.body`)} />
                  </label>
                ) : null}
                {type === "image" ? (
                  <div className="admin-image-fields">
                    <label className="admin-field">
                      <span className="admin-label">图片路径</span>
                      <input placeholder="/media/original/example.jpg" {...register(`blocks.${index}.imagePath`)} />
                    </label>
                    <div className="admin-form-grid admin-form-grid-compact">
                      <label className="admin-field">
                        <span className="admin-label">图片内容说明</span>
                        <input placeholder="简要说明图片内容" {...register(`blocks.${index}.imageAlt`)} />
                      </label>
                      <label className="admin-field">
                        <span className="admin-label">显示在图片下方的说明</span>
                        <input {...register(`blocks.${index}.caption`)} />
                      </label>
                      <label className="admin-field">
                        <span className="admin-label">占位色调</span>
                        <select {...register(`blocks.${index}.imageTone`)}>
                          <option value="neutral">中性</option>
                          <option value="warm">暖色</option>
                          <option value="cool">冷色</option>
                          <option value="rust">砖红</option>
                        </select>
                      </label>
                    </div>
                    <Link className="admin-inline-link" href="/studio-tianho/media" target="_blank">
                      在新窗口打开媒体库
                    </Link>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {errors.blocks?.root ? <span className="admin-error">{errors.blocks.root.message}</span> : null}
      </section>

      <details className="admin-advanced-settings">
        <summary>
          <span>
            <strong>其他设置</strong>
            <small>网址、语言、摘要、主图与显示信息</small>
          </span>
        </summary>
        <div className="admin-advanced-content">
          <section className="admin-form-section" aria-labelledby="article-list-title">
            <div>
              <p className="admin-kicker">列表信息</p>
              <h3 id="article-list-title">摘要与分类</h3>
            </div>
            <label className="admin-field">
              <span className="admin-label">摘要（可选）</span>
              <textarea rows={3} placeholder="留空时自动使用第一段正文" {...register("excerpt")} />
              <span className="admin-help">留空时会从第一段正文自动生成，之后仍可随时手动修改。</span>
            </label>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">语言页面</span>
                <select {...register("locale")}>
                  <option value="ja">日语页面（ja）</option>
                  <option value="zh">中文页面（zh）</option>
                  <option value="en">英语页面（en）</option>
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-label">分类</span>
                <input {...register("category")} />
              </label>
              <label className="admin-field">
                <span className="admin-label">作者 / 显示名称</span>
                <input {...register("authorName")} />
              </label>
            </div>
            <label className="admin-field">
              <span className="admin-label">相关服务</span>
              <textarea rows={3} placeholder="每行一个服务" {...register("relatedServicesText")} />
            </label>
          </section>

          <section className="admin-form-section" aria-labelledby="article-address-title">
            <div>
              <p className="admin-kicker">网址与排序</p>
              <h3 id="article-address-title">页面位置</h3>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">网址标识</span>
                <input {...register("slug")} />
                <span className="admin-help">使用小写英文、数字和连字符，例如 production-story。</span>
                {errors.slug ? <span className="admin-error">{errors.slug.message}</span> : null}
              </label>
              <label className="admin-field">
                <span className="admin-label">显示顺序</span>
                <input type="number" min="0" {...register("displayOrder", { valueAsNumber: true })} />
              </label>
              <label className="admin-field">
                <span className="admin-label">发布日期</span>
                <input type="date" {...register("publishedAt")} />
              </label>
            </div>
          </section>

          <section className="admin-form-section" aria-labelledby="article-hero-title">
            <div>
              <p className="admin-kicker">主图</p>
              <h3 id="article-hero-title">文章顶部图片</h3>
            </div>
            <label className="admin-field">
              <span className="admin-label">主图路径</span>
              <input placeholder="/placeholders/article.svg" {...register("heroImagePath")} />
            </label>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">图片内容说明</span>
                <input {...register("heroAlt")} />
              </label>
              <label className="admin-field">
                <span className="admin-label">图片说明</span>
                <input {...register("heroCaption")} />
              </label>
              <label className="admin-field">
                <span className="admin-label">占位色调</span>
                <select {...register("heroTone")}>
                  <option value="neutral">中性</option>
                  <option value="warm">暖色</option>
                  <option value="cool">冷色</option>
                  <option value="rust">砖红</option>
                </select>
              </label>
            </div>
            <label className="admin-field">
              <span className="admin-label">主图内部标签</span>
              <input {...register("heroLabel")} />
            </label>
          </section>

          <section className="admin-form-section" aria-labelledby="article-finish-title">
            <div>
              <p className="admin-kicker">补充内容</p>
              <h3 id="article-finish-title">结尾与搜索信息</h3>
            </div>
            <label className="admin-field">
              <span className="admin-label">结尾说明</span>
              <textarea rows={3} {...register("closingNote")} />
            </label>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">搜索标题</span>
                <input {...register("seoTitle")} />
              </label>
              <label className="admin-field">
                <span className="admin-label">搜索说明</span>
                <input {...register("seoDescription")} />
              </label>
              <label className="admin-field">
                <span className="admin-label">YouTube 网址</span>
                <input {...register("youtubeUrl")} />
              </label>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">行动按钮文字</span>
                <input {...register("ctaLabel")} />
              </label>
              <label className="admin-field">
                <span className="admin-label">行动按钮网址</span>
                <input {...register("ctaHref")} />
              </label>
            </div>
          </section>
        </div>
      </details>

      <div className="admin-actions admin-save-bar">
        <button className="admin-button" disabled={submitting} type="submit">
          {submitting ? "保存中…" : "保存文章"}
        </button>
        {articleId && canManagePublication && defaultValues.status !== "archived" ? (
          <button className="admin-danger" disabled={submitting} type="button" onClick={handleArchive}>
            归档文章
          </button>
        ) : null}
        <p className="admin-save-message" aria-live="polite">
          {message}
        </p>
      </div>
    </form>
  );
}

type ArticleMutationResult = { id: string; version: number; status: string };

async function transitionArticleStatus(result: ArticleMutationResult, targetStatus: AdminArticleFormValues["status"]) {
  let current = result;

  async function transition(action: "publish" | "archive" | "restore", errorMessage: string) {
    const response = await writeAdminApi(`/api/v1/admin/articles/${current.id}/${action}`, "POST", {
      expectedVersion: current.version,
    });
    if (!response.ok) return adminResponseMessage(response, errorMessage);
    current = (await response.json()) as ArticleMutationResult;
    return null;
  }

  if (targetStatus === "published") {
    if (current.status === "ARCHIVED") {
      const error = await transition("restore", "内容已保存，但无法从归档状态恢复。");
      if (error) return { current, error };
    }
    if (current.status === "DRAFT") {
      const error = await transition("publish", "内容已保存为草稿，但无法发布当前版本。");
      return { current, error };
    }
  }

  if (targetStatus === "draft") {
    if (current.status === "PUBLISHED") {
      const error = await transition("archive", "内容已保存，但无法撤下当前发布版本。");
      if (error) return { current, error };
    }
    if (current.status === "ARCHIVED") {
      const error = await transition("restore", "内容已归档，但无法恢复为草稿。");
      return { current, error };
    }
  }

  if (targetStatus === "archived" && current.status !== "ARCHIVED") {
    const error = await transition("archive", "内容已保存，但无法归档当前版本。");
    return { current, error };
  }

  return { current, error: null };
}

function articleStatusLabel(status: AdminArticleFormValues["status"]) {
  if (status === "published") return "已发布";
  if (status === "archived") return "已归档";
  return "草稿";
}

export function resolveArticleExcerpt(excerpt: string | null | undefined, blocks: ArticleBlock[], title: string) {
  const manualExcerpt = excerpt?.trim();
  if (manualExcerpt) return manualExcerpt;

  const firstParagraph = blocks.find((block) => block.type === "paragraph" && block.body?.trim())?.body?.trim();
  const source = firstParagraph || title.trim();
  if (source.length <= 140) return source;
  return `${source.slice(0, 139).trimEnd()}…`;
}

function createBlock(type: ArticleBlock["type"], sortOrder: number): ArticleBlock {
  return {
    type,
    heading: "",
    body: "",
    imagePath: "",
    imageAlt: "",
    imageTone: "neutral",
    caption: "",
    sortOrder,
  };
}

function splitLines(value?: string | null) {
  return (value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
