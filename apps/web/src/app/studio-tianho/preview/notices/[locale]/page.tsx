import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { adminNoticeToPreview } from "@/lib/admin/notice-preview";
import { getAdminCollection, type AdminNotice } from "@/lib/api/admin";
import { requireAdminSession } from "@/lib/auth/session";
import { getHomePageContent, isSupportedLocale } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "开场通知预览",
  robots: { index: false, follow: false, nocache: true },
};

type PreviewPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NoticePreviewPage({ params }: PreviewPageProps) {
  await requireAdminSession();
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const notices = await getAdminCollection<AdminNotice>("notices");
  const storedNotice = notices.find((notice) => notice.locale === locale);
  if (!storedNotice) notFound();

  return (
    <SiteLayout
      lang={locale}
      page="home"
      currentPath={`/${locale}/`}
      openingNoticeOverride={adminNoticeToPreview(storedNotice)}
      forceOpeningNotice
    >
      <HomePage content={await getHomePageContent(locale)} basePath={`/${locale}`} />
    </SiteLayout>
  );
}