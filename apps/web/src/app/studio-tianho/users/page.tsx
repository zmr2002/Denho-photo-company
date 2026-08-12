import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserManagement } from "@/components/admin/UserManagement";
import { requireAdminSession } from "@/lib/auth/session";
import { getAdministratorUsers } from "@/lib/api/admin";

export default async function AdministratorUsersPage() {
  const session = await requireAdminSession();
  if (session.role !== "ADMIN" || !session.userId) notFound();
  const users = await getAdministratorUsers();

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">权限与登录</p>
            <h2>账号管理</h2>
            <p className="admin-help">创建后台账号、分配管理员或编辑权限，并在人员变动时立即停用访问。</p>
          </div>
        </header>
        <div className="admin-info-box">
          <strong>权限说明</strong>
          <p>编辑可维护草稿、媒体和咨询；管理员还可发布内容、管理账号和查看操作记录。新账号首次登录时完成验证器绑定。</p>
        </div>
        <UserManagement currentUserId={session.userId} initialUsers={users} />
      </section>
    </AdminShell>
  );
}
