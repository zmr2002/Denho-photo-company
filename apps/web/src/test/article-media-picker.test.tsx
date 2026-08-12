import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { blankArticleFormValues } from "@/lib/admin/article-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("article media picker", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("selects an active media asset without copying a path", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "media-1",
        originalFilename: "studio-photo.jpg",
        contentType: "image/jpeg",
        byteSize: 1024,
        width: 1600,
        height: 900,
        sha256: "digest",
        status: "ACTIVE",
        url: "/media/original/media-1.jpg",
        thumbnailUrl: "/media/thumbnail/media-1.jpg",
        referenceCount: 0,
        trashedAt: null,
        purgeAfter: null,
        createdAt: "2026-08-13T00:00:00Z",
      }],
    }));
    render(<AdminArticleForm defaultValues={blankArticleFormValues()} />);
    fireEvent.click(within(screen.getByLabelText("添加文章内容")).getByRole("button", { name: "图片" }));
    fireEvent.click(screen.getByRole("button", { name: "从媒体库选择" }));

    const picker = await screen.findByRole("dialog", { name: "从媒体库选择图片" });
    fireEvent.click(await within(picker).findByRole("button", { name: /studio-photo\.jpg/ }));

    await waitFor(() => expect(screen.getByLabelText("图片路径")).toHaveValue("/media/original/media-1.jpg"));
    expect(within(screen.getAllByRole("article")[1]).getByLabelText("图片内容说明")).toHaveValue("studio-photo.jpg");
    expect(screen.queryByRole("dialog", { name: "从媒体库选择图片" })).not.toBeInTheDocument();
  });
});
