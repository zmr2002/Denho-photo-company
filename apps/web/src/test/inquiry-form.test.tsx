import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { contactPageContent } from "@/data/pages";
import { getCsrfHeaders } from "@/lib/api/browser";

const scriptCallbacks = vi.hoisted(() => ({
  onError: undefined as (() => void) | undefined,
}));

vi.mock("next/script", () => ({
  default: ({ onError }: { onError?: () => void }) => {
    scriptCallbacks.onError = onError;
    return null;
  },
}));

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
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  });

  it("recovers after a network interruption without locking the form", async () => {
    render(<InquiryForm content={contactPageContent.zh.form} locale="zh" />);

    fireEvent.submit(screen.getByRole("form"));

    expect(await screen.findByText("网络连接中断，内容尚未提交，请稍后重试。")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("button", { name: contactPageContent.zh.form.buttonLabel })).toBeEnabled());
  });

  it("explains when the security check script cannot load", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    render(<InquiryForm content={contactPageContent.zh.form} locale="zh" />);

    scriptCallbacks.onError?.();

    expect(await screen.findByText("安全验证组件加载失败。请刷新页面；如果启用了广告拦截，请暂时关闭后重试。")).toBeVisible();
    expect(screen.getByRole("button", { name: contactPageContent.zh.form.buttonLabel })).toBeDisabled();
  });
});
