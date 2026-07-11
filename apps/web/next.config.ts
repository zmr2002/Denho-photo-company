import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    const apiUrl = process.env.API_INTERNAL_URL || "http://127.0.0.1:8080";
    return [
      { source: "/api/v1/:path*", destination: `${apiUrl}/api/v1/:path*` },
      { source: "/media/:path*", destination: `${apiUrl}/api/v1/public/media/:path*` },
    ];
  },
};

export default nextConfig;
