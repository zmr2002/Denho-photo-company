import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

const adminLinks = [
  { href: "/studio-tianho", label: "控制台" },
  { href: "/studio-tianho/articles", label: "文章管理" },
  { href: "/studio-tianho/notice", label: "开场通知" },
  { href: "/studio-tianho/works", label: "作品图片" },
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="admin-shell" lang="zh">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-kicker">田豊管理后台</p>
          <h1>管理中心</h1>
          <p className="admin-user">{session.email}</p>
        </div>
        <nav aria-label="后台导航">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <AdminLogoutButton />
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
