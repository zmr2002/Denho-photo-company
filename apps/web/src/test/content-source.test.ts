import { describe, expect, it } from "vitest";
import { resolveContentSource } from "@/lib/content/source";

describe("resolveContentSource", () => {
  it("uses the public API by default", () => {
    expect(resolveContentSource(undefined)).toBe("api");
    expect(resolveContentSource("")).toBe("api");
    expect(resolveContentSource("api")).toBe("api");
  });

  it("allows mock content only when explicitly selected", () => {
    expect(resolveContentSource("mock")).toBe("mock");
  });

  it("rejects legacy or misspelled providers", () => {
    expect(() => resolveContentSource("db")).toThrow("Unsupported CONTENT_PROVIDER value");
    expect(() => resolveContentSource("production")).toThrow("Unsupported CONTENT_PROVIDER value");
  });
});
