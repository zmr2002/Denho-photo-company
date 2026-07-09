import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getServicesPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const content = getServicesPageContent("ja");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="ja" page="services" currentPath="/ja/services/">
      <ServicesPage content={content} basePath="/ja" />
    </SiteLayout>
  );
}
