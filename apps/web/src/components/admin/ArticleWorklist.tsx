"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { isTutorialArticle, localeLabel, statusLabel } from "@/lib/admin/labels";
import type { AdminArticle } from "@/lib/api/admin";

const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
] as const;

export function ArticleWorklist({ articles }: { articles: AdminArticle[] }) {
  const [query, setQuery] = useState("");
  const [locale, setLocale] = useState("all");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return articles.filter((article) => {
      const matchesText = !term || [article.title, article.slug, article.category].some((value) => value.toLocaleLowerCase().includes(term));
      return matchesText && (locale === "all" || article.locale === locale) && (status === "all" || article.status === status);
    });
  }, [articles, locale, query, status]);

  return (
    <div className="admin-worklist">
      <div className="admin-worklist-filters" aria-label="筛选文章">
        <label className="admin-field admin-worklist-search">
          <span className="admin-label">搜索</span>
          <input onChange={(event) => setQuery(event.target.value)} placeholder="标题、网址标识或分类" type="search" value={query} />
        </label>
        <label className="admin-field">
          <span className="admin-label">语言</span>
          <select onChange={(event) => setLocale(event.target.value)} value={locale}>
            <option value="all">全部语言</option><option value="ja">日语</option><option value="zh">中文</option><option value="en">英语</option>
          </select>
        </label>
        <label className="admin-field">
          <span className="admin-label">状态</span>
          <select onChange={(event) => setStatus(event.target.value)} value={status}>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <p className="admin-worklist-count" role="status">显示 {filtered.length} / {articles.length} 篇文章</p>
      <div className="admin-list">
        {articles.length === 0 ? <p className="admin-empty">还没有文章。可以先新增一篇草稿。</p> : null}
        {articles.length > 0 && filtered.length === 0 ? <p className="admin-empty">没有符合当前搜索和筛选条件的文章。</p> : null}
        {filtered.map((article) => (
          <article className={`admin-list-row ${isTutorialArticle(article) ? "admin-list-row-sample" : ""}`} key={article.id}>
            <div>
              <p className="admin-label">
                <span className={`admin-content-state admin-content-state-${article.status}`}>{statusLabel(article.status)}</span>
                {localeLabel(article.locale)} / {article.category}
              </p>
              <h3>{article.title}{isTutorialArticle(article) ? <span className="admin-badge">教学示例</span> : null}</h3>
              <p>{article.slug}{article.updatedAt ? ` · 更新于 ${new Date(article.updatedAt).toLocaleString("zh-CN")}` : ""}</p>
            </div>
            <Link className="admin-button-secondary" href={`/studio-tianho/articles/${article.id}`}>编辑</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
