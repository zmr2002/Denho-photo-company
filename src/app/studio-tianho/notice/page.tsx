import { AdminNoticeForm, type AdminNoticeFormValues } from "@/components/admin/AdminNoticeForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { localeLabel } from "@/lib/admin/labels";
import { prisma } from "@/lib/db/prisma";

const locales = ["ja", "zh", "en"] as const;

export default async function AdminNoticePage() {
  const notices = await prisma.openingNotice.findMany({
    orderBy: { locale: "asc" },
  });

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">开场通知</p>
            <h2>弹窗通知</h2>
            <p className="admin-help">开启后，访客第一次打开网站时会看到通知弹窗；关闭后，通知不会显示。</p>
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
                <p className="admin-label">{localeLabel(locale)}</p>
                <AdminNoticeForm defaultValues={noticeToFormValues(locale, notice)} />
              </article>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}

function noticeToFormValues(locale: (typeof locales)[number], notice?: Awaited<ReturnType<typeof prisma.openingNotice.findMany>>[number]): AdminNoticeFormValues {
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
    startAt: notice?.startAt ? notice.startAt.toISOString().slice(0, 10) : "",
    endAt: notice?.endAt ? notice.endAt.toISOString().slice(0, 10) : "",
  };
}
