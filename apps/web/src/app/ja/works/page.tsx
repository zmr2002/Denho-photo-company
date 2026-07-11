import type { Metadata } from "next";
import { WorksPage } from "@/components/pages/WorksPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getWorksPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getWorksPageContent("ja");
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  };
}

export default async function Page() {
  const content = await getWorksPageContent("ja");

  return (
    <SiteLayout lang="ja" page="works" currentPath="/ja/works/">
      <WorksPage content={content} basePath="/ja" />
    </SiteLayout>
  );
}
