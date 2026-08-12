import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleWorklist } from "@/components/admin/ArticleWorklist";
import type { AdminArticle } from "@/lib/api/admin";

const articles = [
  { id: "1", title: "日语草稿", slug: "japanese-draft", category: "记录", locale: "ja", status: "draft" },
  { id: "2", title: "中文公告", slug: "chinese-notice", category: "通知", locale: "zh", status: "published" },
] as AdminArticle[];

describe("article worklist", () => {
  it("searches and filters without another request", () => {
    render(<ArticleWorklist articles={articles} />);
    expect(screen.getByRole("status")).toHaveTextContent("显示 2 / 2 篇文章");

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索" }), { target: { value: "公告" } });
    expect(screen.getByText("中文公告")).toBeVisible();
    expect(screen.queryByText("日语草稿")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "状态" }), { target: { value: "draft" } });
    expect(screen.getByText("没有符合当前搜索和筛选条件的文章。")).toBeVisible();
  });
});
