import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Tianho Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
