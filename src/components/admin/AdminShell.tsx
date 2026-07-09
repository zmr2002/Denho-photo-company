import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";

const adminLinks = [
  { href: "/studio-tianho", label: "Dashboard" },
  { href: "/studio-tianho/articles", label: "Articles" },
  { href: "/studio-tianho/notice", label: "Opening Notice" },
  { href: "/studio-tianho/works", label: "Works Images" },
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-kicker">Tianho Admin</p>
          <h1>Studio</h1>
          <p className="admin-user">{session.user?.email}</p>
        </div>
        <nav aria-label="Admin navigation">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link className="admin-muted-link" href="/api/auth/signout">
          Sign out
        </Link>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
