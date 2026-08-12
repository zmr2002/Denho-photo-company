import { requireAdminSession } from "@/lib/auth/session";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="admin-shell" lang="zh">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-kicker">田豊管理后台</p>
          <h1>管理中心</h1>
          <div className="admin-account-summary">
            <strong>{session.displayName || session.email}</strong>
            <span>{session.role === "ADMIN" ? "管理员" : "编辑"}</span>
            {session.displayName ? <small>{session.email}</small> : null}
          </div>
        </div>
        <AdminNavigation />
        <AdminLogoutButton />
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
