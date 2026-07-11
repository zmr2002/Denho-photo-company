import type { Metadata } from "next";
import { WorksPage } from "@/components/pages/WorksPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getWorksPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getWorksPageContent("zh");
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  };
}

export default async function Page() {
  const content = await getWorksPageContent("zh");

  return (
    <SiteLayout lang="zh" page="works" currentPath="/zh/works/">
      <WorksPage content={content} basePath="/zh" />
    </SiteLayout>
  );
}
