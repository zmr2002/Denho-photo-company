import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserManagement } from "@/components/admin/UserManagement";
import { writeAdminApi } from "@/lib/api/browser";
import type { AdministratorUser } from "@/lib/api/admin";

vi.mock("@/lib/api/browser", () => ({
  adminResponseMessage: vi.fn((_response, fallback) => fallback),
  writeAdminApi: vi.fn(),
}));

const owner: AdministratorUser = { id: "owner", email: "owner@example.com", displayName: "负责人", role: "ADMIN", active: true, lastLoginAt: null, createdAt: "2026-08-01T00:00:00Z" };

describe("user management", () => {
  beforeEach(() => {
    vi.mocked(writeAdminApi).mockReset();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("creates an editor and clears sensitive input", async () => {
    const editor = { ...owner, id: "editor", email: "editor@example.com", displayName: "编辑", role: "EDITOR" as const };
    vi.mocked(writeAdminApi).mockResolvedValue(new Response(JSON.stringify(editor), { status: 201 }));
    render(<UserManagement currentUserId="owner" initialUsers={[owner]} />);
    fireEvent.change(screen.getByLabelText("显示名称"), { target: { value: "编辑" } });
    fireEvent.change(screen.getByLabelText("邮箱"), { target: { value: "editor@example.com" } });
    fireEvent.change(screen.getByLabelText(/初始密码/), { target: { value: "password8" } });
    fireEvent.click(screen.getByRole("button", { name: "创建账号" }));

    expect(await screen.findByText("editor@example.com")).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText(/初始密码/)).toHaveValue(""));
  });

  it("does not offer destructive controls for the current account", () => {
    render(<UserManagement currentUserId="owner" initialUsers={[owner]} />);
    expect(screen.getByText("不能在此修改自己的角色或停用自己")).toBeVisible();
    expect(screen.getByText("尚未登录")).toBeVisible();
    expect(screen.queryByText(/验证器|首次验证/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "停用账号" })).not.toBeInTheDocument();
  });
});
