import { AdminNoticeForm, type AdminNoticeFormValues } from "@/components/admin/AdminNoticeForm";
import { AdminShell } from "@/components/admin/AdminShell";
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
            <p className="admin-kicker">Opening notice</p>
            <h2>Popup notices</h2>
          </div>
        </header>
        <div className="admin-grid">
          {locales.map((locale) => {
            const notice = notices.find((item) => item.locale === locale);
            return (
              <article className="admin-card" key={locale}>
                <p className="admin-label">{locale}</p>
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
    label: notice?.label || "Notice",
    title: notice?.title || "",
    body: notice?.body || "",
    dismissLabel: notice?.dismissLabel || "Dismiss",
    linkLabel: notice?.linkLabel || "",
    linkHref: notice?.linkHref || "",
    storageKey: notice?.storageKey || `tianho-opening-notice-${locale}-local`,
    dismissalMode: (notice?.dismissalMode as AdminNoticeFormValues["dismissalMode"]) || "session",
    status: (notice?.status as AdminNoticeFormValues["status"]) || "published",
    startAt: notice?.startAt ? notice.startAt.toISOString().slice(0, 10) : "",
    endAt: notice?.endAt ? notice.endAt.toISOString().slice(0, 10) : "",
  };
}
