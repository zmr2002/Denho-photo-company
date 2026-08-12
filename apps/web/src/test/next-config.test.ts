import { afterEach, describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

const originalApiUrl = process.env.API_INTERNAL_URL;

afterEach(() => {
  if (originalApiUrl === undefined) {
    delete process.env.API_INTERNAL_URL;
  } else {
    process.env.API_INTERNAL_URL = originalApiUrl;
  }
});

describe("Next.js request rewrites", () => {
  it("routes API and managed media requests to the configured internal API", async () => {
    process.env.API_INTERNAL_URL = "http://api:8080";

    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toEqual([
      { source: "/api/v1/:path*", destination: "http://api:8080/api/v1/:path*" },
      { source: "/media/:path*", destination: "http://api:8080/api/v1/public/media/:path*" },
    ]);
  });

  it("uses the local API when no internal address is configured", async () => {
    delete process.env.API_INTERNAL_URL;

    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toContainEqual({
      source: "/media/:path*",
      destination: "http://127.0.0.1:8080/api/v1/public/media/:path*",
    });
  });
});
