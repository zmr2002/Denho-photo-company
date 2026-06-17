import type { Metadata } from "next";
import { WorksPage } from "@/components/pages/WorksPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { worksPageContent } from "@/data/pages";

export const metadata: Metadata = {
  title: worksPageContent.zh.metaTitle,
  description: worksPageContent.zh.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="zh" page="works" currentPath="/zh/works/">
      <WorksPage content={worksPageContent.zh} basePath="/zh" />
    </SiteLayout>
  );
}
