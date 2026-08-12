"use client";

import { useMemo, useState } from "react";
import type { AuditEvent } from "@/lib/api/admin";

const resourceLabels: Record<string, string> = {
  ARTICLE: "文章",
  WORK: "作品",
  NOTICE: "通知",
  MEDIA_ASSET: "媒体",
  INQUIRY: "咨询",
  ADMINISTRATOR_USER: "账号",
};

const eventLabels: Record<string, string> = {
  CONTENT_CREATED: "创建内容",
  CONTENT_UPDATED: "修改内容",
  CONTENT_PUBLISHED: "发布内容",
  CONTENT_UNPUBLISHED: "撤下内容",
  CONTENT_ARCHIVED: "归档内容",
  CONTENT_RESTORED: "恢复内容",
  MEDIA_UPLOADED: "上传媒体",
  MEDIA_TRASHED: "将媒体移入回收站",
  MEDIA_RESTORED: "恢复媒体",
  INQUIRY_STATUS_CHANGED: "更新咨询状态",
  INQUIRY_NOTE_ADDED: "新增咨询处理记录",
  USER_CREATED: "创建账号",
  USER_ROLE_CHANGED: "修改账号角色",
  USER_ACTIVATED: "启用账号",
  USER_DEACTIVATED: "停用账号",
  LOGIN_SUCCEEDED: "登录成功",
  LOGIN_FAILED: "登录失败",
  LOGOUT: "退出登录",
};

export function ActivityHistory({ events }: { events: AuditEvent[] }) {
  const [query, setQuery] = useState("");
  const [resource, setResource] = useState("ALL");
  const resources = useMemo(() => Array.from(new Set(events.map((event) => event.resourceType))).sort(), [events]);
  const visibleEvents = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return events.filter((event) => (resource === "ALL" || event.resourceType === resource) && (!term || [
      event.actorDisplayName,
      eventLabels[event.eventType] || event.eventType,
      resourceLabels[event.resourceType] || event.resourceType,
    ].some((value) => value.toLocaleLowerCase().includes(term))));
  }, [events, query, resource]);

  return (
    <div className="admin-worklist">
      <div className="admin-worklist-filters">
        <label className="admin-field"><span className="admin-label">搜索操作人或动作</span><input onChange={(event) => setQuery(event.target.value)} type="search" value={query} /></label>
        <label className="admin-field"><span className="admin-label">资料类型</span><select onChange={(event) => setResource(event.target.value)} value={resource}><option value="ALL">全部类型</option>{resources.map((item) => <option key={item} value={item}>{resourceLabels[item] || item}</option>)}</select></label>
        <p className="admin-worklist-count">显示 {visibleEvents.length} 条记录</p>
      </div>
      <ol className="admin-activity-list">
        {visibleEvents.map((event) => (
          <li key={event.id}>
            <span className="admin-activity-marker" aria-hidden="true" />
            <div>
              <p><strong>{event.actorDisplayName}</strong> · {eventLabels[event.eventType] || event.eventType}</p>
              <small>{resourceLabels[event.resourceType] || event.resourceType}{event.resourceId ? ` · ${event.resourceId}` : ""} · {new Date(event.occurredAt).toLocaleString("zh-CN")}</small>
            </div>
          </li>
        ))}
      </ol>
      {visibleEvents.length === 0 ? <p className="admin-empty">没有符合条件的操作记录。</p> : null}
    </div>
  );
}
