import { describe, expect, it } from "vitest";
import { summarizeAdministrationTasks } from "@/lib/admin/dashboard";
import type { AdminArticle, AdminNotice, AdminWork, Inquiry } from "@/lib/api/admin";

describe("administration dashboard summary", () => {
  it("counts actionable content and only currently visible notices", () => {
    const articles = [article("DRAFT"), article("PUBLISHED")];
    const notices = [
      notice({ enabled: true, status: "PUBLISHED", startAt: "2026-08-01T00:00:00Z", endAt: "2026-08-31T00:00:00Z" }),
      notice({ enabled: true, status: "PUBLISHED", startAt: "2026-09-01T00:00:00Z" }),
    ];
    const works = [work([]), work([{ isCover: false }]), work([{ isCover: true }])];
    const inquiries = [{ status: "NEW" }, { status: "CLOSED" }] as Inquiry[];

    expect(summarizeAdministrationTasks(articles, notices, works, inquiries, new Date("2026-08-13T00:00:00Z"))).toEqual({
      draftArticles: 1,
      publishedArticles: 1,
      visibleNotices: 1,
      worksNeedingImages: 2,
      newInquiries: 1,
    });
  });
});

function article(status: string) {
  return { status } as AdminArticle;
}

function notice(values: Partial<AdminNotice>) {
  return { enabled: false, status: "DRAFT", startAt: null, endAt: null, ...values } as AdminNotice;
}

function work(images: Array<{ isCover: boolean }>) {
  return { galleryEnabled: true, images } as AdminWork;
}
