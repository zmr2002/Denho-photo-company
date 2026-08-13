import { describe, expect, it } from "vitest";
import { validateMediaFile } from "@/lib/api/browser";

describe("media upload validation", () => {
  it("accepts JPEG and PNG files within the size limit", () => {
    expect(validateMediaFile({ type: "image/jpeg", size: 1024 })).toBeNull();
    expect(validateMediaFile({ type: "image/png", size: 15 * 1024 * 1024 })).toBeNull();
  });

  it("rejects unsupported formats and oversized files before upload", () => {
    expect(validateMediaFile({ type: "image/gif", size: 1024 })).toBe("只能上传 JPEG 或 PNG 图片。");
    expect(validateMediaFile({ type: "image/jpeg", size: 15 * 1024 * 1024 + 1 })).toBe("图片不能超过 15 MB。");
  });
});
