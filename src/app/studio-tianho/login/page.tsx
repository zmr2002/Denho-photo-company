import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/auth/session";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session?.user?.id) {
    redirect("/studio-tianho");
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <div>
          <p className="admin-kicker">Private admin</p>
          <h1 id="admin-login-title">Tianho Studio</h1>
          <p className="admin-user">Manual URL access only. Authentication is required.</p>
        </div>
        <AdminLoginForm />
      </section>
    </main>
  );
}
