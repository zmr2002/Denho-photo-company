import type { Metadata } from "next";
import { WorksPage } from "@/components/pages/WorksPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getWorksPageContent } from "@/lib/content";

const content = getWorksPageContent("en");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="en" page="works" currentPath="/en/works/">
      <WorksPage content={content} basePath="/en" />
    </SiteLayout>
  );
}
