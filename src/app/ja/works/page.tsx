import type { Metadata } from "next";
import { WorksPage } from "@/components/pages/WorksPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getWorksPageContent } from "@/lib/content";

const content = getWorksPageContent("ja");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="ja" page="works" currentPath="/ja/works/">
      <WorksPage content={content} basePath="/ja" />
    </SiteLayout>
  );
}
