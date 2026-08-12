import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InquiryNotes } from "@/components/admin/InquiryNotes";
import { writeAdminApi } from "@/lib/api/browser";

vi.mock("@/lib/api/browser", () => ({
  adminResponseMessage: vi.fn((_response, fallback) => fallback),
  writeAdminApi: vi.fn(),
}));

describe("inquiry notes", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(writeAdminApi).mockReset();
  });

  it("loads notes only after the operator opens the section", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([
      { id: "note-1", body: "已回复邮件", actorDisplayName: "管理员", createdAt: "2026-08-13T00:00:00Z" },
    ]), { status: 200 }));
    render(<InquiryNotes inquiryId="inquiry-1" />);
    expect(fetch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "查看处理记录" }));

    expect(await screen.findByText("已回复邮件")).toBeVisible();
    expect(fetch).toHaveBeenCalledWith("/api/v1/admin/inquiries/inquiry-1/notes", { credentials: "same-origin" });
  });

  it("adds a note and clears the editor", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    vi.mocked(writeAdminApi).mockResolvedValue(new Response(JSON.stringify(
      { id: "note-2", body: "等待日期确认", actorDisplayName: "编辑", createdAt: "2026-08-13T01:00:00Z" },
    ), { status: 201 }));
    render(<InquiryNotes inquiryId="inquiry-1" />);
    fireEvent.click(screen.getByRole("button", { name: "查看处理记录" }));
    await screen.findByText("还没有处理记录。");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "等待日期确认" } });
    fireEvent.click(screen.getByRole("button", { name: "保存记录" }));

    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(""));
    expect(screen.getByText("等待日期确认")).toBeVisible();
    expect(writeAdminApi).toHaveBeenCalledWith("/api/v1/admin/inquiries/inquiry-1/notes", "POST", { body: "等待日期确认" });
  });
});
