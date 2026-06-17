import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { servicesPageContent } from "@/data/pages";

export const metadata: Metadata = {
  title: servicesPageContent.zh.metaTitle,
  description: servicesPageContent.zh.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="zh" page="services" currentPath="/zh/services/">
      <ServicesPage content={servicesPageContent.zh} basePath="/zh" />
    </SiteLayout>
  );
}
