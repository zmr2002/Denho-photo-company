"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { articleMutationSchema } from "@/lib/admin/validation";
import { writeAdminApi } from "@/lib/api/browser";

const articleFormSchema = articleMutationSchema.omit({ relatedServices: true }).extend({
  relatedServicesText: z.string().optional(),
});

export type AdminArticleFormValues = z.input<typeof articleFormSchema>;

type AdminArticleFormProps = {
  articleId?: string;
  contentVersion?: number;
  defaultValues: AdminArticleFormValues;
  isTutorial?: boolean;
};

export function AdminArticleForm({ articleId, contentVersion = 0, defaultValues, isTutorial = false }: AdminArticleFormProps) {
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
      demo: isTutorial,
    };
    delete (payload as Partial<typeof payload>).relatedServicesText;
    delete (payload as Partial<typeof payload>).publishedAt;
    delete (payload as Partial<typeof payload>).status;

    const response = await writeAdminApi(
      articleId ? `/api/v1/admin/articles/${articleId}` : "/api/v1/admin/articles",
      articleId ? "PATCH" : "POST",
      articleId ? { expectedVersion: contentVersion, article: payload } : payload,
    );

    setSubmitting(false);

    if (!response.ok) {
      setMessage("保存失败。请检查字段后重试。");
      return;
    }

    const result = (await response.json()) as { id: string; version: number; status: string };
    if (values.status === "published" && result.status === "DRAFT") {
      const publishResponse = await writeAdminApi(`/api/v1/admin/articles/${result.id}/publish`, "POST", {
        expectedVersion: result.version,
      });
      if (!publishResponse.ok) {
        setMessage("内容已保存为草稿，但当前账号无权发布或内容版本已变化。");
        router.refresh();
        return;
      }
    }
    if (values.status === "draft" && result.status === "PUBLISHED") {
      const archiveResponse = await writeAdminApi(`/api/v1/admin/articles/${result.id}/archive`, "POST", {
        expectedVersion: result.version,
      });
      if (!archiveResponse.ok) {
        setMessage("内容已保存，但无法撤下当前发布版本。");
        router.refresh();
        return;
      }
      const archived = (await archiveResponse.json()) as { version: number };
      const restoreResponse = await writeAdminApi(`/api/v1/admin/articles/${result.id}/restore`, "POST", {
        expectedVersion: archived.version,
      });
      if (!restoreResponse.ok) {
        setMessage("内容已归档，但无法恢复为草稿。");
        router.refresh();
        return;
      }
    }
    setMessage("已保存。");
    router.refresh();

    if (!articleId && result.id) {
      router.push(`/studio-tianho/articles/${result.id}`);
    }
  }

  async function handleDelete() {
    if (!articleId) return;
    const confirmed = window.confirm("删除后将无法在后台继续编辑这篇文章。确定要删除吗？");
    if (!confirmed) return;

    setSubmitting(true);
    setMessage("");

    const response = await writeAdminApi(`/api/v1/admin/articles/${articleId}/archive`, "POST", {
      expectedVersion: contentVersion,
    });

    setSubmitting(false);

    if (!response.ok) {
      setMessage("删除失败。请稍后再试。");
      return;
    }

    router.push("/studio-tianho/articles");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
      {isTutorial ? (
        <div className="admin-info-box">
          <strong>教学示例</strong>
          <p>这篇文章用于学习后台字段。当前作为预上线公开演示样本显示；请保留教学示例标识，避免误认为真实案例。</p>
        </div>
      ) : null}

      <section className="admin-form-section" aria-labelledby="article-basic-title">
        <div>
          <p className="admin-kicker">基本信息</p>
          <h3 id="article-basic-title">告诉网站这篇文章是什么</h3>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">语言页面</span>
            <select {...register("locale")}>
              <option value="ja">日语页面（ja）</option>
              <option value="zh">中文页面（zh）</option>
              <option value="en">英语页面（en）</option>
            </select>
            <span className="admin-help">选择这篇文章属于哪个语言版本。</span>
          </label>
          <label className="admin-field">
            <span className="admin-label">发布状态</span>
            <select {...register("status")}>
              <option value="draft">草稿（不会作为正式文章显示）</option>
              <option value="published">已发布（允许在前台显示）</option>
            </select>
            <span className="admin-help">不确定时请先选择草稿。</span>
          </label>
          <label className="admin-field">
            <span className="admin-label">显示顺序</span>
            <input type="number" min="0" {...register("displayOrder", { valueAsNumber: true })} />
            <span className="admin-help">数字越小越靠前。普通文章可保持默认。</span>
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">标题</span>
            <input {...register("title")} />
            <span className="admin-help">文章最主要的名称，会显示在文章页面和后台列表中。</span>
            {errors.title ? <span className="admin-error">{errors.title.message}</span> : null}
          </label>
          <label className="admin-field">
            <span className="admin-label">网址标识</span>
            <input {...register("slug")} />
            <span className="admin-help">用于生成网址。请使用小写英文、数字和连字符，例如 production-story。</span>
            {errors.slug ? <span className="admin-error">{errors.slug.message}</span> : null}
          </label>
          <label className="admin-field">
            <span className="admin-label">分类</span>
            <input {...register("category")} />
            <span className="admin-help">例如：公告、制作案例、后台教学。</span>
          </label>
        </div>

        <label className="admin-field">
          <span className="admin-label">作者 / 显示名称</span>
          <input {...register("authorName")} />
          <span className="admin-help">显示为文章的发布者或编辑团队名称。</span>
        </label>
      </section>

      <section className="admin-form-section" aria-labelledby="article-list-title">
        <div>
          <p className="admin-kicker">列表显示内容</p>
          <h3 id="article-list-title">写给读者的简短介绍</h3>
        </div>
        <label className="admin-field">
          <span className="admin-label">摘要</span>
          <textarea {...register("excerpt")} />
          <span className="admin-help">列表中显示的一小段介绍。建议一到两句话说明文章重点。</span>
        </label>
        <label className="admin-field">
          <span className="admin-label">相关服务</span>
          <textarea {...register("relatedServicesText")} />
          <span className="admin-help">每行填写一个相关服务，例如：活动拍摄。没有需要可留空。</span>
        </label>
      </section>

      <section className="admin-form-section" aria-labelledby="article-hero-title">
        <div>
          <p className="admin-kicker">主图设置</p>
          <h3 id="article-hero-title">文章顶部使用的代表图片</h3>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">主图路径</span>
            <input placeholder="/placeholders/article.svg" {...register("heroImagePath")} />
            <span className="admin-help">当前阶段使用已有图片路径。正式上传功能会在后续实现。</span>
          </label>
          <label className="admin-field">
            <span className="admin-label">替代文字</span>
            <input {...register("heroAlt")} />
            <span className="admin-help">给图片的文字说明，有助于无障碍和搜索理解。</span>
          </label>
          <label className="admin-field">
            <span className="admin-label">图片说明</span>
            <input {...register("heroCaption")} />
            <span className="admin-help">显示给读者看的图片注释。</span>
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">主图内部标签</span>
            <input {...register("heroLabel")} />
            <span className="admin-help">占位图上的短标签。真实图片上线后可少用。</span>
          </label>
          <label className="admin-field">
            <span className="admin-label">主图色调</span>
            <select {...register("heroTone")}>
              <option value="neutral">中性</option>
              <option value="warm">暖色</option>
              <option value="cool">冷色</option>
              <option value="rust">砖红</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-label">发布日期</span>
            <input type="date" {...register("publishedAt")} />
            <span className="admin-help">发布状态为已发布时使用；草稿可留空。</span>
          </label>
        </div>
      </section>

      <section className="admin-block-list admin-form-section" aria-label="文章内容区块">
        <div className="admin-page-header">
          <div>
            <p className="admin-kicker">正文内容</p>
            <h3>正文区块</h3>
            <p className="admin-help">正文区块是文章内部的小标题、正文段落和图片。显示顺序就是下面的排列顺序。</p>
          </div>
          <button
            className="admin-button-secondary"
            type="button"
            onClick={() => append({ type: "paragraph", body: "", sortOrder: fields.length, imageTone: "neutral" })}
          >
            添加区块
          </button>
        </div>
        {fields.map((field, index) => (
          <article className="admin-block" key={field.id}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">区块类型</span>
                <select {...register(`blocks.${index}.type`)}>
                  <option value="heading">小标题</option>
                  <option value="paragraph">正文段落</option>
                  <option value="image">图片</option>
                </select>
                <span className="admin-help">小标题用于分段；正文段落用于说明内容；图片用于插入已有图片。</span>
              </label>
              <label className="admin-field">
                <span className="admin-label">顺序</span>
                <input readOnly value={index + 1} />
                <span className="admin-help">使用上移 / 下移调整阅读顺序。</span>
              </label>
            </div>
            <label className="admin-field">
              <span className="admin-label">小标题文字</span>
              <input {...register(`blocks.${index}.heading`)} />
              <span className="admin-help">只有“小标题”区块需要填写。</span>
            </label>
            <label className="admin-field">
              <span className="admin-label">正文段落</span>
              <textarea {...register(`blocks.${index}.body`)} />
              <span className="admin-help">用简短、面向读者的语言说明项目或公告内容。</span>
            </label>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-label">图片路径</span>
                <input {...register(`blocks.${index}.imagePath`)} />
                <span className="admin-help">图片区块使用。当前阶段填写已有图片路径。</span>
              </label>
              <label className="admin-field">
                <span className="admin-label">替代文字</span>
                <input {...register(`blocks.${index}.imageAlt`)} />
                <span className="admin-help">说明图片内容，给搜索和无障碍阅读使用。</span>
              </label>
              <label className="admin-field">
                <span className="admin-label">图片说明</span>
                <input {...register(`blocks.${index}.caption`)} />
                <span className="admin-help">显示给读者看的图片注释。</span>
              </label>
            </div>
            <div className="admin-actions">
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
              <button className="admin-danger" type="button" disabled={fields.length <= 1} onClick={() => remove(index)}>
                移除
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-form-section" aria-labelledby="article-publish-title">
        <div>
          <p className="admin-kicker">发布设置</p>
          <h3 id="article-publish-title">保存前最后检查</h3>
        </div>
        <label className="admin-field">
          <span className="admin-label">结尾说明</span>
          <textarea {...register("closingNote")} />
          <span className="admin-help">显示在文章末尾，可用于提醒读者下一步行动或补充说明。</span>
        </label>
      </section>

      <div className="admin-actions">
        <button className="admin-button" disabled={submitting} type="submit">
          {submitting ? "保存中" : "保存文章"}
        </button>
        {articleId ? (
          <button className="admin-danger" disabled={submitting} type="button" onClick={handleDelete}>
            删除文章
          </button>
        ) : null}
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
