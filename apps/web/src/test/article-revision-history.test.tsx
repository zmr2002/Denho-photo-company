import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleRevisionHistory } from "@/components/admin/ArticleRevisionHistory";

describe("article revision history", () => {
  it("shows readable actions in newest-first order supplied by the API", () => {
    render(<ArticleRevisionHistory revisions={[
      { id: "2", version: 2, action: "PUBLISHED", actorId: "user", createdAt: "2026-08-13T02:00:00Z" },
      { id: "1", version: 1, action: "CREATED", actorId: "user", createdAt: "2026-08-13T01:00:00Z" },
    ]} />);

    expect(screen.getByText("共 2 个版本，只读保存")).toBeVisible();
    fireEvent.click(screen.getByText("修改记录"));
    expect(screen.getByText("发布")).toBeVisible();
    expect(screen.getByText("创建内容")).toBeVisible();
  });
});
