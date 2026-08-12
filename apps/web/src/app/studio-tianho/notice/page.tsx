import { AdminShell } from "@/components/admin/AdminShell";
import { NoticeWorkspace } from "@/components/admin/NoticeWorkspace";
import type { AdminNoticeFormValues } from "@/components/admin/AdminNoticeForm";
import { getAdminCollection, type AdminNotice } from "@/lib/api/admin";
import { formatSiteDate } from "@/lib/site-date";

const locales = ["ja", "zh", "en"] as const;

export default async function AdminNoticePage() {
  const notices = await getAdminCollection<AdminNotice>("notices");

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">开场通知</p>
            <h2>弹窗通知</h2>
            <p className="admin-help">开启后，访客第一次打开网站时会看到通知弹窗；请先保存，再从对应语言卡片打开真实首页预览。</p>
          </div>
        </header>
        <div className="admin-info-box">
          <strong>适合使用通知的情况</strong>
          <p>临时公告、休假通知、活动提醒、重要营业信息。先选择语言，再编辑并确认“当前访客状态”。</p>
        </div>
        <NoticeWorkspace
          entries={locales.map((locale) => {
            const notice = notices.find((item) => item.locale === locale);
            return {
              locale,
              noticeId: notice?.id ?? null,
              version: notice?.version ?? 0,
              visitorState: noticeVisitorState(notice),
              defaultValues: noticeToFormValues(locale, notice),
            };
          })}
        />
      </section>
    </AdminShell>
  );
}

function noticeVisitorState(notice?: AdminNotice) {
  if (!notice) return "尚未保存";
  if (notice.status.toUpperCase() !== "PUBLISHED") return "草稿，不向访客显示";
  if (!notice.enabled) return "已关闭，不向访客显示";
  const now = Date.now();
  if (notice.startAt && new Date(notice.startAt).getTime() > now) return "尚未到开始时间";
  if (notice.endAt && new Date(notice.endAt).getTime() < now) return "已经超过结束时间";
  return "当前访客可以看到";
}

function noticeToFormValues(locale: (typeof locales)[number], notice?: AdminNotice): AdminNoticeFormValues {
  return {
    locale,
    enabled: notice?.enabled ?? true,
    label: notice?.label || "通知",
    title: notice?.title || "",
    body: notice?.body || "",
    dismissLabel: notice?.dismissLabel || "关闭",
    linkLabel: notice?.linkLabel || "",
    linkHref: notice?.linkHref || "",
    storageKey: notice?.storageKey || `tianho-opening-notice-${locale}-local`,
    dismissalMode: (notice?.dismissalMode as AdminNoticeFormValues["dismissalMode"]) || "session",
    status: (notice?.status as AdminNoticeFormValues["status"]) || "published",
    startAt: notice?.startAt ? formatSiteDate(notice.startAt) : "",
    endAt: notice?.endAt ? formatSiteDate(notice.endAt) : "",
  };
}
