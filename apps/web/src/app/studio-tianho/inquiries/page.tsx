import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { InquiryList } from "@/components/admin/InquiryList";
import { getInquiries, type Inquiry } from "@/lib/api/admin";

const filters: Array<{ status: Inquiry["status"]; label: string }> = [
  { status: "NEW", label: "新咨询" },
  { status: "IN_PROGRESS", label: "处理中" },
  { status: "CLOSED", label: "已完成" },
  { status: "SPAM", label: "垃圾咨询" },
  { status: "ANONYMIZED", label: "已匿名化" },
];

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const requestedStatus = (await searchParams).status?.toUpperCase();
  const status = filters.some((filter) => filter.status === requestedStatus)
    ? requestedStatus as Inquiry["status"]
    : "NEW";
  const inquiries = await getInquiries(status);

  return (
    <AdminShell>
      <section className="admin-page">
        <header className="admin-page-header">
          <div>
            <p className="admin-kicker">联系咨询</p>
            <h2>咨询管理</h2>
            <p className="admin-help">查看网站提交的咨询并记录处理进度。咨询资料将在 180 天后自动匿名化。</p>
          </div>
        </header>
        <nav aria-label="咨询状态" className="admin-actions">
          {filters.map((filter) => (
            <Link
              aria-current={status === filter.status ? "page" : undefined}
              className={status === filter.status ? "admin-button" : "admin-button-secondary"}
              href={`/studio-tianho/inquiries?status=${filter.status}`}
              key={filter.status}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
        <InquiryList inquiries={inquiries} />
      </section>
    </AdminShell>
  );
}
