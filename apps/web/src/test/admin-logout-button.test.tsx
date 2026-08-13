import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { writeAdminApi } from "@/lib/api/browser";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/lib/api/browser", () => ({
  adminResponseMessage: vi.fn((_response, fallback) => fallback),
  writeAdminApi: vi.fn(),
}));

describe("administration logout", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.mocked(writeAdminApi).mockReset();
  });

  it("keeps the current page and explains a failed logout", async () => {
    vi.mocked(writeAdminApi).mockResolvedValue(new Response(null, { status: 503 }));
    render(<AdminLogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("退出失败，请稍后重试。");
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "退出登录" })).toBeEnabled();
  });

  it("opens the login page after the session is cleared", async () => {
    vi.mocked(writeAdminApi).mockResolvedValue(new Response(null, { status: 204 }));
    render(<AdminLogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/studio-tianho/login"));
    expect(refresh).toHaveBeenCalled();
  });
});
