import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { blankArticleFormValues } from "@/lib/admin/article-form";
import { uploadAdminMedia } from "@/lib/api/browser";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/api/browser", () => ({
  uploadAdminMedia: vi.fn(),
  writeAdminApi: vi.fn(),
}));

describe("article media picker", () => {
  beforeEach(() => vi.mocked(uploadAdminMedia).mockReset());
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

  it("explains when the media library cannot be loaded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<AdminArticleForm defaultValues={blankArticleFormValues()} />);
    fireEvent.click(within(screen.getByLabelText("添加文章内容")).getByRole("button", { name: "图片" }));
    fireEvent.click(screen.getByRole("button", { name: "从媒体库选择" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("无法读取媒体库，请确认服务已启动后重试。");
    expect(screen.getByRole("button", { name: "取消" })).toBeEnabled();
  });

  it("uploads and selects a new image without leaving the editor", async () => {
    const uploadedAsset = {
      id: "media-new",
      originalFilename: "new-photo.png",
      contentType: "image/png",
      byteSize: 2048,
      width: 1200,
      height: 800,
      sha256: "new-digest",
      status: "ACTIVE" as const,
      url: "/media/original/media-new.png",
      thumbnailUrl: "/media/thumbnail/media-new.png",
      referenceCount: 0,
      trashedAt: null,
      purgeAfter: null,
      createdAt: "2026-08-14T00:00:00Z",
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    vi.mocked(uploadAdminMedia).mockResolvedValue({
      response: new Response(JSON.stringify(uploadedAsset), { status: 201, headers: { "Content-Type": "application/json" } }),
      validationMessage: null,
    });
    render(<AdminArticleForm defaultValues={blankArticleFormValues()} />);
    fireEvent.click(within(screen.getByLabelText("添加文章内容")).getByRole("button", { name: "图片" }));
    fireEvent.click(screen.getByRole("button", { name: "从媒体库选择" }));

    const picker = await screen.findByRole("dialog", { name: "从媒体库选择图片" });
    const file = new File(["image"], "new-photo.png", { type: "image/png" });
    fireEvent.change(within(picker).getByLabelText("选择要上传的图片"), { target: { files: [file] } });
    fireEvent.click(within(picker).getByRole("button", { name: "上传并使用" }));

    await waitFor(() => expect(uploadAdminMedia).toHaveBeenCalledWith(file));
    expect(screen.getByLabelText("图片路径")).toHaveValue("/media/original/media-new.png");
    expect(within(screen.getAllByRole("article")[1]).getByLabelText("图片内容说明")).toHaveValue("new-photo.png");
    expect(screen.queryByRole("dialog", { name: "从媒体库选择图片" })).not.toBeInTheDocument();
  });
});
