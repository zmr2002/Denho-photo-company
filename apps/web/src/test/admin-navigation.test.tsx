import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

const navigation = vi.hoisted(() => ({ pathname: "/studio-tianho/articles/article-1" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

describe("administration navigation", () => {
  it("marks the parent section for a nested page", () => {
    navigation.pathname = "/studio-tianho/articles/article-1";
    render(<AdminNavigation />);

    expect(screen.getByRole("link", { name: "文章管理" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "控制台" })).not.toHaveAttribute("aria-current");
  });

  it("only marks the dashboard on its exact path", () => {
    navigation.pathname = "/studio-tianho";
    render(<AdminNavigation />);

    expect(screen.getByRole("link", { name: "控制台" })).toHaveAttribute("aria-current", "page");
  });
});
