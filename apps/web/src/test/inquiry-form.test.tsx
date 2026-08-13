import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { contactPageContent } from "@/data/pages";
import { getCsrfHeaders } from "@/lib/api/browser";

vi.mock("@/lib/api/browser", () => ({
  getCsrfHeaders: vi.fn(),
}));

describe("inquiry form", () => {
  beforeEach(() => {
    vi.mocked(getCsrfHeaders).mockResolvedValue({ "X-CSRF-TOKEN": "token" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network unavailable")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("recovers after a network interruption without locking the form", async () => {
    render(<InquiryForm content={contactPageContent.zh.form} locale="zh" />);

    fireEvent.submit(screen.getByRole("form"));

    expect(await screen.findByText("网络连接中断，内容尚未提交，请稍后重试。")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("button", { name: contactPageContent.zh.form.buttonLabel })).toBeEnabled());
  });

});
