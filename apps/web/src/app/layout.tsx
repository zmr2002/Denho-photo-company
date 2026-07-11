import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
