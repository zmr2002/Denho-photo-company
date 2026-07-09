import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getHomePageContent } from "@/lib/content";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} | Photography and film production`,
  description: "English mock content for local production verification.",
};

export default async function Page() {
  const content = await getHomePageContent("en");

  return (
    <SiteLayout lang="en" page="home" currentPath="/en/">
      <HomePage content={content} basePath="/en" />
    </SiteLayout>
  );
}
