import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getHomePageContent } from "@/lib/content";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${site.name} | Photography and film production`,
  description: site.description,
};

export default async function Page() {
  const content = await getHomePageContent("zh");

  return (
    <SiteLayout lang="zh" page="home" currentPath="/zh/">
      <HomePage content={content} basePath="/zh" />
    </SiteLayout>
  );
}
