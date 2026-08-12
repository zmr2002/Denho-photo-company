import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminArticleForm } from "@/components/admin/AdminArticleForm";
import { blankArticleFormValues } from "@/lib/admin/article-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("unsaved article preview", () => {
  it("renders current form values with the public article layout before saving", () => {
    const values = blankArticleFormValues();
    values.title = "保存前的标题";
    values.blocks[0].body = "保存前的正文";
    render(<AdminArticleForm defaultValues={values} />);

    fireEvent.change(screen.getByLabelText("文章标题"), { target: { value: "刚刚修改的标题" } });
    fireEvent.change(screen.getByLabelText("正文"), { target: { value: "刚刚修改的正文" } });
    fireEvent.click(screen.getByRole("button", { name: "预览当前稿" }));

    const preview = screen.getByRole("dialog", { name: "当前文章稿预览" });
    expect(preview).toHaveTextContent("刚刚修改的标题");
    expect(preview).toHaveTextContent("刚刚修改的正文");
    expect(preview.querySelector(".site-header")).toBeInTheDocument();
    expect(preview.querySelector(".site-footer")).toBeInTheDocument();
  });

  it("returns to editing with the escape key", () => {
    render(<AdminArticleForm defaultValues={blankArticleFormValues()} />);
    fireEvent.click(screen.getByRole("button", { name: "预览当前稿" }));
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "当前文章稿预览" })).not.toBeInTheDocument();
  });
});
