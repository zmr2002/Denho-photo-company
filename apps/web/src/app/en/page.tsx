import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getHomePageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photography and film production",
  description: "Photography and film production in Japan, from planning and shooting through editing and delivery.",
};

export default async function Page() {
  const content = await getHomePageContent("en");

  return (
    <SiteLayout lang="en" page="home" currentPath="/en/">
      <HomePage content={content} basePath="/en" />
    </SiteLayout>
  );
}
