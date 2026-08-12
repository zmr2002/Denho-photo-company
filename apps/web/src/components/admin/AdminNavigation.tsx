"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/studio-tianho", label: "控制台" },
  { href: "/studio-tianho/articles", label: "文章管理" },
  { href: "/studio-tianho/notice", label: "开场通知" },
  { href: "/studio-tianho/works", label: "作品图片" },
  { href: "/studio-tianho/media", label: "媒体库" },
  { href: "/studio-tianho/inquiries", label: "咨询管理" },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="后台导航">
      {adminLinks.map((link) => {
        const active = link.href === "/studio-tianho" ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link className={active ? "admin-nav-link-active" : undefined} key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
