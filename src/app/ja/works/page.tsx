import type { Metadata } from "next";
import { WorksPage } from "@/components/pages/WorksPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { worksPageContent } from "@/data/pages";

export const metadata: Metadata = {
  title: worksPageContent.ja.metaTitle,
  description: worksPageContent.ja.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="ja" page="works" currentPath="/ja/works/">
      <WorksPage content={worksPageContent.ja} basePath="/ja" />
    </SiteLayout>
  );
}
