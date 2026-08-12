import type { AdminRevision } from "@/lib/api/admin";

const actionLabels: Record<string, string> = {
  CREATED: "创建内容",
  UPDATED: "保存修改",
  PUBLISHED: "发布",
  UNPUBLISHED: "撤下",
  ARCHIVED: "归档",
  RESTORED: "恢复为草稿",
};

export function ArticleRevisionHistory({ revisions }: { revisions: AdminRevision[] }) {
  return (
    <details className="admin-revision-history">
      <summary>
        <span><strong>修改记录</strong><small>共 {revisions.length} 个版本，只读保存</small></span>
      </summary>
      <div className="admin-revision-list">
        {revisions.length === 0 ? <p className="admin-empty">尚无修改记录。</p> : null}
        {revisions.map((revision) => (
          <article key={revision.id}>
            <span className="admin-content-state">版本 {revision.version}</span>
            <div><strong>{actionLabels[revision.action] || revision.action}</strong><small>{new Date(revision.createdAt).toLocaleString("zh-CN")}</small></div>
          </article>
        ))}
      </div>
    </details>
  );
}
