import { AdminShell } from "@/components/admin/AdminShell";
import { InquiryList } from "@/components/admin/InquiryList";
import { getInquiries, type Inquiry } from "@/lib/api/admin";

const statuses: Inquiry["status"][] = ["NEW", "IN_PROGRESS", "CLOSED", "SPAM", "ANONYMIZED"];

export default async function AdminInquiriesPage() {
  const groupedInquiries = await Promise.all(statuses.map((status) => getInquiries(status)));
  const inquiries = groupedInquiries.flat();

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
        <InquiryList inquiries={inquiries} />
      </section>
    </AdminShell>
  );
}
