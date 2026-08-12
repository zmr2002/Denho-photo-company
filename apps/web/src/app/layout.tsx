import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: {
    default: `${site.name} | 写真・映像制作`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await headers()).get("x-site-locale");
  const language = locale === "zh" || locale === "en" ? locale : "ja";
  return (
    <html lang={language}>
      <body>{children}</body>
    </html>
  );
}
