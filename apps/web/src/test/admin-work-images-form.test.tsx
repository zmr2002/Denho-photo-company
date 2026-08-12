import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminWorkImagesForm } from "@/components/admin/AdminWorkImagesForm";
import { writeAdminApi } from "@/lib/api/browser";

const router = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/api/browser", () => ({
  adminResponseMessage: vi.fn(),
  writeAdminApi: vi.fn(),
}));

describe("work image editor", () => {
  beforeEach(() => {
    router.refresh.mockReset();
    vi.mocked(writeAdminApi).mockReset();
  });

  it("shows the cover selection error before sending invalid images", async () => {
    render(
      <AdminWorkImagesForm
        contentVersion={3}
        defaultValues={{
          galleryEnabled: true,
          mediaType: "gallery",
          images: [
            {
              path: "/media/original/one.jpg",
              label: "One",
              tone: "neutral",
              altJa: "",
              altZh: "",
              altEn: "",
              captionJa: "",
              captionZh: "",
              captionEn: "",
              isCover: false,
              sortOrder: 0,
            },
          ],
        }}
        workId="work-1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "保存图片" }));

    expect(await screen.findByText("请选择且只能选择一张封面图片。")).toBeVisible();
    await waitFor(() => expect(writeAdminApi).not.toHaveBeenCalled());
  });
});
