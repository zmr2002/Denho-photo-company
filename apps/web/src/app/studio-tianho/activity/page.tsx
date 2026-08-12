import { notFound } from "next/navigation";
import { ActivityHistory } from "@/components/admin/ActivityHistory";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/auth/session";
import { getAuditEvents } from "@/lib/api/admin";

export default async function AdministrationActivityPage() {
  const session = await requireAdminSession();
  if (session.role !== "ADMIN") notFound();
  const events = await getAuditEvents();

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">审计与追溯</p>
            <h2>操作记录</h2>
            <p className="admin-help">查看最近 100 条重要操作，确认由谁在何时修改了内容、咨询、媒体或账号。</p>
          </div>
        </header>
        <ActivityHistory events={events} />
      </section>
    </AdminShell>
  );
}
