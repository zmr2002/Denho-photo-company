import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InquiryList } from "@/components/admin/InquiryList";
import { writeAdminApi } from "@/lib/api/browser";
import type { Inquiry } from "@/lib/api/admin";

const router = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/api/browser", () => ({
  adminResponseMessage: vi.fn((_response, fallback) => fallback),
  writeAdminApi: vi.fn(),
}));

const inquiries: Inquiry[] = [
  inquiry({ id: "one", nameCompany: "山田写真", email: "photo@example.com", status: "NEW" }),
  inquiry({ id: "two", nameCompany: "田中商事", email: "event@example.com", status: "IN_PROGRESS" }),
];

describe("inquiry workspace", () => {
  beforeEach(() => {
    router.refresh.mockReset();
    vi.mocked(writeAdminApi).mockReset();
  });

  it("filters inquiries by status and search term", () => {
    render(<InquiryList inquiries={inquiries} />);
    expect(screen.getByText("山田写真")).toBeVisible();
    expect(screen.queryByText("田中商事")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "处理中 1" }));
    expect(screen.getByText("田中商事")).toBeVisible();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "不存在" } });
    expect(screen.getByText("当前分类没有符合条件的咨询。")).toBeVisible();
  });

  it("moves an inquiry to its updated status after a successful action", async () => {
    vi.mocked(writeAdminApi).mockResolvedValue(new Response(JSON.stringify({ ...inquiries[0], status: "IN_PROGRESS" }), { status: 200 }));
    render(<InquiryList inquiries={inquiries} />);

    fireEvent.click(screen.getByRole("button", { name: "开始处理" }));

    await waitFor(() => expect(screen.queryByText("山田写真")).not.toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("已将咨询更新为“处理中”。");
    expect(router.refresh).toHaveBeenCalled();
  });
});

function inquiry(values: Partial<Inquiry>): Inquiry {
  return {
    id: "inquiry",
    nameCompany: "名称",
    email: "mail@example.com",
    projectType: "摄影",
    requestedDate: null,
    location: null,
    message: "咨询内容",
    locale: "ja",
    status: "NEW",
    consentVersion: "v1",
    consentedAt: "2026-08-13T00:00:00Z",
    createdAt: "2026-08-13T00:00:00Z",
    updatedAt: "2026-08-13T00:00:00Z",
    ...values,
  };
}
