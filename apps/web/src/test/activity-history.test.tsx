import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityHistory } from "@/components/admin/ActivityHistory";
import type { AuditEvent } from "@/lib/api/admin";

const events: AuditEvent[] = [
  { id: "one", eventType: "CONTENT_PUBLISHED", resourceType: "ARTICLE", resourceId: "article-1", actorDisplayName: "负责人", occurredAt: "2026-08-13T00:00:00Z" },
  { id: "two", eventType: "INQUIRY_NOTE_ADDED", resourceType: "INQUIRY", resourceId: "inquiry-1", actorDisplayName: "编辑", occurredAt: "2026-08-13T01:00:00Z" },
];

describe("activity history", () => {
  it("filters recent events by resource and operator", () => {
    render(<ActivityHistory events={events} />);
    expect(screen.getByText(/发布内容/)).toBeVisible();
    expect(screen.getByText(/新增咨询处理记录/)).toBeVisible();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "INQUIRY" } });
    expect(screen.queryByText(/发布内容/)).not.toBeInTheDocument();
    expect(screen.getByText(/新增咨询处理记录/)).toBeVisible();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "不存在" } });
    expect(screen.getByText("没有符合条件的操作记录。")).toBeVisible();
  });
});
