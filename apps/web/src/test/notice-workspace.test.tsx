import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NoticeWorkspace } from "@/components/admin/NoticeWorkspace";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const values = {
  enabled: true,
  label: "通知",
  title: "标题",
  body: "正文",
  dismissLabel: "关闭",
  linkLabel: "",
  linkHref: "",
  storageKey: "notice-test",
  dismissalMode: "session" as const,
  status: "published" as const,
  startAt: "",
  endAt: "",
};

describe("notice workspace", () => {
  it("shows one language at a time and keeps the visitor state clear", () => {
    render(
      <NoticeWorkspace
        entries={[
          { locale: "ja", noticeId: "ja-1", version: 1, visitorState: "当前访客可以看到", defaultValues: { ...values, locale: "ja" } },
          { locale: "zh", noticeId: null, version: 0, visitorState: "尚未保存", defaultValues: { ...values, locale: "zh" } },
        ]}
      />,
    );

    expect(screen.getByRole("tabpanel", { name: "日语页面（ja）" })).toBeVisible();
    expect(screen.getByText("当前访客可以看到")).toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "中文页面（zh）" }));

    expect(screen.getByRole("tabpanel", { name: "中文页面（zh）" })).toBeVisible();
    expect(screen.getByText("尚未保存")).toBeVisible();
    expect(screen.getByText("首次保存后可预览")).toBeVisible();
  });
});
