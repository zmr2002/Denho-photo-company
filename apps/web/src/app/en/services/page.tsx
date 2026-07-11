import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getServicesPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const content = getServicesPageContent("en");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="en" page="services" currentPath="/en/services/">
      <ServicesPage content={content} basePath="/en" />
    </SiteLayout>
  );
}
