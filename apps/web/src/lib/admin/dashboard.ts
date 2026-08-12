import type { AdminArticle, AdminNotice, AdminWork, Inquiry } from "@/lib/api/admin";

export type AdministrationTaskSummary = {
  draftArticles: number;
  publishedArticles: number;
  visibleNotices: number;
  worksNeedingImages: number;
  newInquiries: number;
};

export function summarizeAdministrationTasks(
  articles: AdminArticle[],
  notices: AdminNotice[],
  works: AdminWork[],
  inquiries: Inquiry[],
  now = new Date(),
): AdministrationTaskSummary {
  return {
    draftArticles: articles.filter((article) => normalizedStatus(article.status) === "DRAFT").length,
    publishedArticles: articles.filter((article) => normalizedStatus(article.status) === "PUBLISHED").length,
    visibleNotices: notices.filter((notice) => isNoticeVisible(notice, now)).length,
    worksNeedingImages: works.filter((work) => work.galleryEnabled && (work.images.length === 0 || !work.images.some((image) => image.isCover))).length,
    newInquiries: inquiries.filter((inquiry) => inquiry.status === "NEW").length,
  };
}

function isNoticeVisible(notice: AdminNotice, now: Date) {
  if (!notice.enabled || normalizedStatus(notice.status) !== "PUBLISHED") return false;
  const time = now.getTime();
  const startsBeforeNow = !notice.startAt || new Date(notice.startAt).getTime() <= time;
  const endsAfterNow = !notice.endAt || new Date(notice.endAt).getTime() >= time;
  return startsBeforeNow && endsAfterNow;
}

function normalizedStatus(status: string) {
  return status.toUpperCase();
}
