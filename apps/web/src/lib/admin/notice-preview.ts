import "server-only";

import type { SiteNotice } from "@/lib/content/types";
import type { AdminNotice } from "@/lib/api/admin";

export function adminNoticeToPreview(notice: AdminNotice): SiteNotice {
  return {
    id: notice.id,
    language: notice.locale === "zh" || notice.locale === "en" ? notice.locale : "ja",
    enabled: notice.enabled,
    label: notice.label,
    title: notice.title,
    body: notice.body,
    dismissLabel: notice.dismissLabel,
    storageKey: notice.storageKey,
    dismissalMode: notice.dismissalMode === "local" ? "local" : "session",
    status: notice.status === "published" ? "published" : "draft",
    startAt: notice.startAt ?? undefined,
    endAt: notice.endAt ?? undefined,
  };
}