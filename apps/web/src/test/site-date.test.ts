import { describe, expect, it } from "vitest";
import { formatSiteDate, siteDateInputToTimestamp } from "@/lib/site-date";

describe("site dates", () => {
  it("formats timestamps using the Japan calendar date", () => {
    expect(formatSiteDate("2026-08-09T15:00:00Z")).toBe("2026-08-10");
  });

  it("converts a date input to the start of that day in Japan", () => {
    expect(siteDateInputToTimestamp("2026-08-10")).toBe("2026-08-10T00:00:00+09:00");
    expect(siteDateInputToTimestamp("")).toBeNull();
  });
});
