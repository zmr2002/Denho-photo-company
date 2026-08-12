import Link from "next/link";
import { AdminNoticeForm, type AdminNoticeFormValues } from "@/components/admin/AdminNoticeForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { localeLabel } from "@/lib/admin/labels";
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
          <p>临时公告、休假通知、活动提醒、重要营业信息。通知内容应短，避免放复杂文章。</p>
        </div>
        <div className="admin-grid">
          {locales.map((locale) => {
            const notice = notices.find((item) => item.locale === locale);
            return (
              <article className="admin-card" key={locale}>
                <div className="admin-card-heading">
                  <p className="admin-label">{localeLabel(locale)}</p>
                  {notice ? (
                    <Link
                      className="admin-button-secondary"
                      href={`/studio-tianho/preview/notices/${locale}/`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      预览通知
                    </Link>
                  ) : (
                    <span className="admin-help">保存后可预览</span>
                  )}
                </div>
                <AdminNoticeForm contentVersion={notice?.version ?? 0} defaultValues={noticeToFormValues(locale, notice)} />
              </article>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
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
