import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminActionFeedback, useAdministrationAction } from "@/components/admin/AdminActionFeedback";

function Example({ operation }: { operation: () => Promise<void> }) {
  const { feedback, pending, run, showSuccess } = useAdministrationAction();
  return (
    <div>
      <button disabled={pending} onClick={() => run(async () => {
        await operation();
        showSuccess("操作完成。");
      })} type="button">
        {pending ? "处理中" : "开始"}
      </button>
      <AdminActionFeedback feedback={feedback} />
    </div>
  );
}

describe("administration action feedback", () => {
  it("shows a consistent success message", async () => {
    render(<Example operation={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByRole("button", { name: "开始" }));

    expect(await screen.findByRole("status")).toHaveTextContent("操作完成。");
  });

  it("recovers from an unexpected request failure", async () => {
    render(<Example operation={vi.fn().mockRejectedValue(new Error("offline"))} />);
    fireEvent.click(screen.getByRole("button", { name: "开始" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("操作没有完成，请检查连接后重试。");
    await waitFor(() => expect(screen.getByRole("button", { name: "开始" })).toBeEnabled());
  });
});
