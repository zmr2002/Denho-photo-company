import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
    vi.stubGlobal("fetch", vi.fn());
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

  it("selects a work image directly from the media library", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([
      {
        id: "media-1",
        originalFilename: "selected.jpg",
        contentType: "image/jpeg",
        byteSize: 1200,
        width: 1200,
        height: 800,
        sha256: "hash",
        status: "ACTIVE",
        url: "/api/v1/public/media/media-1",
        thumbnailUrl: "/api/v1/public/media/media-1?variant=thumbnail",
        referenceCount: 0,
        trashedAt: null,
        purgeAfter: null,
        createdAt: "2026-08-13T00:00:00Z",
      },
    ]), { status: 200 }));

    render(
      <AdminWorkImagesForm
        contentVersion={3}
        defaultValues={{ galleryEnabled: true, mediaType: "gallery", images: [] }}
        workId="work-1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "从媒体库添加图片" }));
    const picker = await screen.findByRole("dialog", { name: "从媒体库选择图片" });
    fireEvent.click(await within(picker).findByRole("button", { name: /selected\.jpg/ }));

    expect(screen.getByDisplayValue("/api/v1/public/media/media-1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("selected.jpg")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "从媒体库选择图片" })).not.toBeInTheDocument();
  });
});
