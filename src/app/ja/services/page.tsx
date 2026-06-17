import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/ServicesPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { servicesPageContent } from "@/data/pages";

export const metadata: Metadata = {
  title: servicesPageContent.ja.metaTitle,
  description: servicesPageContent.ja.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="ja" page="services" currentPath="/ja/services/">
      <ServicesPage content={servicesPageContent.ja} basePath="/ja" />
    </SiteLayout>
  );
}
