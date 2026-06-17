import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { homeContent } from "@/data/home";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} | 写真・映像制作`,
  description: site.description,
};

export default function Page() {
  return (
    <SiteLayout lang="ja" page="home" currentPath="/ja/">
      <HomePage content={homeContent.ja} basePath="/ja" />
    </SiteLayout>
  );
}
