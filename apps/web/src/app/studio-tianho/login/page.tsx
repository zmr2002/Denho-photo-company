import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/auth/session";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session?.user?.id) {
    redirect("/studio-tianho");
  }

  return (
    <main className="admin-login-page" lang="zh">
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <div>
          <p className="admin-kicker">私有管理后台</p>
          <h1 id="admin-login-title">田豊管理中心</h1>
          <p className="admin-user">仅通过手动输入网址访问。必须登录后使用。</p>
        </div>
        <AdminLoginForm />
      </section>
    </main>
  );
}
