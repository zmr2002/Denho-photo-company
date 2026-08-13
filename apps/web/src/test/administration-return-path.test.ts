import { describe, expect, it } from "vitest";
import { administrationLoginPath, safeAdministrationReturnPath } from "@/lib/auth/return-path";

describe("administration return paths", () => {
  it("preserves an internal administration page and query", () => {
    const path = "/studio-tianho/articles/123/?panel=history";
    expect(safeAdministrationReturnPath(path)).toBe(path);
    expect(administrationLoginPath(path)).toBe(
      "/studio-tianho/login?returnTo=%2Fstudio-tianho%2Farticles%2F123%2F%3Fpanel%3Dhistory",
    );
  });

  it.each([
    "https://example.com/studio-tianho",
    "//example.com/studio-tianho",
    "/studio-tianho-outside",
    "/studio-tianho/login",
  ])("rejects unsafe or recursive destinations: %s", (path) => {
    expect(safeAdministrationReturnPath(path)).toBe("/studio-tianho");
    expect(administrationLoginPath(path)).toBe("/studio-tianho/login");
  });
});
