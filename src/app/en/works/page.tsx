import type { Metadata } from "next";
import { WorksPage } from "@/components/pages/WorksPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getWorksPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getWorksPageContent("en");
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  };
}

export default async function Page() {
  const content = await getWorksPageContent("en");

  return (
    <SiteLayout lang="en" page="works" currentPath="/en/works/">
      <WorksPage content={content} basePath="/en" />
    </SiteLayout>
  );
}
