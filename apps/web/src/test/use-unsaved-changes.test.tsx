import { fireEvent, render, screen } from "@testing-library/react";
import Link from "next/link";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { useUnsavedChanges } from "@/lib/admin/useUnsavedChanges";

function Example() {
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  return (
    <div>
      <button onClick={() => setDirty(true)} type="button">修改</button>
      <Link href="/studio-tianho/articles">离开</Link>
    </div>
  );
}

describe("unsaved administration changes", () => {
  it("asks before following an administration link", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "修改" }));

    const allowed = fireEvent.click(screen.getByRole("link", { name: "离开" }));

    expect(allowed).toBe(false);
    expect(confirm).toHaveBeenCalledWith("还有未保存的修改，确定要离开当前页面吗？");
  });

  it("marks a browser unload as needing confirmation", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "修改" }));
    const event = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
